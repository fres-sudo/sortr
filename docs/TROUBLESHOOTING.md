# Troubleshooting Guide

Common issues and solutions for Sortr.

## Quick Diagnostics

Run these commands first to check system health:

```bash
# Check Ollama status
ollama list

# Check configuration
sortr config --list

# Test basic functionality
echo "Test note" > /tmp/test.md
sortr move /tmp/test.md --dry-run

# Check logs
tail -f ~/.sortr/sortr.log
```

## Installation Issues

### Bun Installation Problems

**Issue:** `bun: command not found`

```bash
# Install/reinstall Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.bun/bin:$PATH"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

**Issue:** Permission denied during installation

```bash
# Fix permissions
sudo chown -R $(whoami) ~/.bun

# Or install to custom location
curl -fsSL https://bun.sh/install | bash -s -- --install-dir ~/my-bun
export PATH="~/my-bun/bin:$PATH"
```

### Ollama Installation Problems

**Issue:** Ollama not starting

```bash
# Check if running
ps aux | grep ollama

# Start Ollama service
ollama serve

# Check logs
ollama logs
```

**Issue:** Model download fails

```bash
# Check available disk space
df -h

# Clear model cache
ollama rm llama3.2:3b
ollama pull llama3.2:3b

# Use smaller model
ollama pull llama3.2:1b
sortr config model llama3.2:1b
```

**Issue:** Ollama connection refused

```bash
# Check if Ollama is running on correct port
netstat -an | grep 11434

# Try different host
export OLLAMA_HOST=http://127.0.0.1:11434
sortr sort

# Check firewall settings
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS/RHEL
```

### Node Sorter Installation

**Issue:** `bun install` fails

```bash
# Clear cache and retry
rm -rf node_modules bun.lockb
bun install

# Check if package.json exists
ls -la package.json

# Manual dependency install
bun add @clack/prompts commander chalk
```

**Issue:** Compilation fails

```bash
# Check TypeScript errors
bun run typecheck

# Clear build cache
rm -rf dist/
bun run compile

# Check Bun version
bun --version  # Should be 1.0.0+
```

## Runtime Issues

### Configuration Problems

**Issue:** Config file not found

```bash
# Check config location
echo $SORTR_CONFIG

# Create default config
sortr config --reset

# Verify config syntax
cat ~/.sortr/config.yaml
```

**Issue:** Invalid configuration

```bash
# Validate YAML
bun -e "console.log(require('js-yaml').load(require('fs').readFileSync('~/.sortr/config.yaml', 'utf8')))"

# Reset to defaults
sortr config --reset

# Edit manually
sortr config --edit
```

**Issue:** Workspace not found

```bash
# Check workspace path
sortr config workspace_path

# Reinitialize
sortr init ~/notes --force

# Check permissions
ls -la ~/notes
```

### AI Model Issues

**Issue:** Model not found

```bash
# List available models
ollama list

# Pull required model
ollama pull llama3.2:3b

# Use different model
sortr config model llama3.2:1b
```

**Issue:** Model responses are poor

```bash
# Increase model size
ollama pull llama3.1:8b
sortr config model llama3.1:8b

# Adjust temperature
sortr config temperature 0.1

# Use better embedding model
sortr config embedding_model all-mpnet-base-v2
```

**Issue:** Slow model responses

```bash
# Use faster model
sortr config model llama3.2:1b

# Reduce max tokens
sortr config max_tokens 1024

# Keep model loaded
sortr config ollama_keep_alive "30m"
```

### Memory and Performance Issues

**Issue:** High memory usage

```bash
# Check memory usage
ps aux | grep sortr

# Reduce vector cache
sortr config max_vectors 5000

# Clear vector store
sortr reset memory

# Use smaller embedding model
sortr config embedding_model all-MiniLM-L6-v2
```

**Issue:** Slow sorting

```bash
# Check embedding generation time
time sortr move test.md --dry-run

# Use faster model
sortr config model llama3.2:1b

# Reduce batch size
sortr config batch_size 5

# Enable caching
sortr config enable_caching true
```

**Issue:** Database corruption

```bash
# Backup current database
cp ~/.sortr/metadata.db ~/.sortr/metadata.db.backup

# Reset memory
sortr reset memory --backup

