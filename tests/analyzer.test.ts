import { analyzeCode } from '../src/a';
import * as fs from 'fs';
import * as path from 'path';

describe('Code Analyzer', () => {
    const testDir = path.join(__dirname, 'fixtures');

    beforeAll(() => {
        // Create test fixtures
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(testDir, 'test.js'),
            `
function anotherFunction() {
  return 42;
}

class AnotherClass {
  method() {}
}

const arrowFunc = () => {
  return 'arrow';
};
    `
        );
    });

    afterAll(() => {
        // Cleanup
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    test('should analyze JavaScript files', () => {
        const result = analyzeCode(testDir);

        // Should find functions
        expect(result.functions.length).toBeGreaterThan(0);
        expect(result.functions).toContain('anotherFunction');
        expect(result.functions).toContain('arrowFunc');

        // Should find classes
        expect(result.classes.length).toBeGreaterThan(0);
        expect(result.classes).toContain('AnotherClass');

        // Should include code snippets
        expect(result.snippets.length).toBeGreaterThan(0);
    });

    test('should count files and lines', () => {
        const result = analyzeCode(testDir);

        expect(result.fileCount).toBeGreaterThan(0);
        expect(result.totalLines).toBeGreaterThan(0);
    });

    test('should handle empty directories', () => {
        const emptyDir = path.join(testDir, 'empty');
        fs.mkdirSync(emptyDir, { recursive: true });

        const result = analyzeCode(emptyDir);

        expect(result.functions).toEqual([]);
        expect(result.classes).toEqual([]);
        expect(result.snippets).toBe('');
        expect(result.fileCount).toBe(0);
    });

    test('should handle non-existent directories gracefully', () => {
        const result = analyzeCode('/non/existent/path');

        expect(result.functions).toEqual([]);
        expect(result.classes).toEqual([]);
        expect(result.fileCount).toBe(0);
    });
});
