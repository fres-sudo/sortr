# Architecture Guide

Understanding how Sortr works under the hood.

## Overview

Sortr is built with TypeScript and Bun, focusing on performance, type safety, and modern development practices.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│   CLI Interface  │───▶│  Configuration  │
│   (Commands)    │    │   (Commander)    │    │    Manager      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ File Operations │◀───│   Sortr    │◀───│  Memory Manager │
│   (Move/Copy)   │    │   (AI Logic)     │    │ (Vectors + DB)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         │
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Workspace        │    │   Embeddings    │
                       │ Analyzer         │    │   (Trans.js)    │
                       └──────────────────┘    └─────────────────┘
                                │                         │
                       ┌──────────────────┐    ┌─────────────────┐
                       │     Ollama       │    │  Vector Store   │
                       │   (LLM API)      │    │   (Custom)      │
                       └──────────────────┘    └─────────────────┘
```

## Core Components

### 1. CLI Interface (`src/cli.ts`)

The command-line interface built with Commander.js and Clack for beautiful prompts.

**Key responsibilities:**

- Parse command arguments
- Handle user input/output
- Route commands to appropriate handlers
- Display progress and results

**Technology stack:**

- Commander.js for command parsing
- Clack for interactive prompts
- Chalk for colored output
- Ora for spinners

```typescript
// Example CLI structure
import { Command } from "commander";
import * as clack from "@clack/prompts";

const program = new Command();

program
	.command("sort")
	.option("--auto", "Skip confirmation")
	.action(async (options) => {
		await sortCommand(options);
	});
```

### 2. Configuration Manager (`src/config.ts`)

Handles all configuration loading, validation, and management.

**Features:**

- YAML configuration files
- Environment variable overrides
- Schema validation
- Default fallbacks

```typescript
interface Config {
	workspace_path: string;
	model: string;
	confidence_threshold: number;
	// ... other settings
}

class ConfigManager {
	private config: Config;

	async load(configPath?: string): Promise<Config> {
		// Load from file, env vars, defaults
	}

	validate(config: Config): boolean {
		// Validate configuration schema
	}
}
```

### 3. Memory Manager (`src/memory.ts`)

Manages vector embeddings and metadata storage for learning user preferences.

**Components:**

- **Vector Store**: Custom implementation for similarity search
- **Metadata Database**: Bun SQLite for file metadata
- **Embedding Cache**: Cache embeddings for performance

```typescript
class MemoryManager {
	private vectorStore: VectorStore;
	private db: Database;

	async addNote(path: string, content: string): Promise<void> {
		const embedding = await this.getEmbedding(content);
		await this.vectorStore.add(path, embedding);
		await this.db.run("INSERT INTO notes ...");
	}

	async findSimilar(content: string, k: number): Promise<SimilarNote[]> {
		const embedding = await this.getEmbedding(content);
		return this.vectorStore.search(embedding, k);
	}
}
```

### 4. Workspace Analyzer (`src/analyzer.ts`)

Analyzes the existing note organization to understand user patterns.

**Analysis includes:**

- Folder structure patterns
- File naming conventions
- Content categorization
- Historical sorting decisions

```typescript
class WorkspaceAnalyzer {
	async analyzeStructure(workspacePath: string): Promise<WorkspaceStructure> {
		// Scan folders and files
		// Analyze naming patterns
		// Generate structure representation
	}

	async categorizeContent(content: string): Promise<Category[]> {
		// Use embeddings to categorize
		// Apply learned patterns
	}
}
```

### 5. Sortr (`src/sorter.ts`)

The core sorting logic that combines AI analysis with user patterns.

**Process:**

1. Analyze note content
2. Find similar existing notes
3. Use LLM to determine best location
4. Apply confidence thresholds
5. Execute or suggest moves

```typescript
class NoteSorter {
	async sortNote(notePath: string): Promise<SortingSuggestion> {
		const content = await this.readNote(notePath);
		const embedding = await this.getEmbedding(content);

		// Find similar notes
		const similar = await this.memory.findSimilar(content, 5);

		// Get LLM suggestion
		const suggestion = await this.getLLMSuggestion(content, similar);

		// Calculate confidence
		const confidence = this.calculateConfidence(suggestion, similar);

		return { destination: suggestion.path, confidence };
	}
}
```

## Data Flow

### 1. Initialization Flow

```
User runs: sortr init ~/notes
                │
                ▼
   ┌─────────────────────────┐
   │  Parse CLI Arguments    │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Load Configuration    │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │  Analyze Workspace      │
   │  - Scan folders         │
   │  - Index existing notes │
   │  - Generate embeddings  │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │  Initialize Databases   │
   │  - Vector store         │
   │  - Metadata DB          │
   └─────────────────────────┘
