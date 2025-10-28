/**
 * Core note sorting logic using local LLM
 */

import {
	readFileSync,
	renameSync,
	mkdirSync,
	existsSync,
	readdirSync,
} from "fs";
import { join, basename, extname } from "path";
import chalk from "chalk";
import ollama from "ollama";
import * as prompts from "@clack/prompts";
import type { ConfigManager } from "./config";
import type { MemoryManager } from "./memory";
import type { WorkspaceAnalyzer } from "./analyzer";
import type { SortSuggestion, SortResult } from "./types";

export class NoteSorter {
	constructor(
		private config: ConfigManager,
		private memory: MemoryManager,
		private analyzer: WorkspaceAnalyzer
	) {}

	async sortNote(
		notePath: string,
		auto: boolean = false,
		dryRun: boolean = false
	): Promise<SortResult> {
		// Read note content
		let content: string;
		try {
			content = readFileSync(notePath, "utf-8");
		} catch (error) {
			console.log(chalk.red(`Error reading ${basename(notePath)}:`), error);
			return { success: false, error: "Failed to read file" };
		}

		// Check if content is too short
		if (content.trim().length < 10) {
			console.log(
				chalk.yellow(`⚠️  Note too short to sort: ${basename(notePath)}`)
			);
			return { success: false, error: "Content too short" };
		}

		// Find similar notes
		const similarNotes = await this.memory.findSimilarNotes(
			content,
			this.config.get().topKSimilar
		);

		// Get folder structure
		const folderStructure = this.analyzer.getFolderSummary();

		// Get suggestion from LLM
		const suggestion = await this.getSuggestion(
			content,
			similarNotes,
			folderStructure,
			basename(notePath)
		);

		if (!suggestion.folder) {
			console.log(
				chalk.red(`✗ Could not determine folder for: ${basename(notePath)}`)
			);
			return { success: false, error: "No suggestion" };
		}

		// Check confidence threshold
		const threshold = this.config.get().confidenceThreshold;
		if (suggestion.confidence < threshold) {
			console.log(
				chalk.yellow(
					`\n⚠️  Low confidence (${(suggestion.confidence * 100).toFixed(
						0
					)}%) for: ${basename(notePath)}`
				)
			);
			console.log(`   Suggested: ${suggestion.folder}`);
			console.log(`   Reason: ${suggestion.reason}`);

			if (!auto) {
				const proceed = await prompts.confirm({
					message: "Proceed anyway?",
				});

				if (prompts.isCancel(proceed) || !proceed) {
					return { success: false, error: "User cancelled" };
				}
			}
		}

		// Show suggestion
		console.log(chalk.cyan(`\n📄 ${basename(notePath)}`));
		console.log(
			`   → ${chalk.green(suggestion.folder)} (confidence: ${(
				suggestion.confidence * 100
			).toFixed(0)}%)`
		);

		if (suggestion.reason) {
			console.log(`   💡 ${suggestion.reason}`);
		}

		// Dry run - don't actually move
		if (dryRun) {
			console.log(chalk.dim("   (dry run - not moved)"));
			return {
				success: true,
				from: notePath,
				to: join(
					this.config.getWorkspacePath(),
					suggestion.folder,
					basename(notePath)
				),
				confidence: suggestion.confidence,
			};
		}

		// Ask for confirmation if not auto mode
		if (!auto) {
			const confirm = await prompts.confirm({
				message: "Move note?",
				initialValue: true,
			});

			if (prompts.isCancel(confirm) || !confirm) {
				return { success: false, error: "User cancelled" };
			}
		}

		// Move the note
		const destination = this.moveNote(notePath, suggestion.folder);

		if (destination) {
			// Record the sort
			this.memory.recordSort(
				notePath,
				notePath,
				destination,
				suggestion.confidence
			);

			// Add to memory
			try {
				const newContent = readFileSync(destination, "utf-8");
				const folderPath = suggestion.folder;
				await this.memory.addNote(destination, newContent, folderPath);
			} catch (error) {
				console.log(chalk.yellow("Warning: Could not update memory:"), error);
			}

			console.log(chalk.green("   ✓ Moved successfully"));

			return {
				success: true,
				from: notePath,
				to: destination,
				confidence: suggestion.confidence,
			};
		}

		return { success: false, error: "Failed to move file" };
	}

