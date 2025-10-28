# Configuration Guide

Learn how to customize Sortr to fit your workflow.

## Configuration File Location

**Default:** `~/.sortr/config.yaml`

**Custom location:**

```bash
# Via environment variable
export SORTR_CONFIG=~/my-custom-config.yaml

# Via command line
sortr sort --config ~/my-custom-config.yaml
```

## Complete Configuration Example

```yaml
# Workspace Configuration
workspace_path: ~/notes
inbox_dir: inbox
archive_dir: .archive

# AI Model Configuration
model: llama3.2:3b
embedding_model: all-MiniLM-L6-v2
confidence_threshold: 0.7
max_tokens: 2048
temperature: 0.1

# File Processing
file_extensions:
  - .md
  - .txt
  - .org
  - .adoc

exclude_patterns:
  - ".*" # Hidden files
  - "_*" # Files starting with underscore
  - "temp*" # Temporary files
  - "*.tmp" # Temp files
  - "node_modules/**"
  - ".git/**"

max_file_size: 10485760 # 10MB in bytes
encoding: utf-8

# Sorting Behavior
auto_create_dirs: true
preserve_structure: true
backup_moves: true
dry_run_default: false
interactive_mode: true

# Watch Mode
watch_enabled: true
watch_interval: 5
watch_confidence: 0.8
watch_max_files: 5

# Memory and Learning
vector_store_path: ~/.sortr/vectors.db
metadata_db_path: ~/.sortr/metadata.db
max_vectors: 10000
vector_dimensions: 384
learning_rate: 0.1

# Ollama Configuration
ollama_host: http://localhost:11434
ollama_timeout: 30000
ollama_keep_alive: "5m"

# Logging
log_level: info
log_file: ~/.sortr/sortr.log
max_log_size: 10485760 # 10MB
log_rotation: 5

# UI and Output
color_output: true
show_progress: true
show_confidence: true
emoji_output: true
terminal_width: auto

# Advanced Features
enable_fuzzy_matching: true
similarity_threshold: 0.6
clustering_enabled: true
auto_summarization: false
```

## Configuration Sections

### Workspace Settings

Controls where and how files are organized.

```yaml
workspace_path: ~/notes # Root directory for notes
inbox_dir: inbox # Where new notes go
archive_dir: .archive # Where old notes are archived
```

**Example folder structure:**

```
~/notes/
├── inbox/           # New notes here
├── work/
├── personal/
└── .archive/        # Old notes moved here
```

### AI Model Settings

Configure the AI models used for sorting.

```yaml
model: llama3.2:3b # Main LLM model
embedding_model: all-MiniLM-L6-v2 # Text embedding model
confidence_threshold: 0.7 # Minimum confidence to auto-sort
max_tokens: 2048 # Max tokens for LLM responses
temperature: 0.1 # LLM creativity (0.0-1.0)
```

**Available models:**

- **LLM Models:** llama3.2:1b, llama3.2:3b, llama3.1:8b, phi3, gemma2
- **Embedding Models:** all-MiniLM-L6-v2, all-mpnet-base-v2, multilingual-e5-small

### File Processing

Control which files are processed and how.

```yaml
file_extensions:
  - .md # Markdown
  - .txt # Plain text
  - .org # Org mode
  - .adoc # AsciiDoc

exclude_patterns:
  - ".*" # Hidden files
  - "_*" # Private files
  - "temp*" # Temporary files
  - "*.tmp" # Temp files

max_file_size: 10485760 # 10MB limit
encoding: utf-8 # File encoding
```

### Sorting Behavior

Customize how files are moved and organized.

```yaml
auto_create_dirs: true # Create destination folders
preserve_structure: true # Keep subfolder structure
backup_moves: true # Backup before moving
dry_run_default: false # Default to actual moves
interactive_mode: true # Ask for confirmation
```

### Watch Mode

Configure automatic file monitoring.

```yaml
watch_enabled: true # Enable watch mode
watch_interval: 5 # Check every 5 seconds
watch_confidence: 0.8 # Higher threshold for auto-sorting
watch_max_files: 5 # Max files to process at once
```

### Memory and Learning

Control how the system learns from your organization.

```yaml
vector_store_path: ~/.sortr/vectors.db # Vector database
metadata_db_path: ~/.sortr/metadata.db # File metadata
max_vectors: 10000 # Memory limit
vector_dimensions: 384 # Embedding size
learning_rate: 0.1 # How fast to adapt
```

### Ollama Configuration

Configure connection to Ollama server.

```yaml
ollama_host: http://localhost:11434 # Ollama server URL
ollama_timeout: 30000 # 30 second timeout
ollama_keep_alive: "5m" # Keep model loaded
```

