# Quick Start Guide (TypeScript + Bun)

Get up and running with Sortr in 5 minutes!

## Step 1: Install Bun

**macOS/Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Step 2: Install Ollama

**macOS/Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

## Step 3: Pull AI Model

```bash
ollama pull llama3.2:3b
```

## Step 4: Install Sortr

```bash
cd sortr-ts
bun install
```

## Step 5: Initialize Your Workspace

```bash
# Using bun run
bun run src/cli.ts init ~/notes

# Or compile first for faster execution
bun run compile
./sortr init ~/notes
```

## Step 6: Add Some Notes

```bash
mkdir -p ~/notes/inbox

# Create a test note
cat > ~/notes/inbox/meeting-notes.md << EOF
# Q4 Planning Meeting

Discussed goals for next quarter:
- Launch new feature
- Improve performance
- User testing

Action items:
- Schedule follow-up
- Create project plan
EOF
```

## Step 7: Sort Your Notes

```bash
# Interactive mode (asks for confirmation)
./sortr sort

# Or auto mode
./sortr sort --auto

# Or dry run to preview
./sortr sort --dry-run
```

## Step 8: Enable Watch Mode (Optional)

```bash
./sortr watch
```

Now any note you add to the inbox will be automatically sorted!

## Common Commands

```bash
# Show statistics
./sortr stats

# Undo last sort
./sortr undo

# Sort specific file
./sortr move ~/Downloads/note.md

# Show configuration
./sortr config

# Reset everything
./sortr reset
```

## Tips

1. **Start with existing notes**: The tool learns from your current organization
2. **Use interactive mode first**: See how it makes decisions
3. **Try dry-run**: Preview suggestions before committing
4. **Let it learn**: Confidence improves over time
5. **Compile for speed**: `bun run compile` creates a fast standalone binary

## Next Steps

- Check out `examples/` for more use cases
- Customize `~/.sortr/config.yaml`
- Read the full README for advanced features

Happy note sorting! 📝✨
