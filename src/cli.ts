#!/usr/bin/env bun

/**
 * Command-line interface for Sortr
 */

import { Command } from "commander";
import * as prompts from "@clack/prompts";
import chalk from "chalk";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { watch } from "chokidar";
import { ConfigManager } from "./config";
import { MemoryManager } from "./memory";
import { WorkspaceAnalyzer } from "./analyzer";
import { NoteSorter } from "./sorter";
import type { CLIOptions } from "./types";

const program = new Command();

program
	.name("sortr")
	.description("AI-powered local note organization")
	.version("0.1.0");

// Init command
program
	.command("init")
	.description("Initialize workspace and learn folder structure")
	.argument("[workspace]", "Path to your notes directory")
	.option("--model <model>", "Ollama model to use", "llama3.2:3b")
	.option("--verbose", "Show detailed progress")
	.option("--re-analyze", "Clear and re-analyze workspace")
	.action(async (workspace: string | undefined, options: CLIOptions) => {
		prompts.intro(chalk.cyan("🚀 Sortr - Initialize"));

		const config = new ConfigManager();
		await config.load();

		// Set workspace
		if (workspace) {
			config.update({ workspace });
		}

		const workspacePath = config.getWorkspacePath();

		if (!existsSync(workspacePath)) {
			const create = await prompts.confirm({
				message: `Workspace not found. Create ${workspacePath}?`,
				initialValue: true,
			});

			if (prompts.isCancel(create) || !create) {
				prompts.cancel("Operation cancelled");
				process.exit(0);
			}

			mkdirSync(workspacePath, { recursive: true });
			mkdirSync(config.getInboxPath(), { recursive: true });
			console.log(chalk.green("✓"), `Created workspace: ${workspacePath}`);
		}

		// Update config
		if (options.model) {
			config.update({ model: options.model });
		}
		await config.save();

		console.log(chalk.blue("\n📚 Configuration"));
		console.log(`   Workspace: ${workspacePath}`);
		console.log(`   Model: ${config.get().model}`);

		// Check Ollama
		const s = prompts.spinner();
		s.start("Checking Ollama...");

		try {
			const ollama = await import("ollama");
			await ollama.default.list();
			s.stop(chalk.green("✓ Ollama is running"));
		} catch (error) {
			s.stop(chalk.red("✗ Ollama not available"));
			console.log(chalk.yellow("\nInstall Ollama: https://ollama.com"));
			prompts.outro(chalk.red("Setup incomplete"));
			process.exit(1);
		}

		// Initialize components
		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize(config.get().embeddingModel);
		const analyzer = new WorkspaceAnalyzer(config, memory);

		// Analyze workspace
		if (options.reAnalyze) {
			await analyzer.reAnalyze(options.verbose || false);
		} else {
			await analyzer.analyze(options.verbose || false);
		}

		prompts.outro(chalk.green("✅ Initialization complete!"));
		console.log("\nNext steps:");
		console.log(`  1. Add notes to: ${chalk.cyan(config.getInboxPath())}`);
		console.log(`  2. Run: ${chalk.cyan("sortr sort")}`);
	});

// Sort command
program
	.command("sort")
	.description("Sort notes from inbox to appropriate folders")
	.option("--auto", "Auto-sort without confirmation")
	.option("--dry-run", "Preview without moving files")
	.option("--verbose", "Show detailed output")
	.action(async (options: CLIOptions) => {
		const config = new ConfigManager();
		await config.load();

		if (!existsSync(config.getWorkspacePath())) {
			console.log(chalk.red("✗ Workspace not initialized"));
			console.log(`Run: ${chalk.cyan("sortr init")}`);
			process.exit(1);
		}

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize(config.get().embeddingModel);
		const analyzer = new WorkspaceAnalyzer(config, memory);
		const sorter = new NoteSorter(config, memory, analyzer);

		// Check if memory is empty
		const stats = memory.getStats();
		if (stats.totalNotes === 0) {
			console.log(chalk.yellow("⚠️  No notes in memory"));
			console.log(`Run: ${chalk.cyan("sortr init")}`);
			process.exit(1);
		}

		// Sort inbox
		await sorter.sortInbox(options.auto || false, options.dryRun || false);
	});

