import * as parser from '@babel/parser';
import * as fs from 'fs';
import * as path from 'path';

export interface CodeAnalysis {
  functions: string[];
  classes: string[];
  snippets: string;
  fileCount: number;
  totalLines: number;
}

const SUPPORTED_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];

export function analyzeCode(dir: string): CodeAnalysis {
  let functions: string[] = [];
  let classes: string[] = [];
  let fullSnippet = '';
  let fileCount = 0;
  let totalLines = 0;

  function analyzeDirectory(currentDir: string): void {
    if (!fs.existsSync(currentDir)) {
      console.warn(`Directory not found: ${currentDir}`);
      return;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Skip node_modules, .git, dist, build directories
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.next'].includes(entry.name)) {
          analyzeDirectory(fullPath);
        }
        continue;
      }

      const ext = path.extname(entry.name);
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        try {
          const code = fs.readFileSync(fullPath, 'utf-8');
          const lines = code.split('\n').length;
          totalLines += lines;
          fileCount++;

          fullSnippet += `\n// File: ${path.relative(dir, fullPath)}\n${code}\n`;

          const plugins: any[] = ['typescript', 'jsx'];
          if (ext === '.tsx' || ext === '.jsx') {
            plugins.push('jsx');
          }

          const ast = parser.parse(code, {
            sourceType: 'module',
            plugins,
            errorRecovery: true,
          });

          ast.program.body.forEach(node => {
            if (node.type === 'FunctionDeclaration') {
              functions.push(node.id?.name || 'anonymous');
            }
            if (node.type === 'ClassDeclaration') {
              classes.push(node.id?.name || 'anonymous');
            }
            // Also capture arrow functions and class methods
            if (node.type === 'VariableDeclaration') {
              node.declarations.forEach(decl => {
                if (decl.init && (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression')) {
                  if (decl.id.type === 'Identifier') {
                    functions.push(decl.id.name);
                  }
                }
              });
            }
          });
        } catch (error) {
          console.warn(`Failed to parse ${fullPath}:`, (error as Error).message);
        }
      }
    }
  }

  analyzeDirectory(dir);

  return {
    functions: [...new Set(functions)], // Remove duplicates
    classes: [...new Set(classes)],
    snippets: fullSnippet.slice(0, 8000), // Increased limit
    fileCount,
    totalLines,
  };
}