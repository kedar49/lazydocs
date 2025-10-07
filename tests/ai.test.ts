import { generateDocSection, AVAILABLE_MODELS } from '../src/ai';

describe('AI Documentation Generator', () => {
    const mockApiKey = 'test-api-key';
    const mockCode = `
function hello() {
  return 'world';
}
  `;

    test('should export available models', () => {
        expect(AVAILABLE_MODELS).toBeDefined();
        expect(Array.isArray(AVAILABLE_MODELS)).toBe(true);
        expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
    });

    test('should have correct function signature', () => {
        expect(typeof generateDocSection).toBe('function');
    });

    // Note: Actual API tests would require a real API key
    // These are structure tests only
    test('should accept all required parameters', () => {
        const params = {
            codeSnippet: mockCode,
            type: 'readme' as const,
            apiKey: mockApiKey,
        };

        expect(() => {
            // Just checking the function accepts these parameters
            const result = generateDocSection(params.codeSnippet, params.type, params.apiKey);
            expect(result).toBeDefined();
        }).not.toThrow();
    });

    test('should accept optional parameters', () => {
        const params = {
            codeSnippet: mockCode,
            type: 'readme' as const,
            apiKey: mockApiKey,
            customPrompt: 'Custom prompt',
            options: {
                model: 'llama-3.1-70b-versatile',
                temperature: 0.5,
                maxTokens: 1024,
            },
        };

        expect(() => {
            const result = generateDocSection(
                params.codeSnippet,
                params.type,
                params.apiKey,
                params.customPrompt,
                params.options
            );
            expect(result).toBeDefined();
        }).not.toThrow();
    });
});
