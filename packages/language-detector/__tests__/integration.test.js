import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Helper to run CLI scripts
const runScript = async (scriptPath, args = []) => {
  const fullPath = path.resolve(__dirname, '..', scriptPath);
  // Properly escape arguments containing JSON
  const escapedArgs = args.map(arg => `'${arg}'`).join(' ');
  const command = `node ${fullPath} ${escapedArgs}`;

  try {
    const { stdout, stderr } = await execAsync(command);
    return { stdout: stdout.trim(), stderr: stderr.trim(), success: true };
  } catch (error) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || '',
      success: false,
      code: error.code
    };
  }
};

describe('Language Detection CLI Integration Tests', () => {
  describe('detect-languages.js', () => {
    test('should detect languages for a real repository', async () => {
      const result = await runScript('src/detect-languages.js', ['witmicko/lll']);

      expect(result.success).toBe(true);

      // Parse the JSON output
      const languages = JSON.parse(result.stdout);
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);

      // Should contain some expected languages based on the repo
      expect(languages).toEqual(expect.arrayContaining(['go', 'java', 'typescript', 'javascript']));
    }, 10000); // Longer timeout for API call

    test('should handle invalid repository gracefully', async () => {
      const result = await runScript('src/detect-languages.js', ['nonexistent/repo-that-does-not-exist']);

      expect(result.success).toBe(true); // Should not crash

      // Should fallback to default
      const languages = JSON.parse(result.stdout);
      expect(languages).toEqual(['javascript']);
    }, 10000);

    test('should require repository argument', async () => {
      const result = await runScript('src/detect-languages.js', []);

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Usage: node detect-languages.js <owner/repo>');
    });

    test('should work without token (public repos)', async () => {
      const result = await runScript('src/detect-languages.js', ['microsoft/vscode']);

      expect(result.success).toBe(true);
      const languages = JSON.parse(result.stdout);
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('create-matrix.js', () => {
    test('should create matrix with detected languages only', async () => {
      const detectedLanguages = '["javascript", "python", "java"]';
      const result = await runScript('src/create-matrix.js', [detectedLanguages]);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix).toHaveProperty('include');
      expect(matrix.include).toHaveLength(3);

      // Check expected matrix entries
      expect(matrix.include).toEqual(expect.arrayContaining([
        { language: 'javascript-typescript', scanner: 'codeql' },
        { language: 'python', scanner: 'codeql' },
        { language: 'java-kotlin', scanner: 'codeql', build_mode: 'manual' }
      ]));
    });

    test('should merge custom config with detected languages', async () => {
      const detectedLanguages = '["javascript", "java"]';
      const customConfig = '[{"language":"java-kotlin","build_mode":"manual","build_command":"./gradlew build","environment":"jdk-21"}]';

      const result = await runScript('src/create-matrix.js', [detectedLanguages, customConfig]);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix.include).toHaveLength(2);

      // Should use custom config for java
      const javaEntry = matrix.include.find(entry => entry.language === 'java-kotlin');
      expect(javaEntry).toEqual({
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        environment: 'jdk-21'
      });

      // Should use default config for javascript
      const jsEntry = matrix.include.find(entry => entry.language === 'javascript-typescript');
      expect(jsEntry).toEqual({
        language: 'javascript-typescript',
        scanner: 'codeql'
      });
    });

    test('should handle empty languages array', async () => {
      const result = await runScript('src/create-matrix.js', ['[]']);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix).toEqual({ include: [] });
    });

    test('should require languages argument', async () => {
      const result = await runScript('src/create-matrix.js', []);

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Usage: node create-matrix.js');
    });

    test('should handle invalid JSON gracefully', async () => {
      const result = await runScript('src/create-matrix.js', ['invalid-json']);

      expect(result.success).toBe(false);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Error parsing JSON input');
    });

    test('should work with only detected languages (no custom config)', async () => {
      const detectedLanguages = '["go", "python"]';
      const result = await runScript('src/create-matrix.js', [detectedLanguages]);

      expect(result.success).toBe(true);

      const matrix = JSON.parse(result.stdout);
      expect(matrix.include).toEqual([
        { language: 'go', scanner: 'codeql' },
        { language: 'python', scanner: 'codeql' }
      ]);
    });
  });

  describe('End-to-End Integration', () => {
    test('should work together: detect languages then create matrix', async () => {
      // First detect languages
      const detectResult = await runScript('src/detect-languages.js', ['microsoft/TypeScript']);
      expect(detectResult.success).toBe(true);

      const detectedLanguages = detectResult.stdout;
      expect(detectedLanguages).toContain('typescript');

      // Then create matrix with detected languages
      const matrixResult = await runScript('src/create-matrix.js', [detectedLanguages]);
      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);
      expect(matrix.include.length).toBeGreaterThan(0);

      // Should contain typescript scanning config
      const hasTypeScript = matrix.include.some(entry =>
        entry.language === 'javascript-typescript'
      );
      expect(hasTypeScript).toBe(true);
    }, 15000);

    test('should handle workflow with custom language config', async () => {
      // Detect languages for a Java repo
      const detectResult = await runScript('src/detect-languages.js', ['spring-projects/spring-boot']);
      expect(detectResult.success).toBe(true);

      const detectedLanguages = detectResult.stdout;

      // Create matrix with custom Java config
      const customConfig = '[{"language":"java-kotlin","build_mode":"manual","build_command":"./mvnw compile","environment":"jdk-17"}]';
      const matrixResult = await runScript('src/create-matrix.js', [detectedLanguages, customConfig]);

      expect(matrixResult.success).toBe(true);

      const matrix = JSON.parse(matrixResult.stdout);

      // Should use custom config for Java
      const javaEntry = matrix.include.find(entry => entry.language === 'java-kotlin');
      expect(javaEntry).toEqual({
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './mvnw compile',
        environment: 'jdk-17'
      });
    }, 15000);
  });
});