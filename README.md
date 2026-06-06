# LazyDocs

AI-powered documentation generator using Groq. Generate READMEs, PR descriptions, and changelogs in seconds.

[![npm](https://img.shields.io/npm/v/@lazykedar/lazydocs)](https://www.npmjs.com/package/@lazykedar/lazydocs)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install -g @lazykedar/lazydocs
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

- **Fast** - Powered by Groq's LLM inference.
- **Smart Merging** - Automatically updates sections within comment anchors (`<!-- lazydocs:start:section -->`), preserving manual edits.
- **Custom Templates** - Use your own Handlebars layouts to structure README files.
- **Branch Comparison** - Compare custom branch ranges for precise PR descriptions.
- **Reliable** - Automatic retry logic with exponential backoff.
- **Easy** - Interactive CLI with helpful prompts.

## Configuration

Interactive setup (recommended):
```bash
lazydocs config setup
```

Or configure parameters individually:
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
  --template <path>       Custom Handlebars template path (README only)
  --base <branch>         Base branch for PR diff comparison
  --head <branch>         Head branch for PR diff comparison
```

## Advanced Usage

### 🔄 Smart Merging (Incremental Updates)

To prevent `lazydocs` from overwriting custom edits in your README, wrap dynamic sections in comment anchors. On subsequent runs, `lazydocs` will only update content within these tags:

```markdown
# My Project

This is a manually written description that will never be overwritten.

## 📋 Overview
<!-- lazydocs:start:overview -->
Overview content automatically managed by lazydocs.
<!-- lazydocs:end:overview -->

Some other manual developer notes...
```

Supported default anchors:
- `<!-- lazydocs:start:overview -->` / `<!-- lazydocs:end:overview -->`
- `<!-- lazydocs:start:stats -->` / `<!-- lazydocs:end:stats -->`
- `<!-- lazydocs:start:usage -->` / `<!-- lazydocs:end:usage -->`
- `<!-- lazydocs:start:api -->` / `<!-- lazydocs:end:api -->`

### 🎨 Custom Templates

Create a custom Handlebars file (e.g. `my-readme.hbs`) and specify it with the `--template` option:

```bash
lazydocs generate --type readme --template ./my-readme.hbs
```

Available variables in the template:
- `{{projectName}}` - Name of the project.
- `{{{overview}}}` - Generated overview section.
- `{{{usage}}}` - Generated usage guidelines.
- `{{stats}}` - Object containing `fileCount`, `totalLines`, `functions`, `classes`, and `complexity`.
- `{{apis}}` - List of parsed functions and classes containing `name` and `desc`.

### 🔀 Git PR Branch Comparisons

Generate PR descriptions by comparing custom git branches:

```bash
# Compare the current branch against main
lazydocs generate --type pr --base main

# Compare a feature branch against production
lazydocs generate --type pr --base production --head feature-login
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

- [NPM Package](https://www.npmjs.com/package/@lazykedar/lazydocs)
- [GitHub](https://github.com/kedar49/lazydocs)
- [Issues](https://github.com/kedar49/lazydocs/issues)
- [Groq Console](https://console.groq.com)

## License

MIT © [Kedar Sathe](https://github.com/kedar49)
