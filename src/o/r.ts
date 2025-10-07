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
  console.log('📊 Analyzing codebase...');
  const analysis = analyzeCode(inputDir);

  console.log(`  Found ${analysis.fileCount} files, ${analysis.totalLines} lines`);
  console.log(`  Functions: ${analysis.functions.length}, Classes: ${analysis.classes.length}`);

  console.log('🤖 Generating documentation sections...');

  const overview = await generateDocSection(
    analysis.snippets,
    'readme',
    apiKey,
    'Generate a comprehensive project overview',
    aiOptions
  );

  const usage = await generateDocSection(
    analysis.snippets,
    'readme',
    apiKey,
    'Generate usage examples with code snippets',
    aiOptions
  );

  // Generate API docs for top functions/classes (limit to avoid rate limits)
  const topItems = [...analysis.functions, ...analysis.classes].slice(0, 10);
  const apis = await Promise.all(
    topItems.map(async (name) => ({
      name,
      desc: await generateDocSection(
        analysis.snippets,
        'readme',
        apiKey,
        `Describe the ${name} function/class briefly`,
        aiOptions
      ),
    }))
  );

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
    },
  });

  fs.writeFileSync(outputFile, content);
}
