/**
 * Simple in-memory vector store with persistence
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { VectorEntry, SimilarNote } from './types';

export class VectorStore {
  private vectors: VectorEntry[] = [];
  private storePath: string;

  constructor(storePath: string) {
    this.storePath = storePath;
  }

  async load(): Promise<void> {
    try {
      if (existsSync(this.storePath)) {
        const content = await readFile(this.storePath, 'utf-8');
        this.vectors = JSON.parse(content);
      }
    } catch (error) {
      console.warn('Failed to load vector store:', error);
      this.vectors = [];
    }
  }

  async save(): Promise<void> {
    try {
      const content = JSON.stringify(this.vectors);
      await writeFile(this.storePath, content, 'utf-8');
    } catch (error) {
      console.error('Failed to save vector store:', error);
    }
  }

  add(entry: VectorEntry): void {
    // Remove existing entry with same id
    this.vectors = this.vectors.filter(v => v.id !== entry.id);
    this.vectors.push(entry);
  }

  async query(embedding: number[], topK: number = 5): Promise<SimilarNote[]> {
    if (this.vectors.length === 0) {
      return [];
    }

    // Calculate cosine similarity for each vector
    const similarities = this.vectors.map(entry => ({
      entry,
      similarity: this.cosineSimilarity(embedding, entry.embedding),
    }));

    // Sort by similarity (descending) and take top K
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topResults = similarities.slice(0, topK);

    return topResults.map(({ entry, similarity }) => ({
      id: entry.id,
      filePath: entry.metadata.filePath,
      folderPath: entry.metadata.folderPath,
      similarity,
      document: '', // We don't store full document in vector store
    }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  clear(): void {
    this.vectors = [];
  }

  size(): number {
    return this.vectors.length;
  }
}