```

### 2. Sorting Flow

```
User runs: sortr sort
                │
                ▼
   ┌─────────────────────────┐
   │  Scan Inbox Directory   │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   For Each Note File    │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Extract Content       │
   │   Generate Embedding    │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Find Similar Notes    │
   │   (Vector Search)       │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Query LLM for         │
   │   Sorting Decision      │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Calculate Confidence  │
   │   Apply Thresholds      │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Execute Move or       │
   │   Ask User Confirmation │
   └─────────────────────────┘
```

### 3. Watch Mode Flow

```
User runs: sortr watch
                │
                ▼
   ┌─────────────────────────┐
   │   Start File Watcher    │
   │   (Monitor inbox)       │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   File Change Detected  │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Debounce Changes      │
   │   (Wait for stability)  │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Process New Files     │
   │   (Same as sort flow)   │
   └─────────────────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   Continue Monitoring   │
   └─────────────────────────┘
```

## Storage Systems

### Vector Store (`src/lib/vector-store.ts`)

Custom vector storage optimized for file similarity search.

```typescript
interface VectorStore {
	// Add vector with metadata
	add(id: string, vector: number[], metadata?: any): Promise<void>;

	// Search for similar vectors
	search(
		query: number[],
		k: number,
		threshold?: number
	): Promise<SearchResult[]>;

	// Update existing vector
	update(id: string, vector: number[]): Promise<void>;

	// Remove vector
	remove(id: string): Promise<void>;

	// Get vector by ID
	get(id: string): Promise<VectorRecord | null>;
}
```

**Implementation details:**

- Uses flat file storage for vectors
- Cosine similarity for search
- In-memory index for performance
- Persistent storage with SQLite

### Metadata Database

Stores file metadata and sorting history.

```sql
-- Files table
CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  hash TEXT NOT NULL,
  size INTEGER,
  created_at DATETIME,
  updated_at DATETIME
);

-- Sorting history
CREATE TABLE sort_history (
  id INTEGER PRIMARY KEY,
  file_id INTEGER,
  from_path TEXT,
  to_path TEXT,
  confidence REAL,
  timestamp DATETIME,
  FOREIGN KEY (file_id) REFERENCES files(id)
);

-- User feedback
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  file_id INTEGER,
  expected_path TEXT,
  actual_path TEXT,
  was_correct BOOLEAN,
  timestamp DATETIME,
  FOREIGN KEY (file_id) REFERENCES files(id)
);
```

## AI Integration

### Ollama Integration

Communication with local LLM through REST API.

```typescript
class OllamaClient {
	private baseUrl: string;
	private timeout: number;

