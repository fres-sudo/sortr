/**
 * Embeddings using Transformers.js or Ollama
 */

import { pipeline } from "@xenova/transformers";
import ollama from "ollama";
import type { EmbeddingFunction } from "./types";

export class EmbeddingProvider {
	private embedder: any = null;
	private method: "transformers" | "ollama" = "transformers";
	private modelName: string;

	constructor(modelName: string = "Xenova/all-MiniLM-L6-v2") {
		this.modelName = modelName;
	}

	async initialize(): Promise<void> {
		try {
			// Try Transformers.js first (fully local, no external dependencies)
			this.embedder = await pipeline("feature-extraction", this.modelName);
			this.method = "transformers";
			console.log("✓ Initialized embeddings with Transformers.js");
		} catch (error) {
			console.warn(
				"Transformers.js not available, falling back to Ollama embeddings"
			);
			// Fallback to Ollama embeddings
			try {
				// Test if Ollama is available
				await ollama.list();
				this.method = "ollama";
				console.log("✓ Using Ollama for embeddings");
			} catch (ollamaError) {
				throw new Error(
					"Neither Transformers.js nor Ollama available for embeddings"
				);
			}
		}
	}

	async embed(text: string): Promise<number[]> {
		if (!this.embedder && this.method === "transformers") {
			await this.initialize();
		}

		try {
			if (this.method === "transformers") {
				return await this.embedWithTransformers(text);
			} else {
				return await this.embedWithOllama(text);
			}
		} catch (error) {
			console.error("Embedding failed:", error);
			throw error;
		}
	}

	private async embedWithTransformers(text: string): Promise<number[]> {
		const output = await this.embedder(text, {
			pooling: "mean",
			normalize: true,
		});

		// Extract the actual embedding array
		const embedding = Array.from(output.data);
		return embedding as number[];
	}

	private async embedWithOllama(text: string): Promise<number[]> {
		try {
			const response = await ollama.embeddings({
				model: "nomic-embed-text",
				prompt: text,
			});
			return response.embedding;
		} catch (error) {
			// If nomic-embed-text not available, try with llama model
			console.warn("nomic-embed-text not available, using llama model");
			const response = await ollama.embeddings({
				model: "llama3.2:3b",
				prompt: text,
			});
			return response.embedding;
		}
	}

	getMethod(): string {
		return this.method;
	}
}

/**
 * Create an embedding function for use in memory manager
 */
export async function createEmbeddingFunction(
	modelName?: string
): Promise<EmbeddingFunction> {
	const provider = new EmbeddingProvider(modelName);
	await provider.initialize();

	return async (text: string) => {
		return await provider.embed(text);
	};
}
