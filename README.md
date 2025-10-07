# LazyDocs

AI-powered documentation generator using Groq. Generate READMEs, PR descriptions, and changelogs in seconds.

[![npm](https://img.shields.io/npm/v/@tfkedar/lazydocs)](https://www.npmjs.com/package/@tfkedar/lazydocs)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install -g @tfkedar/lazydocs
```

## Setup

Get a free API key from [console.groq.com](https://console.groq.com):

```bash
lazydocs config set GROQ_API_KEY=your_key_here
```

## Usage

```bash
# Interactive mode (recommended)
lazydocs generate --interactive

# Generate README
lazydocs generate --type readme

# Generate PR description
lazydocs generate --type pr

# Generate changelog
lazydocs generate --type changelog
```

## Features

- Fast - Powered by Groq's LLM inference
- Smart - Token-efficient analysis handles 100+ file projects
- Reliable - Automatic retry logic with exponential backoff
- Easy - Interactive CLI with helpful prompts

## Configuration

```bash
lazydocs config set GROQ_API_KEY=your_key
lazydocs config list
lazydocs config get GROQ_API_KEY
```

## Options

```bash
lazydocs generate [options]

  -i, --input <dir>       Code directory (default: "./src")
  -o, --output <file>     Output file (auto-detected)
  -t, --type <type>       readme | pr | changelog
  -m, --model <model>     AI model to use
  --temperature <temp>    Creativity 0-1 (default: 0.7)
  --max-tokens <tokens>   Max response length (default: 2048)
  --interactive           Interactive mode
  --verbose               Show details
```

## Models

```bash
# List available models
lazydocs models

# Fetch latest from API
lazydocs models --refresh
```

Popular models:
- `llama-3.3-70b-versatile` (default) - Best quality
- `llama-3.1-8b-instant` - Fastest
- `mixtral-8x7b-32768` - Huge context window

## Requirements

- Node.js 18+
- Free Groq API key

## Links

- [NPM Package](https://www.npmjs.com/package/@tfkedar/lazydocs)
- [GitHub](https://github.com/kedar49/lazydocs)
- [Issues](https://github.com/kedar49/lazydocs/issues)
- [Groq Console](https://console.groq.com)

## License

MIT © [Kedar Sathe](https://github.com/kedar49)
