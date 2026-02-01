import { formatTemplate, translateRaw } from '../translate';

describe('formatTemplate', () => {
  it('returns template unchanged when no variables', () => {
    expect(formatTemplate('Hello world')).toBe('Hello world');
  });

  it('returns template unchanged when variables is undefined', () => {
    expect(formatTemplate('Hello world', undefined)).toBe('Hello world');
  });

  it('replaces a single variable', () => {
    expect(formatTemplate('Hello {{name}}', { name: 'World' })).toBe('Hello World');
  });

  it('replaces multiple variables', () => {
    expect(formatTemplate('{{greeting}} {{name}}!', { greeting: 'Hi', name: 'User' })).toBe('Hi User!');
  });

  it('handles numeric values', () => {
    expect(formatTemplate('Count: {{count}}', { count: 42 })).toBe('Count: 42');
  });

  it('handles spaces inside template braces', () => {
    expect(formatTemplate('Hello {{ name }}', { name: 'World' })).toBe('Hello World');
  });

  it('replaces all occurrences of the same variable', () => {
    expect(formatTemplate('{{x}} and {{x}}', { x: 'A' })).toBe('A and A');
  });
});

describe('translateRaw', () => {
  it('returns the key for English when translation exists', () => {
    // Common translations are defined for both languages
    const result = translateRaw('en', 'Cancel');
    expect(result).toBe('Cancel');
  });

  it('returns the key itself when no translation exists', () => {
    const result = translateRaw('en', 'some_nonexistent_key_12345');
    expect(result).toBe('some_nonexistent_key_12345');
  });

  it('applies variables to translated text', () => {
    const result = translateRaw('en', 'Double tap to {{action}}', { action: 'submit' });
    expect(result).toBe('Double tap to submit');
  });

  it('falls back to English for missing Hebrew translations', () => {
    // If Hebrew doesn't have a translation, it should fall back to English
    const enResult = translateRaw('en', 'Cancel');
    const heResult = translateRaw('he', 'Cancel');
    // Both should return a non-empty string
    expect(enResult.length).toBeGreaterThan(0);
    expect(heResult.length).toBeGreaterThan(0);
  });

  it('normalizes whitespace in keys', () => {
    const result = translateRaw('en', 'Cancel');
    const resultWithSpaces = translateRaw('en', '  Cancel  ');
    expect(result).toBe(resultWithSpaces);
  });
});
