import * as fs from 'fs';
import simpleGit from 'simple-git';
import { generateDocSection, AIOptions } from '../ai';

// Generate professional pull request description from git diff
export async function generatePrDesc(
  inputDir: string,
  outputFile: string,
  apiKey: string,
  aiOptions?: AIOptions,
  gitOptions?: { base?: string; head?: string }
) {
  console.log('Analyzing git changes...');

  const git = simpleGit(inputDir);

  try {
    const diffArgs: string[] = [];
    if (gitOptions?.base) {
      if (gitOptions.head) {
        diffArgs.push(`${gitOptions.base}...${gitOptions.head}`);
      } else {
        diffArgs.push(gitOptions.base);
      }
      console.log(`  Comparing: ${diffArgs[0]}`);
    }

    // Get diff summary with compact format
    const diff = await git.diffSummary(diffArgs);
    const diffText = await git.diff(diffArgs);

    const fileChanges = diff.files.map((f) => {
      const ins = 'insertions' in f ? (f.insertions as number) : 0;
      const del = 'deletions' in f ? (f.deletions as number) : 0;
      return `- ${f.file} (+${ins}/-${del})`;
    }).join('\n');

    // Build compact summary for token efficiency
    const compactSummary = `Files changed: ${diff.files.length}
Insertions: ${diff.insertions}
Deletions: ${diff.deletions}

Changed files:
${fileChanges}`;

    // Limit diff size for token efficiency
    const diffPreview = diffText.length > 5000
      ? diffText.slice(0, 5000) + '\n\n... (diff truncated for brevity)'
      : diffText;

    const snippet = `${compactSummary}\n\nDiff preview:\n${diffPreview}`;

    console.log(`  ${diff.files.length} files changed (${diff.insertions} insertions, ${diff.deletions} deletions)`);
    console.log('Generating PR description...');

    const desc = await generateDocSection(
      snippet,
      'pr',
      apiKey,
      undefined,
      aiOptions,
      compactSummary
    );

    fs.writeFileSync(outputFile, desc);
    console.log(`PR description saved to ${outputFile}`);
  } catch (error: any) {
    if (error.message.includes('not a git repository')) {
      throw new Error('Not a git repository. Please run this command in a git repository.');
    }
    throw error;
  }
}
