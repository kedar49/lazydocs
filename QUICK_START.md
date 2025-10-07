# Quick Start

## Install

```bash
npm install -g @tfkedar/lazydocs
```

## Setup

1. Get API key from [console.groq.com](https://console.groq.com)
2. Configure:
```bash
lazydocs config set GROQ_API_KEY=your_key_here
```

## Use

### Interactive (Easiest)
```bash
lazydocs generate --interactive
```

### Generate README
```bash
lazydocs generate --type readme
```

### Generate PR Description
```bash
lazydocs generate --type pr
```

### Generate Changelog
```bash
lazydocs generate --type changelog
```

## Help

```bash
lazydocs --help
lazydocs generate --help
```

That's it! 🚀
