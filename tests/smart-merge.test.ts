// Unit and integration tests for smart merge functionality and template customization
import { mergeContent } from '../src/utils/merger';
import { generateReadme } from '../src/o/r';
import * as fs from 'fs';
import * as path from 'path';

// Mock AI service to prevent actual Groq API calls during testing
jest.mock('../src/ai', () => ({
  generateDocSection: jest.fn().mockImplementation((code, type, apiKey, prompt) => {
    if (type === 'readme') {
      if (prompt && prompt.includes('usage')) {
        return 'Mocked Usage Content';
      }
      return 'Mocked Overview Content';
    }
    return 'Mocked Content';
  }),
}));

describe('Smart Merge Utility', () => {
  test('should fallback to complete overwrite if no anchors exist', () => {
    const existing = '# Old Readme\nSome old text.';
    const newContent = '<!-- lazydocs:start:overview -->\nNew Overview\n<!-- lazydocs:end:overview -->';
    const result = mergeContent(existing, newContent);
    expect(result).toBe(newContent);
  });

  test('should only update sections inside matched anchors', () => {
    const existing = `# My Readme
Pre-text here.

<!-- lazydocs:start:overview -->
Old Overview
<!-- lazydocs:end:overview -->

Middle text.

<!-- lazydocs:start:usage -->
Old Usage
<!-- lazydocs:end:usage -->

Post-text here.`;

    const newContent = `<!-- lazydocs:start:overview -->
New Overview
<!-- lazydocs:end:overview -->

<!-- lazydocs:start:usage -->
New Usage
<!-- lazydocs:end:usage -->`;

    const expected = `# My Readme
Pre-text here.

<!-- lazydocs:start:overview -->
New Overview
<!-- lazydocs:end:overview -->

Middle text.

<!-- lazydocs:start:usage -->
New Usage
<!-- lazydocs:end:usage -->

Post-text here.`;

    const result = mergeContent(existing, newContent);
    expect(result).toBe(expected);
  });

  test('should not affect other anchors if only one is present', () => {
    const existing = `# My Readme
<!-- lazydocs:start:overview -->
Old Overview
<!-- lazydocs:end:overview -->`;

    const newContent = `<!-- lazydocs:start:overview -->
New Overview
<!-- lazydocs:end:overview -->

<!-- lazydocs:start:usage -->
New Usage
<!-- lazydocs:end:usage -->`;

    const expected = `# My Readme
<!-- lazydocs:start:overview -->
New Overview
<!-- lazydocs:end:overview -->`;

    const result = mergeContent(existing, newContent);
    expect(result).toBe(expected);
  });
});

describe('Custom Template and Integration', () => {
  const testDir = path.join(__dirname, 'smart_merge_fixtures');
  const customTemplateFile = path.join(testDir, 'custom.hbs');
  const outputFile = path.join(testDir, 'README.md');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(
      customTemplateFile,
      `# Custom Template: {{projectName}}
<!-- lazydocs:start:overview -->
{{{overview}}}
<!-- lazydocs:end:overview -->`
    );
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should read custom template path and output correctly', async () => {
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }

    // We can run generateReadme passing the custom template
    await generateReadme(
      testDir,
      outputFile,
      'gsk_fakeapikey1234567890',
      {},
      customTemplateFile
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('Custom Template:');
    expect(content).toContain('Mocked Overview Content');
  });

  test('should merge with custom template on subsequent runs', async () => {
    // Write manual content to output file
    fs.writeFileSync(
      outputFile,
      `# Custom Template: Custom
Manual addition.
<!-- lazydocs:start:overview -->
Mocked Overview Content
<!-- lazydocs:end:overview -->`
    );

    // Run generation again
    await generateReadme(
      testDir,
      outputFile,
      'gsk_fakeapikey1234567890',
      {},
      customTemplateFile
    );

    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain('Manual addition.');
    expect(content).toContain('Mocked Overview Content');
  });
});
