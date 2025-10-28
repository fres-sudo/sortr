#!/bin/bash
# Sortr (TypeScript + Bun) - Quick Installation Script

set -e

echo "=================================="
echo "Sortr - Quick Install"
echo "TypeScript + Bun Version"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Bun is installed
echo -e "${BLUE}Checking Bun...${NC}"
if command -v bun &> /dev/null; then
    bun_version=$(bun --version)
    echo -e "${GREEN}✓ Bun $bun_version found${NC}"
else
    echo -e "${RED}✗ Bun not found${NC}"
    echo ""
    echo "Install Bun:"
    echo "  curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if Ollama is installed
echo ""
echo -e "${BLUE}Checking Ollama...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama found${NC}"

    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags &> /dev/null; then
        echo -e "${GREEN}✓ Ollama is running${NC}"
    else
        echo -e "${YELLOW}⚠ Ollama not running, starting...${NC}"
        ollama serve &
        sleep 2
    fi
else
    echo -e "${RED}✗ Ollama not found${NC}"
    echo ""
    echo "Install Ollama:"
    echo "  macOS/Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  Or visit: https://ollama.com"
    exit 1
fi

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
bun install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for Llama model
echo ""
echo -e "${BLUE}Checking for Llama model...${NC}"
if ollama list | grep -q "llama"; then
    echo -e "${GREEN}✓ Llama model found${NC}"
else
    echo -e "${YELLOW}⚠ No Llama model found${NC}"
    read -p "Download llama3.2:3b? (about 2GB) [Y/n]: " download_model
    download_model=${download_model:-Y}

    if [[ $download_model =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Downloading model (this may take a few minutes)...${NC}"
        ollama pull llama3.2:3b
        echo -e "${GREEN}✓ Model downloaded${NC}"
    fi
fi

# Ask about compilation
echo ""
read -p "Compile to standalone binary? (recommended) [Y/n]: " compile_binary
compile_binary=${compile_binary:-Y}

if [[ $compile_binary =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Compiling binary...${NC}"
    bun run compile
    echo -e "${GREEN}✓ Binary compiled: ./sortr${NC}"
fi

# Ask about workspace
echo ""
read -p "Initialize Sortr workspace? [Y/n]: " init_workspace
init_workspace=${init_workspace:-Y}

if [[ $init_workspace =~ ^[Yy]$ ]]; then
    read -p "Enter workspace path [~/notes]: " workspace_path
    workspace_path=${workspace_path:-~/notes}

    echo -e "${BLUE}Initializing workspace at $workspace_path...${NC}"

    if [[ -f ./sortr ]]; then
        ./sortr init "$workspace_path"
    else
        bun run src/cli.ts init "$workspace_path"
    fi

    echo -e "${GREEN}✓ Workspace initialized${NC}"
fi

# Final instructions
echo ""
echo -e "${GREEN}=================================="
echo "✨ Installation Complete! ✨"
echo "==================================${NC}"
echo ""

if [[ -f ./sortr ]]; then
    echo "Binary available at: ./sortr"
    echo ""
    echo "Next steps:"
    echo "  1. Add notes to inbox:"
    echo "     mkdir -p ~/notes/inbox"
    echo "     echo 'My first note' > ~/notes/inbox/test.md"
    echo ""
    echo "  2. Sort your notes:"
    echo "     ./sortr sort"
    echo ""
    echo "  3. Or enable watch mode:"
    echo "     ./sortr watch"
else
    echo "Run with Bun:"
    echo ""
    echo "Next steps:"
    echo "  1. Add notes to inbox:"
    echo "     mkdir -p ~/notes/inbox"
    echo "     echo 'My first note' > ~/notes/inbox/test.md"
    echo ""
    echo "  2. Sort your notes:"
    echo "     bun run src/cli.ts sort"
    echo ""
    echo "  3. Or enable watch mode:"
    echo "     bun run src/cli.ts watch"
fi

echo ""
echo "For help, run:"
if [[ -f ./sortr ]]; then
    echo "  ./sortr --help"
else
    echo "  bun run src/cli.ts --help"
fi

echo ""
echo "Documentation:"
echo "  • Quick Start: docs/QUICKSTART.md"
echo "  • Full Guide: README.md"
echo "  • Configuration: examples/config.yaml"
echo ""
echo "Happy note sorting! 📝✨"
