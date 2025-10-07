import * as fs from 'fs';
import simpleGit from 'simple-git';
import { generateDocSection, AIOptions } from '../ai';

export async function generatePrDesc(
  inputDir: string,
  outputFile: string,
  apiKey: string,
  aiOptions?: AIOptions
) {
  console.log('🔍 Analyzing git changes...');

  const git = simpleGit(inputDir);

  try {
    // Get diff summary
    const diff = await git.diffSummary();
    const diffText = await git.diff();

    const snippet = `
Files changed: ${diff.files.length}
Insertions: ${diff.insertions}
Deletions: ${diff.deletions}

Changed files:
${diff.files.map((f) => {
      const ins = 'insertions' in f ? f.insertions : 0;
      const del = 'deletions' in f ? f.deletions : 0;
      return `- ${f.file} (+${ins}/-${del})`;
    }).join('\n')}

Diff preview:
${diffText.slice(0, 3000)}
`;

    console.log(`  ${diff.files.length} files changed`);
    console.log('🤖 Generating PR description...');

    const desc = await generateDocSection(snippet, 'pr', apiKey, undefined, aiOptions);

    fs.writeFileSync(outputFile, desc);
  } catch (error: any) {
    if (error.message.includes('not a git repository')) {
      throw new Error('Not a git repository. Please run this command in a git repository.');
    }
    throw error;
  }
}
