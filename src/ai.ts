import { Groq } from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
  timeout?: number;
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Fallback models for when API fetch fails
const FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
  'llama-3.1-70b-versatile',
];

export function getDefaultModel(): string {
  return DEFAULT_MODEL;
}

export function getFallbackModels(): string[] {
  return FALLBACK_MODELS;
}

interface GroqModel {
  id: string;
  active?: boolean;
}

export async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const groq = new Groq({ apiKey });
    const models = await groq.models.list();
    return models.data
      .filter((model: GroqModel) => model.active !== false)
      .map((model: GroqModel) => model.id)
      .sort();
  } catch (error) {
    console.warn('Failed to fetch models from API, using fallback list');
    return FALLBACK_MODELS;
  }
}

const logError = (message: string) => {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, 'error.log');
  fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
};

// Enhanced prompt builder with structured requirements
function buildEnhancedPrompt(
  codeSnippet: string,
  type: 'readme' | 'pr' | 'changelog',
  compactSummary?: string
): string {
  const prompts = {
    readme: `You are a technical documentation expert. Analyze this codebase and generate a comprehensive, professional README in Markdown.

${compactSummary ? `PROJECT SUMMARY:\n${compactSummary}\n\n` : ''}CODE ANALYSIS:
${codeSnippet}

Generate a complete README with these sections:
1. Project title and tagline
2. Overview - What the project does and why it exists
3. Key Features - Bullet points of main capabilities
4. Installation - Clear setup instructions
5. Usage - Code examples showing how to use it
6. API Reference - Document main functions/classes with descriptions
7. Contributing - Brief guidelines
8. License - Standard license section

Requirements:
- Use clear Markdown formatting with proper headers
- Include code blocks with syntax highlighting
- Keep it concise but comprehensive (800-1200 words)
- Use tables for API documentation
- Professional yet approachable tone
- Focus on what developers need to know`,

    pr: `You are a code review expert. Analyze these code changes and generate a clear, professional Pull Request description in Markdown.

${compactSummary ? `CHANGES SUMMARY:\n${compactSummary}\n\n` : ''}DIFF ANALYSIS:
${codeSnippet}

Generate a PR description with these sections:
## Summary
Brief overview of what changed and why

## Changes Made
- Bullet points of specific changes
- Group related changes together
- Be specific about what was added/modified/removed

## Impact
- How this affects the codebase
- Any breaking changes
- Performance implications

## Testing
- How to verify these changes
- Test scenarios covered

Requirements:
- Clear, scannable format
- Use conventional commit style language
- Highlight breaking changes prominently
- Professional tone suitable for team review`,

    changelog: `You are a release notes expert. Analyze these commits and generate a well-organized changelog entry in Markdown.

${compactSummary ? `COMMIT SUMMARY:\n${compactSummary}\n\n` : ''}COMMIT HISTORY:
${codeSnippet}

Generate a changelog following Keep a Changelog format:

## [Version] - YYYY-MM-DD

### 🚀 Features
- New user-facing features

### 🐛 Bug Fixes
- Issues resolved

### 📚 Documentation
- Doc updates

### 🔧 Maintenance
- Internal improvements, refactoring, dependencies

### ⚠️ Breaking Changes
- Changes that break backward compatibility

Requirements:
- Use emoji for visual scanning
- Group similar changes together
- Use imperative mood ("Add feature" not "Added feature")
- Be specific but concise
- Highlight breaking changes clearly
- Follow semantic versioning principles`,
  };

  return prompts[type];
}

export async function generateDocSection(
  codeSnippet: string,
  type: 'readme' | 'pr' | 'changelog',
  apiKey: string,
  customPrompt?: string,
  options: AIOptions = {},
  compactSummary?: string
): Promise<string> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2048,
    retries = 3,
    timeout = 30000,
  } = options;

  // Build enhanced prompt with structured requirements
  const prompt = customPrompt || buildEnhancedPrompt(codeSnippet, type, compactSummary);

  // Retry logic with exponential backoff for reliability
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const groq = new Groq({
        apiKey,
        timeout,
      });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert technical writer who creates clear, professional documentation.' },
          { role: 'user', content: prompt }
        ],
        model,
        temperature,
        max_tokens: maxTokens,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from AI');
      }

      return content;
    } catch (error: any) {
      const errorMsg = `Attempt ${attempt}/${retries} failed: ${error.message}`;
      logError(errorMsg);

      // Last attempt - throw detailed error
      if (attempt === retries) {
        if (error.status === 401 || error.message?.includes('401')) {
          throw new Error('Invalid API key. Get one from console.groq.com and set with: lazydocs config set GROQ_API_KEY=your_key');
        }
        if (error.status === 429 || error.message?.includes('rate_limit')) {
          throw new Error('Rate limit exceeded. Try:\n' +
            '1. Wait a few minutes and try again\n' +
            '2. Use a faster model: --model llama-3.1-8b-instant\n' +
            '3. Reduce max tokens: --max-tokens 1024');
        }
        if (error.status === 413 || error.message?.includes('too large')) {
          throw new Error('Request too large. Try:\n' +
            '1. Analyze a smaller directory\n' +
            '2. Use a model with larger context window\n' +
            '3. Reduce the amount of code being analyzed');
        }
        if (error.code === 'ENOTFOUND') {
          throw new Error(`Network error: Cannot connect to ${error.hostname}. Check your internet connection.`);
        }
        throw new Error(`AI generation failed after ${retries} attempts: ${error.message}`);
      }

      // Not last attempt - log warning and retry with backoff
      console.warn(`⚠️  ${errorMsg} - retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }

  return 'Error generating content after multiple attempts';
}
