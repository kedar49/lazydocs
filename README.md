# LazyDocs

> AI-powered documentation generator using Groq's lightning-fast LLM API

[![npm version](https://img.shields.io/npm/v/@tfkedar/lazydocs)](https://www.npmjs.com/package/@tfkedar/lazydocs)
[![CI](https://github.com/kedar49/lazydocs/workflows/CI/badge.svg)](https://github.com/kedar49/lazydocs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate professional READMEs, PR descriptions, and changelogs from your codebase automatically.

## Quick Start

```bash
# Install
npm install -g @tfkedar/lazydocs

# Configure
lazydocs config set GROQ_API_KEY=your_key_here

# Generate (interactive)
lazydocs generate --interactive
```

Get your free API key at [console.groq.com](https://console.groq.com)

## Features

- 🤖 **AI-Powered** - Uses Groq's fast LLM inference
- 📝 **Multiple Formats** - README, PR descriptions, changelogs
- ⚡ **Fast** - Analyzes JS/TS/JSX/TSX codebases in seconds
- 🎨 **Interactive** - Easy-to-use CLI with prompts
- 🔧 **Configurable** - Choose models, adjust parameters

## Usage

### Generate README
```bash
lazydocs generate --type readme --input ./src
```

### Generate PR Description
```bash
lazydocs generate --type pr
```

### Generate Changelog
```bash
lazydocs generate --type changelog
```

### Interactive Mode
```bash
lazydocs generate --interactive
```

## Commands

| Command | Description |
|---------|-------------|
| `generate` | Generate documentation |
| `config` | Manage configuration |
| `init` | Initialize project |
| `models` | List available AI models |

## Options

```bash
lazydocs generate [options]

Options:
  -i, --input <dir>       Input directory (default: "./src")
  -o, --output <file>     Output file
  -t, --type <type>       Type: readme, pr, changelog (default: "readme")
  -m, --model <model>     AI model to use
  --temperature <temp>    AI temperature 0-1 (default: 0.7)
  --max-tokens <tokens>   Max tokens (default: 2048)
  --interactive           Interactive mode
  --verbose               Verbose output
```

## Available Models

- `llama-3.1-70b-versatile` - Best quality (default)
- `llama-3.1-8b-instant` - Fastest
- `mixtral-8x7b-32768` - Large context
- `gemma2-9b-it` - Efficient

## Configuration

Config stored in `~/.lazydocs`:

```bash
# Set API key
lazydocs config set GROQ_API_KEY=your_key

# View config
lazydocs config list
```

## Examples

### Basic README Generation
```bash
cd my-project
lazydocs generate
```

### Custom Model and Output
```bash
lazydocs generate \
  --type readme \
  --model llama-3.1-8b-instant \
  --output ./docs/README.md
```

### PR Description from Git Diff
```bash
git add .
lazydocs generate --type pr --output PR.md
```

## Supported Files

- JavaScript (`.js`, `.mjs`, `.cjs`)
- TypeScript (`.ts`)
- React (`.jsx`, `.tsx`)

## Requirements

- Node.js >= 18
- Groq API key (free at [console.groq.com](https://console.groq.com))

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT © [Kedar Sathe](https://github.com/kedar49)

## Links

- [NPM Package](https://www.npmjs.com/package/@tfkedar/lazydocs)
- [GitHub Repository](https://github.com/kedar49/lazydocs)
- [Report Issues](https://github.com/kedar49/lazydocs/issues)
- [Groq API](https://console.groq.com)

---

*Made with ❤️ by Kedar*
