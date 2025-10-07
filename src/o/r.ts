import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { generateDocSection, AIOptions } from '../ai';
import { analyzeCode } from '../a';

export async function generateReadme(
  inputDir: string,
  outputFile: string,
  apiKey: string,
  aiOptions?: AIOptions
) {
  console.log('Analyzing codebase...');
  const analysis = analyzeCode(inputDir);

  console.log(`  Found ${analysis.fileCount} files, ${analysis.totalLines} lines`);
  console.log(`  Functions: ${analysis.functions.length}, Classes: ${analysis.classes.length}`);

  // Show compact summary if available
  if (analysis.compactSummary) {
    console.log('\nProject Structure:');
    console.log(analysis.compactSummary.split('\n').map(l => `  ${l}`).join('\n'));
  }

  console.log('\nGenerating documentation...');

  // Use compact summary for better token efficiency
  const contextSnippet = analysis.compactSummary
    ? `${analysis.compactSummary}\n\nCode samples:\n${analysis.snippets.slice(0, 4000)}`
    : analysis.snippets;

  const overview = await generateDocSection(
    contextSnippet,
    'readme',
    apiKey,
    undefined,
    aiOptions,
    analysis.compactSummary
  );

  const usage = await generateDocSection(
    contextSnippet,
    'readme',
    apiKey,
    'Generate practical usage examples with code snippets showing how to use this project',
    aiOptions,
    analysis.compactSummary
  );

  // Generate API docs for top functions/classes (limit to avoid rate limits)
  const topItems = [...analysis.functions, ...analysis.classes].slice(0, 8);
  const apis = topItems.map(name => ({
    name,
    desc: `${name} - Core functionality (see code for details)`,
  }));

  // Try to read project name from package.json
  let projectName = 'Your Project';
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      projectName = pkg.name || projectName;
    } catch (error) {
      // Ignore
    }
  }

  // Load template
  const templatePath = path.join(__dirname, '../t/r.hbs');
  const template = handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));

  const content = template({
    projectName,
    overview,
    usage,
    apis,
    stats: {
      fileCount: analysis.fileCount,
      totalLines: analysis.totalLines,
      functions: analysis.functions.length,
      classes: analysis.classes.length,
      totalSize: (analysis.totalSize / 1024).toFixed(1),
      complexity: analysis.complexity.toFixed(1),
    },
  });

  fs.writeFileSync(outputFile, content);
}