**Remote Ollama:**

```yaml
ollama_host: http://192.168.1.100:11434
ollama_timeout: 60000 # Longer timeout for network
```

## Common Configurations

### Minimal Configuration

```yaml
workspace_path: ~/notes
model: llama3.2:1b # Faster, smaller model
confidence_threshold: 0.8
```

### High Performance

```yaml
workspace_path: ~/notes
model: llama3.1:8b # More capable model
embedding_model: all-mpnet-base-v2 # Better embeddings
confidence_threshold: 0.6
max_tokens: 4096
watch_interval: 1 # Faster checking
```

### Privacy Focused

```yaml
workspace_path: ~/private-notes
model: llama3.2:3b
ollama_host: http://localhost:11434 # Local only
backup_moves: true
log_level: error # Minimal logging
auto_summarization: false
```

### Multi-Language

```yaml
workspace_path: ~/multilingual-notes
embedding_model: multilingual-e5-small
file_extensions:
  - .md
  - .txt
  - .org
exclude_patterns:
  - "english/**" # Process other languages first
```

### Development/Testing

```yaml
workspace_path: ~/test-notes
model: llama3.2:1b # Fast for testing
confidence_threshold: 0.5 # Lower threshold
dry_run_default: true # Safe for testing
log_level: debug
show_confidence: true
```

## Environment Variables

Override config with environment variables:

```bash
# Model settings
export SORTR_MODEL=llama3.2:1b
export SORTR_EMBEDDING=all-MiniLM-L6-v2
export SORTR_CONFIDENCE=0.8

# Paths
export SORTR_WORKSPACE=~/documents/notes
export SORTR_CONFIG=~/.config/sortr.yaml

# Ollama
export OLLAMA_HOST=http://localhost:11434
export SORTR_LOG_LEVEL=debug

# Run with custom settings
sortr sort
```

## Configuration Management

### View Current Configuration

```bash
# Show all settings
sortr config --list

# Show specific setting
sortr config confidence_threshold
```

### Modify Configuration

```bash
# Set single value
sortr config confidence_threshold 0.8

# Edit full config file
sortr config --edit

# Reset to defaults
sortr config --reset
```

### Backup Configuration

```bash
# Create backup
cp ~/.sortr/config.yaml ~/.sortr/config.backup.yaml

# Restore from backup
cp ~/.sortr/config.backup.yaml ~/.sortr/config.yaml
```

### Multiple Configurations

```bash
# Work configuration
sortr sort --config ~/.sortr/work-config.yaml

# Personal configuration
sortr sort --config ~/.sortr/personal-config.yaml

# Create alias for convenience
alias sortr-work='sortr --config ~/.sortr/work-config.yaml'
alias sortr-personal='sortr --config ~/.sortr/personal-config.yaml'
```

## Validation

The configuration is validated on startup. Common errors:

```yaml
# ❌ Invalid confidence (must be 0.0-1.0)
confidence_threshold: 1.5

# ❌ Invalid path
workspace_path: /nonexistent/path

# ❌ Invalid model
model: nonexistent-model

# ✅ Valid configuration
confidence_threshold: 0.7
workspace_path: ~/notes
model: llama3.2:3b
```

## Performance Tuning

### For Speed

```yaml
model: llama3.2:1b # Fastest model
embedding_model: all-MiniLM-L6-v2 # Fastest embeddings
confidence_threshold: 0.8 # Less processing
watch_interval: 10 # Check less frequently
max_tokens: 1024 # Shorter responses
```

### For Accuracy

```yaml
model: llama3.1:8b # Most capable model
embedding_model: all-mpnet-base-v2 # Best embeddings
confidence_threshold: 0.6 # Process more files
max_tokens: 4096 # Longer context
temperature: 0.0 # Most deterministic
```

### For Large Collections

```yaml
max_vectors: 50000 # More memory
batch_size: 20 # Larger batches
clustering_enabled: true # Better organization
auto_summarization: true # Compress old data
```

## Troubleshooting Configuration

### Common Issues

1. **Model not found:**

   ```bash
   ollama list  # Check available models
   ollama pull llama3.2:3b  # Download missing model
   ```

2. **Permission errors:**

   ```bash
   chmod 755 ~/.sortr
   chmod 644 ~/.sortr/config.yaml
   ```

3. **Invalid YAML:**

   ```bash
   # Validate YAML syntax
   python -c "import yaml; yaml.safe_load(open('~/.sortr/config.yaml'))"
   ```

4. **Reset configuration:**
   ```bash
   sortr config --reset
   ```

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
