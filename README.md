# LazyDocs

> Stop writing docs. Let AI do it.

[![npm](https://img.shields.io/npm/v/@tfkedar/lazydocs)](https://www.npmjs.com/package/@tfkedar/lazydocs)
[![CI](https://github.com/kedar49/lazydocs/workflows/CI/badge.svg)](https://github.com/kedar49/lazydocs/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LazyDocs uses Groq's lightning-fast AI to generate professional documentation from your codebase. READMEs, PR descriptions, changelogs—all in seconds.

## Why LazyDocs?

- **Fast** - Powered by Groq's LLM inference (seriously fast)
- **Smart** - Analyzes your actual code structure
- **Easy** - Interactive CLI that just works
- **Free** - Groq API is free to use

## Install

```bash
npm install -g @tfkedar/lazydocs
```

## Setup

Get a free API key from [console.groq.com](https://console.groq.com), then:

```bash
lazydocs config set GROQ_API_KEY=your_key_here
```

## Use

### Interactive Mode (Recommended)

```bash
lazydocs generate --interactive
```

Walks you through everything. Pick what to generate, choose your model, done.

### Quick Commands

```bash
# Generate README
lazydocs generate --type readme

# Generate PR description
lazydocs generate --type pr

# Generate changelog from git history
lazydocs generate --type changelog
```

### Advanced

```bash
lazydocs generate \
  --type readme \
  --input ./src \
  --model llama-3.1-8b-instant \
  --temperature 0.7 \
  --verbose
```

## What It Does

LazyDocs scans your code (JS, TS, JSX, TSX) and generates:

- **READMEs** - Project overview, installation, usage, API docs
- **PR Descriptions** - Summary of changes from git diff
- **Changelogs** - Categorized release notes from commits

## Models

Popular models (all with 131K+ context):

- `llama-3.3-70b-versatile` - Best quality (default)
- `llama-3.1-8b-instant` - Fastest
- `openai/gpt-oss-120b` - OpenAI 120B
- `openai/gpt-oss-20b` - OpenAI 20B

```bash
# List available models
lazydocs models

# Fetch latest from API
lazydocs models --refresh
```

Interactive mode automatically fetches the latest models.

## Examples

### Generate README for your project

```bash
cd my-awesome-project
lazydocs generate --type readme
```

Creates `README.md` with:
- Project overview
- Installation steps
- Usage examples
- API documentation

### Create PR description

```bash
git add .
lazydocs generate --type pr --output PR.md
```

Analyzes your changes and writes a clear PR description.

### Auto-generate changelog

```bash
lazydocs generate --type changelog
```

Reads your git history and creates a formatted changelog.

## Configuration

Config lives in `~/.lazydocs`:

```bash
# Set API key
lazydocs config set GROQ_API_KEY=your_key

# View all config
lazydocs config list

# Get specific value
lazydocs config get GROQ_API_KEY
```

## Options

```
lazydocs generate [options]

Options:
  -i, --input <dir>       Code directory (default: "./src")
  -o, --output <file>     Output file (auto-detected)
  -t, --type <type>       readme | pr | changelog (default: "readme")
  -m, --model <model>     AI model to use
  --temperature <n>       Creativity 0-1 (default: 0.7)
  --max-tokens <n>        Max response length (default: 2048)
  --interactive           Interactive mode
  --verbose               Show details
  -h, --help              Show help
```

## Tips

- Use `--interactive` for the easiest experience
- Try different models—faster isn't always worse
- Use `--verbose` to see what's happening
- Works best with well-structured code

## Requirements

- Node.js 18 or higher
- Free Groq API key

## Contributing

Found a bug? Want a feature? [Open an issue](https://github.com/kedar49/lazydocs/issues) or submit a PR.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © [Kedar Sathe](https://github.com/kedar49)

## Links

- [NPM Package](https://www.npmjs.com/package/@tfkedar/lazydocs)
- [GitHub Repo](https://github.com/kedar49/lazydocs)
- [Report Issues](https://github.com/kedar49/lazydocs/issues)
- [Groq Console](https://console.groq.com)

---

Built with [Groq](https://groq.com) • Made by [@kedar49](https://github.com/kedar49)
