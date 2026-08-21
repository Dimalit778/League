import {
  dateFormat,
  dayNameFormatLong,
  dayNameFormatShort,
  formatDateRange,
  formatMatchdayDate,
  formatNameCapitalize,
} from '../formats';

describe('formatNameCapitalize', () => {
  it('capitalizes each word', () => {
    expect(formatNameCapitalize('john doe')).toBe('John Doe');
  });

  it('handles single word', () => {
    expect(formatNameCapitalize('john')).toBe('John');
  });

  it('handles already capitalized', () => {
    expect(formatNameCapitalize('JOHN DOE')).toBe('John Doe');
  });

  it('handles mixed case', () => {
    expect(formatNameCapitalize('jOHN dOE')).toBe('John Doe');
  });

  it('returns empty string for null', () => {
    expect(formatNameCapitalize(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatNameCapitalize(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatNameCapitalize('')).toBe('');
  });
});

describe('dateFormat', () => {
  it('formats a date string to day/month', () => {
    const result = dateFormat('2024-03-15T12:00:00Z');
    expect(result).toMatch(/\d{1,2}\/\d{1,2}/);
  });
});

describe('dayNameFormatLong', () => {
  it('returns a long day name', () => {
    // 2024-03-15 is a Friday
    const result = dayNameFormatLong('2024-03-15T12:00:00Z');
    expect(result).toBe('Friday');
  });
});

describe('dayNameFormatShort', () => {
  it('returns a short day name', () => {
    const result = dayNameFormatShort('2024-03-15T12:00:00Z');
    expect(result).toBe('Fri');
  });
});

describe('formatDateRange', () => {
  it('formats same month range', () => {
    const result = formatDateRange('2024-03-01', '2024-03-15');
    expect(result).toMatch(/Mar 1 - 15/);
  });

  it('formats cross-month range', () => {
    const result = formatDateRange('2024-03-25', '2024-04-05');
    expect(result).toMatch(/Mar 25 - Apr 5/);
  });
});

describe('formatMatchdayDate', () => {
  it('formats a matchday date with an English day abbreviation', () => {
    expect(formatMatchdayDate('2024-03-15T12:00:00Z', 'en-GB')).toBe('Fri, 15/3');
  });

  it('formats the abbreviated day name in Hebrew', () => {
    const result = formatMatchdayDate('2024-03-15T12:00:00Z', 'he-IL');

    expect(result).toMatch(/[\u0590-\u05FF]/);
    expect(result).toContain('15/3');
  });
});
