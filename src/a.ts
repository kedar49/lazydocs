import * as parser from '@babel/parser';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface CodeAnalysis {
  functions: string[];
  classes: string[];
  snippets: string;
  fileCount: number;
  totalLines: number;
  totalSize: number;
  complexity: number;
  fileStats?: FileStats[];
  compactSummary?: string;
}

export interface FileStats {
  file: string;
  lines: number;
  size: number;
  functions: number;
  classes: number;
}

interface ProjectConfig {
  fileTypes?: string[];
  features?: string[];
}

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py'];

// Estimate token count (1 token approximately equals 4 characters)
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export function analyzeCode(dir: string, maxTokens: number = 6000): CodeAnalysis {
  let functions: string[] = [];
  let classes: string[] = [];
  let fullSnippet = '';
  let fileCount = 0;
  let totalLines = 0;
  let totalSize = 0;
  let complexitySum = 0;
  let complexityCount = 0;
  const fileStats: FileStats[] = [];

  // Load project config
  let projectConfig: ProjectConfig = {};
  const configPath = path.join(process.cwd(), '.lazydocs.json');
  if (fs.existsSync(configPath)) {
    try {
      projectConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.warn('Failed to parse .lazydocs.json');
    }
  }
  const allowedFileTypes = projectConfig.fileTypes || SUPPORTED_EXTENSIONS;

  const logError = (message: string) => {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logFile = path.join(logDir, 'error.log');
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${message}\n`);
  };

  function analyzeDirectory(currentDir: string): void {
    if (!fs.existsSync(currentDir)) {
      logError(`Directory not found: ${currentDir}`);
      console.warn(`Directory not found: ${currentDir}`);
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '__pycache__'].includes(entry.name)) {
          analyzeDirectory(fullPath);
        }
        continue;
      }

      const ext = path.extname(entry.name);
      if (!allowedFileTypes.includes(ext)) {
        continue;
      }

      try {
        const code = fs.readFileSync(fullPath, 'utf-8');
        const stats = fs.statSync(fullPath);
        totalSize += stats.size;
        const lines = code.split('\n').length;
        totalLines += lines;
        fileCount++;

        let fileFunctions = 0;
        let fileClasses = 0;

        // Only add full code if we're under token limit for efficient API usage
        const currentTokens = estimateTokenCount(fullSnippet);
        if (currentTokens < maxTokens) {
          fullSnippet += `\n// File: ${path.relative(dir, fullPath)}\n${code.slice(0, 2000)}\n`;
        }

        // JavaScript/TypeScript analysis
        if (['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'].includes(ext)) {
          const plugins: any[] = ['typescript'];
          if (ext === '.tsx' || ext === '.jsx') {
            plugins.push('jsx');
          }

          const ast = parser.parse(code, {
            sourceType: 'module',
            plugins,
            errorRecovery: true,
          });

          let localComplexity = 1;
          ast.program.body.forEach(node => {
            if (node.type === 'FunctionDeclaration') {
              functions.push(node.id?.name || 'anonymous');
              fileFunctions++;
              localComplexity += 1;
            }
            if (node.type === 'ClassDeclaration') {
              classes.push(node.id?.name || 'anonymous');
              fileClasses++;
              localComplexity += 2;
            }
            if (node.type === 'VariableDeclaration') {
              node.declarations.forEach(decl => {
                if (decl.init && (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression')) {
                  if (decl.id.type === 'Identifier') {
                    functions.push(decl.id.name);
                    fileFunctions++;
                    localComplexity += 1;
                  }
                }
              });
            }
            if (node.type === 'IfStatement' || node.type === 'ForStatement' || node.type === 'WhileStatement') {
              localComplexity += 1;
            }
          });
          complexitySum += localComplexity;
          complexityCount += 1;

          // Track detailed file statistics
          fileStats.push({
            file: path.relative(dir, fullPath),
            lines,
            size: stats.size,
            functions: fileFunctions,
            classes: fileClasses,
          });
        }

        // Python analysis
        if (ext === '.py') {
          try {
            const pythonScript = `
import ast
import json
import sys
try:
    with open('${fullPath.replace(/\\/g, '\\\\')}', 'r', encoding='utf-8') as f:
        tree = ast.parse(f.read())
    functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
    classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
    complexity = sum(1 for node in ast.walk(tree) if isinstance(node, (ast.If, ast.For, ast.While))) + len(functions) + 2 * len(classes)
    print(json.dumps({"functions": functions, "classes": classes, "complexity": complexity}))
except Exception as e:
    print(json.dumps({"functions": [], "classes": [], "complexity": 1}))
`;
            const tempFile = path.join(process.cwd(), 'temp_analyze.py');
            fs.writeFileSync(tempFile, pythonScript);
            const result = execSync('python temp_analyze.py', { encoding: 'utf-8', timeout: 5000 });
            fs.unlinkSync(tempFile);
            const { functions: pyFunctions, classes: pyClasses, complexity: pyComplexity } = JSON.parse(result);
            functions.push(...pyFunctions);
            classes.push(...pyClasses);
            fileFunctions = pyFunctions.length;
            fileClasses = pyClasses.length;
            complexitySum += pyComplexity;
            complexityCount += 1;

            // Track Python file stats
            fileStats.push({
              file: path.relative(dir, fullPath),
              lines,
              size: stats.size,
              functions: fileFunctions,
              classes: fileClasses,
            });
          } catch (error) {
            logError(`Python analysis failed for ${fullPath}: ${(error as Error).message}`);
            console.warn(`Failed to analyze Python file ${fullPath}`);
          }
        }
      } catch (error) {
        logError(`Failed to parse ${fullPath}: ${(error as Error).message}`);
        console.warn(`Failed to parse ${fullPath}: ${(error as Error).message}`);
      }
    }
  }

  analyzeDirectory(dir);

  // Build compact summary for token-efficient API calls
  const compactSummary = buildCompactSummary(fileStats, fileCount, totalLines, totalSize, functions.length, classes.length);

  return {
    functions: [...new Set(functions)],
    classes: [...new Set(classes)],
    snippets: fullSnippet.slice(0, 8000),
    fileCount,
    totalLines,
    totalSize,
    complexity: complexityCount ? complexitySum / complexityCount : 0,
    fileStats,
    compactSummary,
  };
}

// Build compact summary for token efficiency
function buildCompactSummary(
  fileStats: FileStats[],
  fileCount: number,
  totalLines: number,
  totalSize: number,
  totalFunctions: number,
  totalClasses: number
): string {
  const sorted = [...fileStats].sort((a, b) => b.lines - a.lines);
  const top = sorted.slice(0, 15); // Top 15 files by lines

  const lines: string[] = [];
  lines.push(`Project Summary:`);
  lines.push(`- Files: ${fileCount}`);
  lines.push(`- Total lines: ${totalLines.toLocaleString()}`);
  lines.push(`- Total size: ${(totalSize / 1024).toFixed(1)} KB`);
  lines.push(`- Functions: ${totalFunctions}`);
  lines.push(`- Classes: ${totalClasses}`);
  lines.push('');
  lines.push('Key files:');

  for (const f of top) {
    const details = [];
    if (f.functions > 0) details.push(`${f.functions} fn`);
    if (f.classes > 0) details.push(`${f.classes} cls`);
    const detailStr = details.length > 0 ? ` (${details.join(', ')})` : '';
    lines.push(`- ${f.file}: ${f.lines} lines${detailStr}`);
  }

  if (sorted.length > top.length) {
    lines.push(`...and ${sorted.length - top.length} more files`);
  }

  return lines.join('\n');
}