	async generate(
		model: string,
		prompt: string,
		options?: GenerateOptions
	): Promise<string> {
		const response = await fetch(`${this.baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model,
				prompt,
				stream: false,
				options,
			}),
		});

		const data = await response.json();
		return data.response;
	}
}
```

### Embedding Generation

Uses Transformers.js for local embedding generation.

```typescript
import { pipeline } from "@xenova/transformers";

class EmbeddingGenerator {
	private model: any;

	async initialize(modelName: string): Promise<void> {
		this.model = await pipeline("feature-extraction", modelName);
	}

	async generate(text: string): Promise<number[]> {
		const result = await this.model(text, {
			pooling: "mean",
			normalize: true,
		});

		return Array.from(result.data);
	}
}
```

### Prompt Engineering

Structured prompts for consistent LLM responses.

```typescript
const SORTING_PROMPT = `
You are a note organization assistant. Analyze this note and suggest where it should be filed.

Note content:
"""
{content}
"""

Existing similar notes:
{similar_notes}

Current folder structure:
{folder_structure}

Suggest the best folder path for this note. Consider:
1. Content topic and type
2. Where similar notes are located
3. Existing organization patterns

Respond with just the folder path, like: work/projects/project-alpha
`;
```

## Performance Optimizations

### 1. Caching Strategy

```typescript
class CacheManager {
	private embeddings = new Map<string, number[]>();
	private llmResponses = new Map<string, string>();

	async getEmbedding(text: string): Promise<number[]> {
		const hash = this.hash(text);
		if (this.embeddings.has(hash)) {
			return this.embeddings.get(hash)!;
		}

		const embedding = await this.generateEmbedding(text);
		this.embeddings.set(hash, embedding);
		return embedding;
	}
}
```

### 2. Batch Processing

```typescript
async processBatch(files: string[], batchSize: number = 10): Promise<void> {
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    // Process batch in parallel
    const promises = batch.map(file => this.processFile(file));
    await Promise.all(promises);

    // Brief pause between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

### 3. Lazy Loading

```typescript
class LazyVectorStore {
	private vectors: Map<string, number[]> | null = null;

	private async ensureLoaded(): Promise<void> {
		if (!this.vectors) {
			this.vectors = await this.loadVectors();
		}
	}

	async search(query: number[], k: number): Promise<SearchResult[]> {
		await this.ensureLoaded();
		return this.performSearch(query, k);
	}
}
```

## Error Handling

### Graceful Degradation

```typescript
class RobustSorter {
	async sortNote(notePath: string): Promise<SortingSuggestion> {
		try {
			// Try AI-powered sorting
			return await this.aiSort(notePath);
		} catch (aiError) {
			console.warn("AI sorting failed, falling back to rule-based:", aiError);

			try {
				// Fall back to rule-based sorting
				return await this.ruleBasedSort(notePath);
			} catch (ruleError) {
				console.warn("Rule-based sorting failed, using default:", ruleError);

				// Last resort: default location
				return { destination: "unsorted", confidence: 0.1 };
			}
		}
	}
}
```

### Recovery Mechanisms

```typescript
class RecoveryManager {
	async recoverFromCorruption(): Promise<void> {
		// Backup current state
		await this.createBackup();

		// Rebuild vector store from files
		await this.rebuildVectorStore();

		// Restore metadata from backups
		await this.restoreMetadata();
	}
}
```

## Testing Architecture

### Unit Tests

```typescript
// Example test structure
describe("NoteSorter", () => {
	let sorter: NoteSorter;
	let mockMemory: jest.Mocked<MemoryManager>;

	beforeEach(() => {
		mockMemory = createMockMemoryManager();
		sorter = new NoteSorter(mockMemory, mockConfig);
	});

	test("should suggest correct folder for work note", async () => {
		const workNote = "Sprint planning meeting notes...";
		const suggestion = await sorter.sortNote(workNote);

		expect(suggestion.destination).toBe("work/meetings");
		expect(suggestion.confidence).toBeGreaterThan(0.7);
	});
});
```

### Integration Tests

```typescript
describe("End-to-End Sorting", () => {
	test("should sort real notes correctly", async () => {
		// Setup test workspace
		const workspace = await createTestWorkspace();

		// Add test notes
		await workspace.addNote("inbox/meeting.md", meetingContent);

		// Run sorting
		await runSortCommand(workspace.path);

		// Verify results
		expect(workspace.hasFile("work/meetings/meeting.md")).toBe(true);
	});
});
```

## Deployment

### Compilation

```bash
# Compile to standalone binary
bun run compile

# Output: ./sortr (platform-specific binary)
```

### Distribution

```typescript
// build.ts
import { build } from "bun";

await build({
	entrypoints: ["./src/cli.ts"],
	outdir: "./dist",
	target: "bun",
	minify: true,
	splitting: false,
});
```

This architecture provides a solid foundation for a performant, maintainable note sorting system with AI capabilities.
