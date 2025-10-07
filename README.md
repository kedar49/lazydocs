# 🚀 LazyDocs

AI-powered documentation generator for your codebase using Groq's lightning-fast LLM API.

[![npm version](https://img.shields.io/npm/v/lazydocs)](https://www.npmjs.com/package/lazydocs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/lazydocs)](https://nodejs.org)

## ✨ Features

- 🤖 **AI-Powered**: Uses Groq's fast LLM API for intelligent documentation
- 📝 **Multiple Formats**: Generate README, PR descriptions, and changelogs
- 🔍 **Smart Code Analysis**: Automatically analyzes JS/TS/JSX/TSX codebases
- 🎨 **Customizable**: Choose from multiple AI models and adjust parameters
- ⚡ **Lightning Fast**: Leverages Groq's high-speed inference
- 🛠️ **CLI & Interactive**: Use via command line or interactive prompts
- 📦 **Easy Install**: Works with npm and Homebrew

## 🚀 Quick Start

### Installation

#### Via npm (recommended)
```bash
npm install -g lazydocs
```

#### Via Homebrew (macOS/Linux)
```bash
brew install lazydocs
```

### Basic Usage

```bash
# Generate README for your project
lazydocs generate --type readme --input ./src --output ./README.md

# Interactive mode (easiest!)
lazydocs generate --interactive

# Generate PR description
lazydocs generate --type pr --output ./PR_DESCRIPTION.md

# Generate changelog from git history
lazydocs generate --type changelog --output ./CHANGELOG.md
```

### First-Time Setup

```bash
# Set your Groq API key (get one at console.groq.com)
lazydocs config set GROQ_API_KEY=your_api_key_here

# Or use environment variable
export GROQ_API_KEY=your_api_key_here
```

## 📚 Documentation

### Commands

#### `generate`
Generate documentation from your codebase.

```bash
lazydocs generate [options]
```

**Options:**
- `-i, --input <dir>` - Input code directory (default: `./src`)
- `-o, --output <file>` - Output file (auto-detected by type)
- `-t, --type <type>` - Document type: `readme`, `pr`, `changelog` (default: `readme`)
- `-m, --model <model>` - AI model to use (default: `llama-3.1-70b-versatile`)
- `--temperature <temp>` - AI creativity level 0-1 (default: `0.7`)
- `--max-tokens <tokens>` - Maximum tokens (default: `2048`)
- `--interactive` - Interactive mode with prompts
- `--verbose` - Show detailed output

**Examples:**
```bash
# Generate README with custom model
lazydocs generate -t readme -m llama-3.1-8b-instant

# Generate PR description with verbose output
lazydocs generate -t pr --verbose

# Use interactive mode
lazydocs generate --interactive
```

#### `config`
Manage configuration settings.

```bash
# Set a config value
lazydocs config set KEY=value

# Get a config value
lazydocs config get KEY

# List all config
lazydocs config list
```

#### `init`
Initialize LazyDocs in your project.

```bash
lazydocs init
```

Creates a `.lazydocs.json` configuration file with project-specific settings.

#### `models`
List available AI models.

```bash
lazydocs models
```

### Available AI Models

- `llama-3.1-70b-versatile` - Best quality, slower (default)
- `llama-3.1-8b-instant` - Fast, good quality
- `mixtral-8x7b-32768` - Large context window
- `gemma2-9b-it` - Efficient, good for simple tasks

### Supported File Types

LazyDocs analyzes the following file types:
- `.js` - JavaScript
- `.ts` - TypeScript
- `.jsx` - React JavaScript
- `.tsx` - React TypeScript
- `.mjs` - ES Modules
- `.cjs` - CommonJS

## 🔧 Configuration

LazyDocs stores configuration in `~/.lazydocs`. You can set:

- `GROQ_API_KEY` - Your Groq API key (required)
- Any custom settings for your workflow

### Project-Specific Config

Create a `.lazydocs.json` in your project root:

```json
{
  "projectName": "my-awesome-project",
  "description": "A cool project",
  "features": ["Installation guide", "API documentation"],
  "createdAt": "2025-01-07T00:00:00.000Z"
}
```

## 🎯 Use Cases

### 1. Generate Project README
```bash
cd my-project
lazydocs generate --type readme --input ./src
```

### 2. Create PR Descriptions
```bash
# After making changes
git add .
lazydocs generate --type pr --output ./PR.md
```

### 3. Auto-Generate Changelogs
```bash
# Generate from git history
lazydocs generate --type changelog
```

### 4. CI/CD Integration
```yaml
# .github/workflows/docs.yml
name: Update Docs
on: [push]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install -g lazydocs
      - run: lazydocs generate --type readme
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
      - run: git commit -am "Update README" && git push
```

## 🏗️ Project Structure

```
lazydocs/
├── src/
│   ├── cli.ts          # CLI entry point
│   ├── ai.ts           # AI integration
│   ├── a.ts            # Code analyzer
│   ├── o/              # Output generators
│   │   ├── r.ts        # README generator
│   │   ├── p.ts        # PR description generator
│   │   └── c.ts        # Changelog generator
│   └── t/              # Templates
│       └── r.hbs       # README template
├── tests/              # Test files
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/kedar49/lazydocs.git
cd lazydocs

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com) - For the amazing fast LLM API
- [Babel](https://babeljs.io) - For code parsing
- [Handlebars](https://handlebarsjs.com) - For templating
- [Commander.js](https://github.com/tj/commander.js) - For CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - For interactive prompts

## 🐛 Issues & Support

Found a bug or have a feature request? Please [open an issue](https://github.com/kedar49/lazydocs/issues).

## 🌟 Show Your Support

If you find LazyDocs helpful, please give it a ⭐️ on [GitHub](https://github.com/kedar49/lazydocs)!

---

*Made with ❤️ by [Kedar Sathe](https://github.com/kedar49)*

*Powered by [Groq](https://groq.com)*