// Watch command
program
	.command("watch")
	.description("Watch inbox and auto-sort new notes")
	.option("--interval <seconds>", "Check interval", "5")
	.action(async (options: CLIOptions) => {
		const config = new ConfigManager();
		await config.load();

		if (!existsSync(config.getWorkspacePath())) {
			console.log(chalk.red("✗ Workspace not initialized"));
			console.log(`Run: ${chalk.cyan("sortr init")}`);
			process.exit(1);
		}

		const inbox = config.getInboxPath();
		if (!existsSync(inbox)) {
			mkdirSync(inbox, { recursive: true });
		}

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize(config.get().embeddingModel);
		const analyzer = new WorkspaceAnalyzer(config, memory);
		const sorter = new NoteSorter(config, memory, analyzer);

		// Check if memory is empty
		const stats = memory.getStats();
		if (stats.totalNotes === 0) {
			console.log(chalk.yellow("⚠️  No notes in memory"));
			console.log(`Run: ${chalk.cyan("sortr init")}`);
			process.exit(1);
		}

		console.log(chalk.blue("\n👀 Watching inbox:"), inbox);
		console.log("   Press Ctrl+C to stop\n");

		const processing = new Set<string>();

		// Watch for new files
		const watcher = watch(inbox, {
			ignoreInitial: true,
			awaitWriteFinish: {
				stabilityThreshold: 500,
				pollInterval: 100,
			},
		});

		watcher.on("add", async (filePath: string) => {
			// Check if valid file
			if (!config.isValidFile(filePath)) {
				return;
			}

			// Avoid processing same file multiple times
			if (processing.has(filePath)) {
				return;
			}

			processing.add(filePath);

			try {
				console.log(
					chalk.cyan(`\n🔔 New note detected:`),
					filePath.split("/").pop()
				);
				await sorter.sortNote(filePath, true, false);
			} finally {
				processing.delete(filePath);
			}
		});

		// Handle graceful shutdown
		process.on("SIGINT", () => {
			console.log(chalk.yellow("\n\n⏸️  Stopping watcher..."));
			watcher.close();
			console.log(chalk.green("✓ Stopped"));
			process.exit(0);
		});
	});

// Stats command
program
	.command("stats")
	.description("Show statistics about sorted notes")
	.action(async () => {
		const config = new ConfigManager();
		await config.load();

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize();

		const stats = memory.getStats();
		const folderStructure = memory.getFolderStructure();

		console.log(chalk.cyan("\n📊 Sortr Statistics"));
		console.log(chalk.gray("─".repeat(50)));
		console.log(`Total Notes:       ${chalk.green(stats.totalNotes)}`);
		console.log(`Total Folders:     ${chalk.green(stats.totalFolders)}`);
		console.log(`Total Sorts:       ${chalk.green(stats.totalSorts)}`);
		console.log(
			`Avg Confidence:    ${chalk.green(
				(stats.avgConfidence30d * 100).toFixed(0) + "%"
			)} (30d)`
		);

		if (Object.keys(folderStructure).length > 0) {
			console.log(chalk.cyan("\n📁 Top Folders:"));
			const sorted = Object.entries(folderStructure)
				.sort((a, b) => b[1].noteCount - a[1].noteCount)
				.slice(0, 10);

			for (const [folder, data] of sorted) {
				console.log(`  • ${folder}: ${chalk.green(data.noteCount)} notes`);
			}
		}

		console.log();
	});

// Undo command
program
	.command("undo")
	.description("Undo the last sort operation")
	.action(async () => {
		const config = new ConfigManager();
		await config.load();

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize();
		const analyzer = new WorkspaceAnalyzer(config, memory);
		const sorter = new NoteSorter(config, memory, analyzer);

		sorter.undoLastSort();
	});

// Move command
program
	.command("move <file>")
	.description("Sort a specific note file")
	.option("--auto", "Auto-move without confirmation")
	.action(async (file: string, options: CLIOptions) => {
		const config = new ConfigManager();
		await config.load();

		if (!existsSync(file)) {
			console.log(chalk.red("✗ File not found:"), file);
			process.exit(1);
		}

		if (!config.isValidFile(file)) {
			console.log(
				chalk.red("✗ Invalid file type. Supported:"),
				config.get().fileExtensions.join(", ")
			);
			process.exit(1);
		}

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize(config.get().embeddingModel);
		const analyzer = new WorkspaceAnalyzer(config, memory);
		const sorter = new NoteSorter(config, memory, analyzer);

		await sorter.sortNote(file, options.auto || false, false);
	});

// Reset command
program
	.command("reset")
	.description("Clear all memory and statistics")
	.action(async () => {
		const confirm = await prompts.confirm({
			message:
				"Are you sure you want to reset all memory? This cannot be undone.",
			initialValue: false,
		});

		if (prompts.isCancel(confirm) || !confirm) {
			prompts.cancel("Operation cancelled");
			process.exit(0);
		}

		const config = new ConfigManager();
		await config.load();

		const memory = new MemoryManager(config.getDataPath());
		await memory.initialize();

		memory.clear();
		console.log(chalk.green("✓ Memory cleared"));
		console.log(`Run ${chalk.cyan("sortr init")} to re-analyze workspace`);
	});

// Config command
program
	.command("config")
	.description("Show current configuration")
	.action(async () => {
		const config = new ConfigManager();
		await config.load();
		const cfg = config.get();

		console.log(chalk.cyan("\n⚙️  Configuration"));
		console.log(chalk.gray("─".repeat(50)));
		console.log(
			`Workspace:            ${chalk.green(config.getWorkspacePath())}`
		);
		console.log(`Inbox:                ${chalk.green(config.getInboxPath())}`);
		console.log(`Model:                ${chalk.green(cfg.model)}`);
		console.log(
			`Confidence Threshold: ${chalk.green(
				(cfg.confidenceThreshold * 100).toFixed(0) + "%"
			)}`
		);
		console.log(`Auto Sort:            ${chalk.green(cfg.autoSort)}`);
		console.log(
			`File Extensions:      ${chalk.green(cfg.fileExtensions.join(", "))}`
		);
		console.log(`Data Directory:       ${chalk.green(config.getDataPath())}`);
		console.log();
	});

// Parse and execute
program.parse();
