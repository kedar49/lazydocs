# Contributing to LazyDocs

Thank you for your interest in contributing to LazyDocs! 🎉

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Git
- A Groq API key (for testing)

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/lazydocs.git
cd lazydocs
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the project**
```bash
npm run build
```

4. **Run tests**
```bash
npm test
```

5. **Set up your API key**
```bash
export GROQ_API_KEY=your_api_key_here
```

## Development Workflow

### Project Structure
```
src/
├── cli.ts          # CLI entry point
├── ai.ts           # AI integration with Groq
├── a.ts            # Code analyzer
├── o/              # Output generators (short names for brevity)
│   ├── r.ts        # README generator
│   ├── p.ts        # PR description generator
│   └── c.ts        # Changelog generator
└── t/              # Templates
    └── r.hbs       # README Handlebars template
```

### Making Changes

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test your changes**
```bash
npm test
npm run build
```

4. **Commit your changes**
```bash
git commit -m "feat: add amazing feature"
```

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

5. **Push and create a PR**
```bash
git push origin feature/your-feature-name
```

## Code Style

- Use TypeScript
- Follow existing formatting
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Adding New Features

### Adding a New AI Model
1. Update `AVAILABLE_MODELS` in `src/ai.ts`
2. Test with the new model
3. Update documentation

### Adding a New File Type
1. Update `SUPPORTED_EXTENSIONS` in `src/a.ts`
2. Add appropriate Babel plugins if needed
3. Test with sample files
4. Update documentation

### Adding a New Output Type
1. Create a new generator in `src/o/`
2. Add template in `src/t/`
3. Update CLI in `src/cli.ts`
4. Add tests
5. Update documentation

## Documentation

- Update README.md for user-facing changes
- Update CHANGELOG.md following Keep a Changelog format
- Add JSDoc comments for public APIs
- Include code examples where helpful

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Include relevant issue numbers if applicable
3. Update documentation as needed
4. Ensure all tests pass
5. Request review from maintainers

### PR Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Commit messages follow convention

## Reporting Bugs

### Before Submitting
- Check existing issues
- Try the latest version
- Gather relevant information

### Bug Report Template
```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g., macOS 14.0]
- Node version: [e.g., 18.0.0]
- LazyDocs version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## Feature Requests

We welcome feature requests! Please:
- Check if it's already requested
- Describe the use case
- Explain why it would be useful
- Provide examples if possible

## Questions?

- Open a GitHub issue
- Check existing documentation
- Review closed issues for similar questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LazyDocs! 🚀
