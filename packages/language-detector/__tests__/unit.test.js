import { detectLanguages, createMatrix } from '../src/language-detector.js';

describe('detectLanguages', () => {
  test('detects multiple languages correctly', () => {
    const githubLanguages = {
      'JavaScript': 50000,
      'TypeScript': 30000,
      'Python': 20000,
      'Go': 15000,
      'Java': 10000
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['javascript', 'typescript', 'python', 'go', 'java']);
  });

  test('maps Kotlin to java', () => {
    const githubLanguages = {
      'Kotlin': 10000,
      'Java': 5000
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['java']);
  });

  test('maps C/C++ to cpp', () => {
    const githubLanguages = {
      'C++': 20000,
      'C': 10000
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['cpp']);
  });

  test('ignores unsupported languages', () => {
    const githubLanguages = {
      'JavaScript': 10000,
      'HTML': 5000,
      'CSS': 3000,
      'Makefile': 1000
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['javascript']);
  });

  test('defaults to javascript when no supported languages found', () => {
    const githubLanguages = {
      'HTML': 5000,
      'CSS': 3000
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['javascript']);
  });

  test('defaults to javascript when input is invalid', () => {
    expect(detectLanguages(null)).toEqual(['javascript']);
    expect(detectLanguages(undefined)).toEqual(['javascript']);
    expect(detectLanguages({})).toEqual(['javascript']);
    expect(detectLanguages('invalid')).toEqual(['javascript']);
  });

  test('removes duplicates', () => {
    const githubLanguages = {
      'Java': 10000,
      'Kotlin': 5000  // Both map to 'java'
    };

    const result = detectLanguages(githubLanguages);

    expect(result).toEqual(['java']);
  });
});

describe('createMatrix', () => {
  test('creates matrix with default configs', () => {
    const detectedLanguages = ['javascript', 'python', 'java'];
    const result = createMatrix(detectedLanguages);

    expect(result).toEqual({
      include: [
        { language: 'javascript-typescript' },
        { language: 'python' },
        { language: 'java-kotlin', build_mode: 'manual', build_command: './mvnw compile' }
      ]
    });
  });

  test('merges custom config with detected languages', () => {
    const detectedLanguages = ['javascript', 'java'];
    const customConfig = [
      {
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        version: '21'
      }
    ];

    const result = createMatrix(detectedLanguages, customConfig);

    expect(result).toEqual({
      include: [
        { language: 'javascript-typescript' },
        {
          language: 'java-kotlin',
          build_mode: 'manual',
          build_command: './gradlew build',
          version: '21'
        }
      ]
    });
  });

  test('handles custom config for detected language name', () => {
    const detectedLanguages = ['java'];
    const customConfig = [
      {
        language: 'java',  // Using detected language name instead of scanner language
        build_mode: 'manual',
        build_command: './gradlew build'
      }
    ];

    const result = createMatrix(detectedLanguages, customConfig);

    expect(result).toEqual({
      include: [
        {
          language: 'java',
          build_mode: 'manual',
          build_command: './gradlew build'
        }
      ]
    });
  });

  test('handles custom version only (no distribution)', () => {
    const detectedLanguages = ['java'];
    const customConfig = [
      {
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        version: '21'
      }
    ];

    const result = createMatrix(detectedLanguages, customConfig);

    expect(result).toEqual({
      include: [
        {
          language: 'java-kotlin',
          build_mode: 'manual',
          build_command: './gradlew build',
          version: '21'
        }
      ]
    });
  });

  test('handles custom version and distribution config', () => {
    const detectedLanguages = ['java'];
    const customConfig = [
      {
        language: 'java-kotlin',
        build_mode: 'manual',
        build_command: './gradlew build',
        version: '17',
        distribution: 'zulu'
      }
    ];

    const result = createMatrix(detectedLanguages, customConfig);

    expect(result).toEqual({
      include: [
        {
          language: 'java-kotlin',
          build_mode: 'manual',
          build_command: './gradlew build',
          version: '17',
          distribution: 'zulu'
        }
      ]
    });
  });

  test('ignores custom config for undetected languages', () => {
    const detectedLanguages = ['javascript'];
    const customConfig = [
      { language: 'python', build_mode: 'manual' }, // Python not detected
      { language: 'javascript-typescript', build_mode: 'none' }
    ];

    const result = createMatrix(detectedLanguages, customConfig);

    expect(result).toEqual({
      include: [
        { language: 'javascript-typescript', build_mode: 'none' }
      ]
    });
  });

  test('handles empty inputs', () => {
    expect(createMatrix([])).toEqual({ include: [] });
    expect(createMatrix(['javascript'], [])).toEqual({
      include: [{ language: 'javascript-typescript' }]
    });
  });

  test('handles typescript and javascript both detected', () => {
    const detectedLanguages = ['javascript', 'typescript'];
    const result = createMatrix(detectedLanguages);

    // Should only have one entry since both map to javascript-typescript and duplicates are removed
    expect(result).toEqual({
      include: [
        { language: 'javascript-typescript' }
      ]
    });
  });

  test('handles unsupported detected language gracefully', () => {
    const detectedLanguages = ['javascript', 'unsupported-lang'];
    const result = createMatrix(detectedLanguages);

    expect(result).toEqual({
      include: [
        { language: 'javascript-typescript' }
      ]
    });
  });
});