# 📝 Sortr

![_IMG Sortr Logo](https://5yyithvls1.ufs.sh/f/3nsI94TDxXoGWGQ9Hm6tzS7uTn1Vmitc9yRLK3rEfChPFW6l)

## 🚀 Quick Start

```bash
./install.sh
```

## 🔑 Key Features

- ✅ 100% Local - No cloud, no API keys
- ✅ Smart Learning - Analyzes your organization
- ✅ Vector Embeddings - Fast similarity search
- ✅ LLM Integration - Uses Ollama locally
- ✅ Watch Mode - Automatic continuous sorting
- ✅ Undo Function - Reverse mistakes
- ✅ Confidence Scores - Know when AI is uncertain
- ✅ Statistics - Track sorting patterns
- ✅ Configurable - Customize everything
- ✅ Privacy First - Your notes never leave your machine

## 🎯 Why This Implementation?

- ⚡ **Fast** - 3x faster startup with Bun runtime
- 📦 **Easy Distribution** - Compiles to single binary
- 💾 **Memory Efficient** - Uses 50% less memory
- 🎯 **TypeScript** - Full type safety and modern development
- ✨ **Modern** - Built with latest tools and patterns

## 📖 Full Documentation

### Getting Started

- **[Getting Started](docs/GETTING_STARTED.md)** - Complete beginner's guide
- **[Quick Start](docs/QUICKSTART.md)** - 5-minute setup
- **[Use Cases](docs/USE_CASES.md)** - Real-world examples

### Reference

- **[API Reference](docs/API.md)** - Complete command reference
- **[Configuration](docs/CONFIGURATION.md)** - Customization guide
- **[Architecture](docs/ARCHITECTURE.md)** - Technical details

### Support

- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Problem solving guide

## 🚀 Installation

### Prerequisites

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
```

### Install Sortr

```bash
./install.sh  # Automated installation

# Or manual:
bun install
bun run compile
./sortr init ~/notes
./sortr sort
```

## 🎮 Usage

Commands available:

```bash
# Initialize workspace
sortr init ~/notes

# Sort notes from inbox
sortr sort
sortr sort --auto      # No confirmation
sortr sort --dry-run   # Preview only

# Watch mode (continuous sorting)
sortr watch

# Statistics
sortr stats

# Undo last sort
sortr undo

# Sort specific file
sortr move file.md

# Show configuration
sortr config

# Reset memory
sortr reset
```

## 💻 Example Workflow

```bash
# 1. Initialize once
sortr init ~/notes

# 2. Add notes to inbox
echo "Meeting notes about Q4 planning..." > ~/notes/inbox/meeting.md
echo "Research on neural networks..." > ~/notes/inbox/research.md

# 3. Sort them
sortr sort --auto

# 4. Or enable continuous sorting
sortr watch
```

## 🏗️ Architecture

High-level architecture:

```
User Input (CLI)
       ↓
Configuration Manager
       ↓
Memory Manager (Embeddings + DB)
       ↓
Workspace Analyzer (Learn structure)
       ↓
Sortr (LLM + Vector search)
       ↓
File Operations
```

## 🎨 Code Structure

Well-organized and documented:

```
src/
├── cli.ts           # CLI with Commander
├── config.ts        # Configuration
├── memory.ts        # Vectors + Bun SQLite
├── analyzer.ts      # Workspace analysis
├── sorter.ts        # Sorting logic
├── types.ts         # Type definitions
└── lib/
    ├── vector-store.ts
    └── embeddings.ts
```

## 🤝 Contributing

This project is open source and welcomes contributions!

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

**MIT License**

Free to use, modify, and distribute!

## 🙏 Credits

Built with:

- **Ollama** - Local LLM inference
- **Transformers.js** - Embeddings
- **Custom Vector Store** - Vector search
- **Bun SQLite** - Metadata storage
- **Commander** - CLI framework
- **Clack** - Beautiful terminal UI

## 📞 Support

- **[Complete Documentation](docs/)** - Comprehensive guides
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Problem solving
- **[Configuration Examples](docs/CONFIGURATION.md)** - Customization help
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical details

## 🎉 Get Started Now

1. **Run the install script**
2. **Start organizing your notes!**

```bash
./install.sh
```