# Rebuild from scratch
rm ~/.sortr/*.db
sortr init ~/notes --re-analyze
```

### File Processing Issues

**Issue:** Files not being detected

```bash
# Check file extensions
sortr config file_extensions

# Check exclude patterns
sortr config exclude_patterns

# Test specific file
sortr move specific-file.md --verbose

# Check file permissions
ls -la inbox/
```

**Issue:** Files moved to wrong location

```bash
# Check confidence threshold
sortr config confidence_threshold

# Use dry-run to debug
sortr sort --dry-run --verbose

# Undo last move
sortr undo

# Retrain on correct examples
sortr move correct-file.md correct/location/
```

**Issue:** Watch mode not working

```bash
# Check if watch is enabled
sortr config watch_enabled

# Test file system events
# Create file in inbox and check logs
echo "test" > ~/notes/inbox/test.md
tail -f ~/.sortr/sortr.log

# Adjust watch interval
sortr config watch_interval 1

# Restart watch mode
pkill -f "sortr watch"
sortr watch
```

## Network Issues

### Ollama Connection Problems

**Issue:** Connection timeout

```bash
# Increase timeout
sortr config ollama_timeout 60000

# Check network connectivity
curl http://localhost:11434/api/version

# Use local IP
sortr config ollama_host http://127.0.0.1:11434
```

**Issue:** Remote Ollama server

```bash
# Configure remote host
sortr config ollama_host http://192.168.1.100:11434

# Test connectivity
telnet 192.168.1.100 11434

# Check firewall on remote server
# On remote server:
sudo ufw allow 11434
```

## Platform-Specific Issues

### macOS Issues

**Issue:** Quarantine warnings

```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine ./sortr

# Allow in Security & Privacy settings
# System Preferences > Security & Privacy > General
```

**Issue:** File watching on APFS

```bash
# Increase file descriptor limit
ulimit -n 4096

# Use polling instead of events
sortr config watch_use_polling true
```

### Linux Issues

**Issue:** Permission denied

```bash
# Fix ownership
sudo chown -R $USER:$USER ~/.sortr

# Set correct permissions
chmod 755 ~/.sortr
chmod 644 ~/.sortr/config.yaml
```

**Issue:** inotify limits

```bash
# Increase inotify limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Windows Issues (WSL)

**Issue:** Path conversion

```bash
# Use WSL paths
sortr init /mnt/c/Users/username/notes

# Or Windows paths (if supported)
sortr init "C:\Users\username\notes"
```

**Issue:** File watching in WSL

```bash
# Enable polling for cross-filesystem watching
sortr config watch_use_polling true

# Or use WSL2 for better file system integration
```

## Advanced Debugging

### Enable Debug Logging

```bash
# Set log level
sortr config log_level debug

# Or use environment variable
export SORTR_LOG_LEVEL=debug
sortr sort --verbose

# Tail logs in real-time
tail -f ~/.sortr/sortr.log
```

### Trace Execution

```bash
# Enable verbose output
sortr sort --verbose

# Trace system calls (Linux)
strace -e file sortr sort

# Profile performance
time sortr sort --dry-run
```

### Database Inspection

```bash
# Connect to SQLite database
sqlite3 ~/.sortr/metadata.db

# Check tables
.tables

# View recent sorting history
SELECT * FROM sort_history ORDER BY timestamp DESC LIMIT 10;

# Check file counts
SELECT COUNT(*) FROM files;

# Exit SQLite
.quit
```

### Vector Store Debugging

```bash
# Check vector store size
ls -lh ~/.sortr/vectors.db

# View vector dimensions
sortr config vector_dimensions

# Reset and rebuild vectors
sortr reset memory
sortr init ~/notes --re-analyze
```

## Getting Help

### Collect Debug Information

```bash
# Create debug report
cat > debug-report.txt << EOF
Date: $(date)
OS: $(uname -a)
Bun Version: $(bun --version)
Ollama Version: $(ollama --version)
Config: $(sortr config --list)
Recent Logs: $(tail -20 ~/.sortr/sortr.log)
EOF
```

### Common Support Questions

1. **What's my configuration?**

   ```bash
   sortr config --list
   ```

2. **What models are available?**

   ```bash
   ollama list
   ```

3. **What files were processed recently?**

   ```bash
   sortr stats --detailed
   ```

4. **Where are my logs?**
   ```bash
   echo ~/.sortr/sortr.log
   ```

### Reset Everything

**Nuclear option - start fresh:**

```bash
# Backup important data
cp -r ~/.sortr ~/.sortr.backup

# Remove all data
rm -rf ~/.sortr

# Reinstall
./install.sh

# Reinitialize
sortr init ~/notes
```

### Performance Benchmarking

```bash
# Time various operations
time sortr init ~/test-notes
time sortr sort --dry-run
time ollama run llama3.2:3b "test prompt"

# Check memory usage
/usr/bin/time -v sortr sort
```

## Prevention Tips

1. **Regular backups:**

   ```bash
   # Add to crontab
   0 2 * * * cp -r ~/.sortr ~/.sortr.backup.$(date +%Y%m%d)
   ```

2. **Monitor disk space:**

   ```bash
   df -h ~/.sortr
   ```

3. **Keep models updated:**

   ```bash
   ollama pull llama3.2:3b  # Updates to latest version
   ```

4. **Regular cleanup:**

   ```bash
   # Clean old logs
   find ~/.sortr -name "*.log.*" -mtime +30 -delete

   # Vacuum databases
   sqlite3 ~/.sortr/metadata.db "VACUUM;"
   ```

If none of these solutions work, please create an issue with your debug information.
