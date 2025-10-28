/**
 * Type definitions for Sortr
 */

export interface Config {
	workspace: string;
	inbox: string;
	model: string;
	autoSort: boolean;
	confidenceThreshold: number;
	fileExtensions: string[];
	excludeFolders: string[];
	embeddingModel: string;
	topKSimilar: number;
	dataDir: string;
}

export interface Note {
	id: string;
	filePath: string;
	folderPath: string;
	contentPreview: string;
	createdAt: Date;
	updatedAt: Date;
	fileSize: number;
	wordCount: number;
}

export interface SimilarNote {
	id: string;
	filePath: string;
	folderPath: string;
	similarity: number;
	document: string;
}

export interface SortSuggestion {
	folder: string;
	confidence: number;
	reason: string;
}

export interface SortResult {
	success: boolean;
	from?: string;
	to?: string;
	confidence?: number;
	error?: string;
}

export interface FolderStats {
	folderPath: string;
	noteCount: number;
	keywords?: string;
	lastUpdated: Date;
}

export interface Statistics {
	totalNotes: number;
	totalFolders: number;
	totalSorts: number;
	avgConfidence30d: number;
}

export interface SortHistory {
	id: number;
	noteId: string;
	fromPath: string;
	toPath: string;
	confidence: number;
	timestamp: Date;
}

export interface AnalysisResult {
	totalNotes: number;
	folders: Record<string, FolderStats>;
	skipped: number;
}

export interface VectorEntry {
	id: string;
	embedding: number[];
	metadata: {
		filePath: string;
		folderPath: string;
		createdAt: string;
	};
}

export interface CLIOptions {
	workspace?: string;
	model?: string;
	auto?: boolean;
	dryRun?: boolean;
	verbose?: boolean;
	reAnalyze?: boolean;
	confidence?: number;
	interval?: number;
}

export type EmbeddingFunction = (text: string) => Promise<number[]>;
