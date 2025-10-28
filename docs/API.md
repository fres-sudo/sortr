# API Reference

Complete command reference for Sortr CLI.

## Commands Overview

```bash
sortr <command> [options]
```

### Available Commands

- [`init`](#init) - Initialize workspace
- [`sort`](#sort) - Sort notes from inbox
- [`move`](#move) - Sort specific file
- [`watch`](#watch) - Enable continuous sorting
- [`stats`](#stats) - Show statistics
- [`undo`](#undo) - Undo last sort
- [`config`](#config) - Show configuration
- [`reset`](#reset) - Reset memory and configuration

## Commands

### `init`

Initialize a workspace for note sorting.

```bash
sortr init <workspace_path> [options]
```

**Arguments:**

- `workspace_path` - Path to notes directory

**Options:**

- `--force` - Overwrite existing configuration
- `--model <model>` - AI model to use (default: llama3.2:3b)
- `--embedding <model>` - Embedding model (default: all-MiniLM-L6-v2)

**Examples:**

```bash
# Basic initialization
sortr init ~/notes

# Force reinit with different model
sortr init ~/notes --force --model llama3.2:1b

# Custom embedding model
sortr init ~/notes --embedding sentence-transformers/all-mpnet-base-v2
```

### `sort`

Sort notes from the inbox directory.

```bash
sortr sort [options]
```

**Options:**

- `--auto` - Skip confirmation prompts
- `--dry-run` - Preview without moving files
- `--confidence <threshold>` - Minimum confidence (0.0-1.0, default: 0.7)
- `--batch-size <size>` - Process in batches (default: 10)

**Examples:**

```bash
# Interactive sorting
sortr sort

# Automatic sorting
sortr sort --auto

# Preview mode
sortr sort --dry-run

# Higher confidence threshold
sortr sort --confidence 0.9

# Process in smaller batches
sortr sort --batch-size 5
```

### `move`

Sort a specific file or files.

```bash
sortr move <file_path> [options]
```

**Arguments:**

- `file_path` - Path to file to sort (supports glob patterns)

**Options:**

- `--auto` - Skip confirmation
- `--dry-run` - Preview only
- `--force` - Move even with low confidence

**Examples:**

```bash
# Sort specific file
sortr move ~/Downloads/meeting-notes.md

# Sort multiple files
sortr move ~/Downloads/*.md

# Auto-sort without confirmation
sortr move ~/notes/inbox/research.md --auto

# Force move with low confidence
sortr move unclear-note.md --force
```

### `watch`

Enable continuous sorting of the inbox directory.

```bash
sortr watch [options]
```

**Options:**

- `--interval <seconds>` - Check interval (default: 5)
- `--confidence <threshold>` - Minimum confidence (default: 0.8)
- `--max-files <count>` - Max files per batch (default: 5)

**Examples:**

```bash
# Start watching
sortr watch

# Custom check interval
sortr watch --interval 10

# Higher confidence for auto-sorting
sortr watch --confidence 0.9
```

**Note:** Use `Ctrl+C` to stop watching.

### `stats`

Show sorting statistics and analytics.

```bash
sortr stats [options]
```

**Options:**

- `--detailed` - Show detailed breakdown
- `--period <days>` - Statistics period (default: 30)
- `--format <format>` - Output format: table, json, csv (default: table)

**Examples:**

```bash
# Basic stats
sortr stats

# Detailed breakdown
sortr stats --detailed

# Last 7 days
sortr stats --period 7

# JSON output
sortr stats --format json
```

### `undo`

Undo the last sorting operation.

```bash
sortr undo [options]
```

**Options:**

- `--steps <count>` - Number of operations to undo (default: 1)
- `--dry-run` - Preview undo without executing

**Examples:**

```bash
# Undo last operation
sortr undo

# Undo last 3 operations
sortr undo --steps 3

# Preview undo
sortr undo --dry-run
```

### `config`

Show or modify configuration.

```bash
sortr config [key] [value] [options]
```

**Arguments:**

- `key` - Configuration key to show/set
- `value` - New value (if setting)

**Options:**

- `--list` - List all configuration
- `--reset` - Reset to defaults
- `--edit` - Open config file in editor

**Examples:**

```bash
# Show all config
sortr config --list

# Show specific setting
sortr config model

# Set configuration value
sortr config confidence_threshold 0.8

# Reset to defaults
sortr config --reset

# Edit config file
sortr config --edit
```

### `reset`

Reset memory, configuration, or both.

```bash
sortr reset [type] [options]
```

**Arguments:**

- `type` - What to reset: memory, config, all (default: all)

**Options:**

- `--force` - Skip confirmation
- `--backup` - Create backup before reset

**Examples:**

```bash
# Reset everything (with confirmation)
sortr reset

# Reset only memory
sortr reset memory

# Force reset without confirmation
sortr reset --force

# Reset with backup
sortr reset --backup
```

## Global Options

These options work with all commands:

- `--help, -h` - Show help
- `--version, -v` - Show version
- `--verbose` - Verbose output
- `--quiet` - Suppress output
- `--config <path>` - Custom config file path

**Examples:**

```bash
# Show help for any command
sortr sort --help

# Verbose output
sortr sort --verbose

# Quiet mode
sortr watch --quiet

# Custom config file
sortr sort --config ~/.my-sortr-config.yaml
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - File not found
- `4` - Permission denied
- `5` - Configuration error
- `130` - Interrupted by user (Ctrl+C)

## Environment Variables

- `SORTR_CONFIG` - Custom config file path
- `SORTR_MODEL` - Default AI model
- `SORTR_EMBEDDING` - Default embedding model
- `SORTR_LOG_LEVEL` - Log level (debug, info, warn, error)
- `OLLAMA_HOST` - Ollama server URL (default: http://localhost:11434)

**Examples:**

```bash
# Use custom config
export SORTR_CONFIG=~/.config/my-sortr.yaml
sortr sort

# Custom Ollama host
export OLLAMA_HOST=http://remote-server:11434
sortr init ~/notes

# Debug logging
export SORTR_LOG_LEVEL=debug
sortr sort --verbose
```

## Configuration File

Default location: `~/.sortr/config.yaml`

**Example configuration:**

```yaml
# Workspace settings
workspace_path: ~/notes
inbox_dir: inbox

# AI settings
model: llama3.2:3b
embedding_model: all-MiniLM-L6-v2
confidence_threshold: 0.7
max_tokens: 2048

# File settings
file_extensions: [".md", ".txt", ".org"]
exclude_patterns: [".*", "_*", "temp*"]
max_file_size: 10485760 # 10MB

# Behavior settings
auto_create_dirs: true
preserve_structure: true
backup_moves: true
watch_interval: 5

# Ollama settings
ollama_host: http://localhost:11434
ollama_timeout: 30000
```

## Troubleshooting Commands

```bash
# Check if Ollama is running
ollama list

# Test model connectivity
sortr config model

# View debug logs
sortr sort --verbose 2>&1 | tee debug.log

# Reset if stuck
sortr reset memory --force
```

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
