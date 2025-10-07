import { Groq } from 'groq-sdk';

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Fallback models if API fetch fails
const FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'meta-llama/llama-guard-4-12b',
];

export async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    const groq = new Groq({ apiKey });
    const models = await groq.models.list();
    return models.data
      .filter((model: any) => model.active !== false)
      .map((model: any) => model.id)
      .sort();
  } catch (error) {
    console.warn('Failed to fetch models from API, using fallback list');
    return FALLBACK_MODELS;
  }
}

export function getDefaultModel(): string {
  return DEFAULT_MODEL;
}

export function getFallbackModels(): string[] {
  return FALLBACK_MODELS;
}

export async function generateDocSection(
  codeSnippet: string,
  type: 'readme' | 'pr' | 'changelog',
  apiKey: string,
  customPrompt?: string,
  options: AIOptions = {}
): Promise<string> {
  const groq = new Groq({ apiKey });

  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 2048,
    retries = 3,
  } = options;

  const prompts = {
    readme: customPrompt || `You are a technical documentation expert. Analyze this codebase and generate a comprehensive README section in professional Markdown format.

Code:
${codeSnippet}

Generate:
- Clear project overview and purpose
- Key features and functionality
- Installation instructions
- Usage examples with code snippets
- API documentation if applicable

Keep it concise, professional, and developer-friendly.`,

    pr: customPrompt || `You are a code review expert. Analyze these code changes and generate a clear Pull Request description.

Changes:
${codeSnippet}

Include:
- **Summary**: What was changed and why
- **Changes Made**: Bullet points of key modifications
- **Impact**: How this affects the codebase
- **Testing**: What should be tested
- **Breaking Changes**: Any breaking changes (if applicable)

Format in professional Markdown.`,

    changelog: customPrompt || `You are a release notes expert. Analyze these commit messages and generate a changelog entry.

Commits:
${codeSnippet}

Categorize changes as:
- 🚀 **Features**: New functionality
- 🐛 **Bug Fixes**: Fixed issues
- 📚 **Documentation**: Documentation updates
- 🔧 **Maintenance**: Code improvements, refactoring
- ⚠️ **Breaking Changes**: API changes that break compatibility

Format in Markdown with proper versioning and dates.`,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompts[type] }],
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
      if (attempt === retries) {
        if (error.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key.');
        }
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`AI generation failed: ${error.message}`);
      }

      console.warn(`Attempt ${attempt}/${retries} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return 'Error generating content after multiple attempts';
}
