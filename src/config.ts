/**
 * Configuration management for Sortr
 */

import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { join, resolve } from "path";
import yaml from "js-yaml";
import type { Config } from "./types";

const DEFAULT_CONFIG: Config = {
	workspace: join(homedir(), "notes"),
	inbox: "inbox",
	model: "llama3.2:3b",
	autoSort: false,
	confidenceThreshold: 0.7,
	fileExtensions: [".md", ".txt", ".org"],
	excludeFolders: [".git", ".obsidian", "archive", ".trash"],
	embeddingModel: "Xenova/all-MiniLM-L6-v2",
	topKSimilar: 5,
	dataDir: join(homedir(), ".sortr"),
};

export class ConfigManager {
	private config: Config;
	private configPath: string;

	constructor(configPath?: string) {
		this.configPath = configPath || join(homedir(), ".sortr", "config.yaml");
		this.config = DEFAULT_CONFIG;
	}

	async load(): Promise<Config> {
		try {
			if (existsSync(this.configPath)) {
				const content = await readFile(this.configPath, "utf-8");
				const loaded = yaml.load(content) as Partial<Config>;
				this.config = { ...DEFAULT_CONFIG, ...loaded };
			}
		} catch (error) {
			console.warn("Failed to load config, using defaults:", error);
		}
		return this.config;
	}

	async save(): Promise<void> {
		const dir = this.configPath.substring(0, this.configPath.lastIndexOf("/"));
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		const content = yaml.dump(this.config);
		await writeFile(this.configPath, content, "utf-8");
	}

	get(): Config {
		return this.config;
	}

	update(partial: Partial<Config>): void {
		this.config = { ...this.config, ...partial };
	}

	getWorkspacePath(): string {
		return resolve(this.config.workspace.replace(/^~/, homedir()));
	}

	getInboxPath(): string {
		if (this.config.inbox.startsWith("/")) {
			return this.config.inbox;
		}
		return join(this.getWorkspacePath(), this.config.inbox);
	}

	getDataPath(): string {
		return resolve(this.config.dataDir.replace(/^~/, homedir()));
	}

	isExcludedFolder(folderPath: string): boolean {
		const parts = folderPath.split("/");
		return this.config.excludeFolders.some((excluded) =>
			parts.includes(excluded)
		);
	}

	isValidFile(filePath: string): boolean {
		return this.config.fileExtensions.some((ext) => filePath.endsWith(ext));
	}
}

export function getDefaultConfig(): Config {
	return { ...DEFAULT_CONFIG };
}
