import { spacing } from '../responsive';

describe('spacing', () => {
  it('has xs spacing', () => {
    expect(spacing.xs).toBe('2');
  });

  it('has sm spacing', () => {
    expect(spacing.sm).toBe('4');
  });

  it('has md spacing', () => {
    expect(spacing.md).toBe('6');
  });

  it('has lg spacing', () => {
    expect(spacing.lg).toBe('8');
  });

  it('has xl spacing', () => {
    expect(spacing.xl).toBe('12');
  });

  it('has all required spacing keys', () => {
    expect(Object.keys(spacing)).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });
});
