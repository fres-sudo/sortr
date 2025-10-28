/**
 * Workspace analyzer for learning folder structure
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import type { ConfigManager } from './config';
import type { MemoryManager } from './memory';
import type { AnalysisResult } from './types';

export class WorkspaceAnalyzer {
  constructor(
    private config: ConfigManager,
    private memory: MemoryManager
  ) {}

  async analyze(verbose: boolean = false): Promise<AnalysisResult> {
    const workspace = this.config.getWorkspacePath();
    const inboxPath = this.config.getInboxPath();

    console.log(chalk.blue('\n📚 Analyzing workspace:'), workspace);

    // Discover all notes
    const notes = this.discoverNotes(workspace, inboxPath);

    if (notes.length === 0) {
      console.log(chalk.yellow('⚠️  No notes found in workspace!'));
      return { totalNotes: 0, folders: {}, skipped: 0 };
    }

    console.log(chalk.green('✓'), `Found ${notes.length} notes`);

    // Process notes with spinner
    const result = await this.processNotes(notes, workspace, verbose);

    // Get folder statistics
    const folderStats = this.memory.getFolderStructure();

    console.log(chalk.green('\n✨ Analysis complete!'));
    console.log(`  • Processed: ${result.processed} notes`);
    console.log(`  • Folders: ${Object.keys(folderStats).length}`);
    console.log(`  • Skipped: ${result.skipped} files`);

    return {
      totalNotes: result.processed,
      folders: folderStats,
      skipped: result.skipped,
    };
  }

  private discoverNotes(
    dirPath: string,
    inboxPath: string
  ): Array<{ filePath: string; folderPath: string }> {
    const notes: Array<{ filePath: string; folderPath: string }> = [];
    const workspacePath = this.config.getWorkspacePath();

    const traverse = (currentPath: string): void => {
      try {
        const entries = readdirSync(currentPath);

        for (const entry of entries) {
          const fullPath = join(currentPath, entry);
          const stat = statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip excluded folders and inbox
            if (
              this.config.isExcludedFolder(fullPath) ||
              fullPath === inboxPath ||
              fullPath.includes(inboxPath)
            ) {
              continue;
            }
            traverse(fullPath);
          } else if (stat.isFile()) {
            // Check if valid file extension
            if (this.config.isValidFile(fullPath)) {
              const folderPath = relative(workspacePath, currentPath);
              notes.push({ filePath: fullPath, folderPath });
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    traverse(dirPath);
    return notes;
  }

  private async processNotes(
    notes: Array<{ filePath: string; folderPath: string }>,
    workspace: string,
    verbose: boolean
  ): Promise<{ processed: number; skipped: number }> {
    let processed = 0;
    let skipped = 0;

    const spinner = ora({
      text: 'Processing notes...',
      color: 'cyan',
    }).start();

    for (let i = 0; i < notes.length; i++) {
      const { filePath, folderPath } = notes[i];
      
      spinner.text = `Processing notes... (${i + 1}/${notes.length})`;

      try {
        // Read note content
        const content = this.readNote(filePath);

        if (!content || content.trim().length < 10) {
          skipped++;
          if (verbose) {
            console.log(chalk.dim(`\nSkipped (too short): ${filePath}`));
          }
          continue;
        }

        // Add to memory
        await this.memory.addNote(filePath, content, folderPath);
        processed++;

        if (verbose) {
          console.log(chalk.green(`\n✓ ${filePath} → ${folderPath}`));
        }
      } catch (error) {
        skipped++;
        if (verbose) {
          console.log(chalk.red(`\n✗ Error processing ${filePath}:`), error);
        }
      }
    }

    spinner.succeed(chalk.green('Processing complete'));

    return { processed, skipped };
  }

  private readNote(filePath: string): string {
    const encodings: BufferEncoding[] = ['utf-8', 'latin1'];

    for (const encoding of encodings) {
      try {
        return readFileSync(filePath, encoding);
      } catch (error) {
        continue;
      }
    }

    return '';
  }

  getFolderSummary(): string {
    const folderStats = this.memory.getFolderStructure();

    if (Object.keys(folderStats).length === 0) {
      return 'No folders analyzed yet.';
    }

    const lines = ['Current folder structure:'];

    // Sort by note count descending
    const sorted = Object.entries(folderStats).sort(
      (a, b) => b[1].noteCount - a[1].noteCount
    );

    for (const [folder, stats] of sorted) {
      lines.push(`  • ${folder}: ${stats.noteCount} notes`);
    }

    return lines.join('\n');
  }

  async reAnalyze(verbose: boolean = false): Promise<AnalysisResult> {
    console.log(chalk.yellow('⚠️  Clearing existing memory...'));
    this.memory.clear();
    console.log(chalk.green('✓ Memory cleared'));

    return this.analyze(verbose);
  }
}
