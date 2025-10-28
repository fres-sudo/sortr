# 🎉 Getting Started with Sortr

**AI-Powered Local Note Organization** - Get up and running in minutes!

## ⚡ Quick Start

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b

# 3. Install & Run
./install.sh  # Automated!

# 4. Use it
./sortr init ~/notes
./sortr sort --auto
```

## 🎁 What's Included

```
sortr/
├── README.md                # Main documentation
├── docs/                    # Documentation
│   ├── GETTING_STARTED.md   # This guide
│   ├── QUICKSTART.md        # Quick setup
│   ├── ARCHITECTURE.md      # Technical details
│   ├── TROUBLESHOOTING.md   # Problem solving
│   └── USE_CASES.md         # Use case ideas
├── src/                     # Source code
│   ├── cli.ts               # CLI interface
│   ├── config.ts            # Configuration
│   ├── memory.ts            # Database & vectors
│   ├── analyzer.ts          # Workspace analysis
│   ├── sorter.ts            # Sorting logic
│   ├── types.ts             # Type definitions
│   └── lib/                 # Utilities
└── examples/                # Config examples
```

## 🔥 Key Features

- ✅ **100% Local** - No cloud, complete privacy
- ✅ **AI-Powered** - Uses local LLM (Ollama)
- ✅ **Smart Learning** - Learns your style
- ✅ **Vector Search** - Fast similarity matching
- ✅ **Watch Mode** - Continuous auto-sorting
- ✅ **Undo Function** - Reverse mistakes
- ✅ **Statistics** - Track patterns
- ✅ **Configurable** - Customize everything
- ✅ **Well-Documented** - Extensive guides

## 💡 Common Questions

**Q: Is my data private?**
A: Absolutely! Everything runs locally.

**Q: Does it cost anything?**
A: No! Completely free and open source.

**Q: What file types work?**
A: Markdown (.md), Text (.txt), Org (.org) by default. Configurable!

**Q: How many notes can it handle?**
A: Tested with 10,000+ notes. Works great!

**Q: Can I compile to binary?**
A: Yes! `bun run compile` creates standalone executable.

## 🎨 Example Workflow

```bash
# 1. Initialize (one-time setup)
./sortr init ~/notes

# 2. Throughout your day, add notes to inbox
echo "Meeting notes..." > ~/notes/inbox/meeting.md
echo "Research findings..." > ~/notes/inbox/research.md
echo "Todo list..." > ~/notes/inbox/todos.md

# 3. Sort them (manual)
./sortr sort

# Or enable automatic sorting
./sortr watch
# Now any new notes are automatically sorted!

# 4. Check statistics
./sortr stats

# 5. Made a mistake? Undo!
./sortr undo
```

## 🚀 Next Steps

1. **Read the documentation:**

   - [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup guide
   - [USE_CASES.md](./USE_CASES.md) - Real-world examples
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Problem solving

2. **Run the install script:**

   ```bash
   ./install.sh
   ```

3. **Start organizing your notes!**

## 📚 Documentation Index

- **[Getting Started](./GETTING_STARTED.md)** - This guide
- **[Quick Start](./QUICKSTART.md)** - 5-minute setup
- **[Use Cases](./USE_CASES.md)** - Real-world examples
- **[Architecture](./ARCHITECTURE.md)** - How it works
- **[API Reference](./API.md)** - Command reference
- **[Configuration](./CONFIGURATION.md)** - Customization guide
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Problem solving

Happy note sorting! 📝✨