	private async getSuggestion(
		content: string,
		similarNotes: any[],
		folderStructure: string,
		filename: string
	): Promise<SortSuggestion> {
		// Build context from similar notes
		let similarContext = "";
		if (similarNotes.length > 0) {
			similarContext = "Similar existing notes are stored in:\n";
			for (let i = 0; i < Math.min(3, similarNotes.length); i++) {
				const note = similarNotes[i];
				const similarity = (note.similarity * 100).toFixed(0);
				similarContext += `${i + 1}. ${
					note.folderPath
				} (similarity: ${similarity}%)\n`;
			}
		}

		// Build prompt for LLM
		const prompt = `You are a note organization assistant. Analyze this note and suggest the best folder.

FOLDER STRUCTURE:
${folderStructure}

${similarContext}

NOTE FILENAME: ${filename}

NOTE CONTENT:
${content.substring(0, 1000)}

Based on the content, folder structure, and similar notes, suggest the EXACT folder path where this note should be stored. Consider:
- Content topic and theme
- Where similar notes are stored
- Existing folder structure
- Note filename

Respond in this exact format:
FOLDER: <folder_path>
CONFIDENCE: <0-100>
REASON: <one sentence explanation>

Example:
FOLDER: projects/work/meetings
CONFIDENCE: 85
REASON: Content discusses project planning and matches existing meeting notes`;

		try {
			// Call Ollama
			const response = await ollama.chat({
				model: this.config.get().model,
				messages: [
					{
						role: "system",
						content:
							"You are a precise note organization assistant. Always follow the exact output format requested.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
			});

			// Parse response
			return this.parseLLMResponse(response.message.content);
		} catch (error) {
			console.log(chalk.red("Error calling LLM:"), error);

			// Fallback: use most common folder from similar notes
			if (similarNotes.length > 0) {
				const folders = similarNotes.map((n) => n.folderPath);
				const mostCommon = folders.reduce((a, b, i, arr) =>
					arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length
						? a
						: b
				);
				return {
					folder: mostCommon,
					confidence: 0.5,
					reason: "Fallback: based on similar notes",
				};
			}

			return { folder: "", confidence: 0, reason: "" };
		}
	}

	private parseLLMResponse(response: string): SortSuggestion {
		let folder = "";
		let confidence = 0;
		let reason = "";

		const lines = response.trim().split("\n");

		for (const line of lines) {
			const trimmed = line.trim();

			if (trimmed.startsWith("FOLDER:")) {
				folder = trimmed.replace("FOLDER:", "").trim();
			} else if (trimmed.startsWith("CONFIDENCE:")) {
				const confStr = trimmed
					.replace("CONFIDENCE:", "")
					.trim()
					.replace("%", "");
				confidence = parseFloat(confStr) / 100;
			} else if (trimmed.startsWith("REASON:")) {
				reason = trimmed.replace("REASON:", "").trim();
			}
		}

		return { folder, confidence, reason };
	}

	private moveNote(
		sourcePath: string,
		destinationFolder: string
	): string | null {
		try {
			// Build destination path
			const workspace = this.config.getWorkspacePath();
			const destFolder = join(workspace, destinationFolder);

			// Create folder if it doesn't exist
			if (!existsSync(destFolder)) {
				mkdirSync(destFolder, { recursive: true });
			}

			let destination = join(destFolder, basename(sourcePath));

			// Handle name conflicts
			if (existsSync(destination)) {
				const name = basename(sourcePath, extname(sourcePath));
				const ext = extname(sourcePath);
				let counter = 1;
				while (existsSync(destination)) {
					destination = join(destFolder, `${name}_${counter}${ext}`);
					counter++;
				}
			}

			// Move file
			renameSync(sourcePath, destination);
			return destination;
		} catch (error) {
			console.log(chalk.red("Error moving file:"), error);
			return null;
		}
	}

	async sortInbox(
		auto: boolean = false,
		dryRun: boolean = false
	): Promise<Record<string, number>> {
		const inbox = this.config.getInboxPath();

		if (!existsSync(inbox)) {
			console.log(chalk.yellow(`⚠️  Inbox not found: ${inbox}`));
			console.log("    Creating inbox folder...");
			mkdirSync(inbox, { recursive: true });
			return { sorted: 0, failed: 0, skipped: 0 };
		}

		// Find notes in inbox
		const files = readdirSync(inbox);
		const notes = files.filter((f) => {
			const fullPath = join(inbox, f);
			return existsSync(fullPath) && this.config.isValidFile(fullPath);
		});

		if (notes.length === 0) {
			console.log(chalk.yellow("📭 Inbox is empty"));
			return { sorted: 0, failed: 0, skipped: 0 };
		}

		console.log(
			chalk.blue(`\n📥 Sorting ${notes.length} note(s) from inbox...`)
		);

		let sorted = 0;
		let failed = 0;
		let skipped = 0;

		for (const note of notes) {
			const notePath = join(inbox, note);
			const result = await this.sortNote(notePath, auto, dryRun);

			if (result.success) {
				sorted++;
			} else if (
				result.error === "User cancelled" ||
				result.error === "Content too short"
			) {
				skipped++;
			} else {
				failed++;
			}
		}

		// Summary
		console.log(chalk.green("\n✨ Complete!"));
		console.log(`  • Sorted: ${sorted}`);
		console.log(`  • Skipped: ${skipped}`);
		console.log(`  • Failed: ${failed}`);

		return { sorted, failed, skipped };
	}

	undoLastSort(): boolean {
		const lastSort = this.memory.getLastSort();

		if (!lastSort) {
			console.log(chalk.yellow("⚠️  No recent sorts to undo"));
			return false;
		}

		if (!existsSync(lastSort.toPath)) {
			console.log(chalk.red(`✗ File not found: ${lastSort.toPath}`));
			return false;
		}

		try {
			// Ensure source directory exists
			const sourceDir = lastSort.fromPath.substring(
				0,
				lastSort.fromPath.lastIndexOf("/")
			);
			if (!existsSync(sourceDir)) {
				mkdirSync(sourceDir, { recursive: true });
			}

			// Move back
			renameSync(lastSort.toPath, lastSort.fromPath);

			console.log(chalk.green(`✓ Undone: ${basename(lastSort.toPath)}`));
			console.log(`   Moved back to: ${sourceDir}`);
			return true;
		} catch (error) {
			console.log(chalk.red("Error undoing sort:"), error);
			return false;
		}
	}
}
