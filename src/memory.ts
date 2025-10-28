/**
 * Memory management using Bun's built-in SQLite and vector store
 */

import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { VectorStore } from "./vector-store";
import { createEmbeddingFunction } from "./embeddings";
import type {
	Note,
	SimilarNote,
	FolderStats,
	Statistics,
	SortHistory,
	EmbeddingFunction,
} from "./types";

export class MemoryManager {
	private db: Database;
	private vectorStore: VectorStore;
	private embedFn: EmbeddingFunction | null = null;
	private dataDir: string;

	constructor(dataDir: string) {
		this.dataDir = dataDir;

		// Ensure data directory exists
		if (!existsSync(dataDir)) {
			mkdirSync(dataDir, { recursive: true });
		}

		// Initialize SQLite database
		const dbPath = join(dataDir, "metadata.db");
		this.db = new Database(dbPath);

		// Initialize vector store
		const vectorPath = join(dataDir, "vectors.json");
		this.vectorStore = new VectorStore(vectorPath);

		this.initDatabase();
	}

	private initDatabase(): void {
		// Create tables
		this.db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        folder_path TEXT NOT NULL,
        content_preview TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        file_size INTEGER,
        word_count INTEGER
      )
    `);

		this.db.run(`
      CREATE TABLE IF NOT EXISTS sort_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id TEXT,
        from_path TEXT,
        to_path TEXT,
        confidence REAL,
        timestamp INTEGER,
        FOREIGN KEY (note_id) REFERENCES notes(id)
      )
    `);

		this.db.run(`
      CREATE TABLE IF NOT EXISTS folder_stats (
        folder_path TEXT PRIMARY KEY,
        note_count INTEGER,
        keywords TEXT,
        last_updated INTEGER
      )
    `);
	}

	async initialize(embeddingModel?: string): Promise<void> {
		// Load vector store
		await this.vectorStore.load();

		// Initialize embedding function
		this.embedFn = await createEmbeddingFunction(embeddingModel);
	}

	async addNote(
		filePath: string,
		content: string,
		folderPath: string
	): Promise<void> {
		const noteId = filePath;

		// Create embedding
		if (!this.embedFn) {
			throw new Error("Embedding function not initialized");
		}

		const embedding = await this.embedFn(content);

		// Add to vector store
		this.vectorStore.add({
			id: noteId,
			embedding,
			metadata: {
				filePath,
				folderPath,
				createdAt: new Date().toISOString(),
			},
		});

		// Save vector store
		await this.vectorStore.save();

		// Add to SQLite
		const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO notes
      (id, file_path, folder_path, content_preview, created_at, updated_at, file_size, word_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

		const now = Date.now();
		stmt.run(
			noteId,
			filePath,
			folderPath,
			content.substring(0, 200),
			now,
			now,
			content.length,
			content.split(/\s+/).length
		);

		this.updateFolderStats(folderPath);
	}

	async findSimilarNotes(
		content: string,
		topK: number = 5
	): Promise<SimilarNote[]> {
		if (!this.embedFn) {
			throw new Error("Embedding function not initialized");
		}

		const embedding = await this.embedFn(content);
		const results = await this.vectorStore.query(embedding, topK);

		// Enrich with content preview from database
		return results.map((result) => {
			const note = this.db
				.prepare("SELECT content_preview FROM notes WHERE id = ?")
				.get(result.id) as { content_preview: string } | undefined;

			return {
				...result,
				document: note?.content_preview || "",
			};
		});
	}

	getFolderStructure(): Record<string, FolderStats> {
		const stmt = this.db.prepare(`
      SELECT folder_path, COUNT(*) as count
      FROM notes
      GROUP BY folder_path
      ORDER BY count DESC
    `);

		const rows = stmt.all() as Array<{ folder_path: string; count: number }>;

		const structure: Record<string, FolderStats> = {};
		for (const row of rows) {
			structure[row.folder_path] = {
				folderPath: row.folder_path,
				noteCount: row.count,
				lastUpdated: new Date(),
			};
		}

		return structure;
	}

	private updateFolderStats(folderPath: string): void {
		const count = this.db
			.prepare("SELECT COUNT(*) as count FROM notes WHERE folder_path = ?")
			.get(folderPath) as { count: number };

		this.db
			.prepare(
				`
        INSERT OR REPLACE INTO folder_stats
        (folder_path, note_count, last_updated)
        VALUES (?, ?, ?)
      `
			)
			.run(folderPath, count.count, Date.now());
	}

	recordSort(
		noteId: string,
		fromPath: string,
		toPath: string,
		confidence: number
	): void {
		this.db
			.prepare(
				`
        INSERT INTO sort_history (note_id, from_path, to_path, confidence, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `
			)
			.run(noteId, fromPath, toPath, confidence, Date.now());
	}

	getLastSort(): SortHistory | null {
		const result = this.db
			.prepare(
				`
        SELECT * FROM sort_history
        ORDER BY id DESC
        LIMIT 1
      `
			)
			.get() as SortHistory | undefined;

		return result || null;
	}

	getStats(): Statistics {
		const totalNotes = (
			this.db.prepare("SELECT COUNT(*) as count FROM notes").get() as {
				count: number;
			}
		).count;

		const totalFolders = (
			this.db
				.prepare("SELECT COUNT(DISTINCT folder_path) as count FROM notes")
				.get() as { count: number }
		).count;

		const totalSorts = (
			this.db.prepare("SELECT COUNT(*) as count FROM sort_history").get() as {
				count: number;
			}
		).count;

		const avgConfidenceResult = this.db
			.prepare(
				`
        SELECT AVG(confidence) as avg
        FROM sort_history
        WHERE timestamp > ?
      `
			)
			.get(Date.now() - 30 * 24 * 60 * 60 * 1000) as { avg: number | null };

		return {
			totalNotes,
			totalFolders,
			totalSorts,
			avgConfidence30d: avgConfidenceResult.avg || 0,
		};
	}

	clear(): void {
		this.db.run("DELETE FROM notes");
		this.db.run("DELETE FROM sort_history");
		this.db.run("DELETE FROM folder_stats");
		this.vectorStore.clear();
	}

	close(): void {
		this.db.close();
	}
}
