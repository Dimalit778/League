import { adminUserDisplayName, filterAdminUsers } from '../adminUi';

const user = (id: string, full_name: string | null, email: string | null) => ({ id, full_name, email });

describe('adminUserDisplayName', () => {
  it('prefers the full name', () => {
    expect(adminUserDisplayName(user('1', 'Dana Levi', 'dana@x.com'), 'Unnamed')).toBe('Dana Levi');
  });

  it('falls back to email, then to the fallback label', () => {
    expect(adminUserDisplayName(user('1', null, 'dana@x.com'), 'Unnamed')).toBe('dana@x.com');
    expect(adminUserDisplayName(user('1', '', ''), 'Unnamed')).toBe('Unnamed');
  });
});

describe('filterAdminUsers', () => {
  const users = [
    user('aaa-111', 'Dana Levi', 'dana@x.com'),
    user('bbb-222', 'Yossi Cohen', 'yossi@y.com'),
  ];

  it('returns everyone for a blank query', () => {
    expect(filterAdminUsers(users, '  ')).toHaveLength(2);
  });

  it('matches on name, email, and id (case-insensitive)', () => {
    expect(filterAdminUsers(users, 'dana')).toEqual([users[0]]);
    expect(filterAdminUsers(users, 'YOSSI@Y')).toEqual([users[1]]);
    expect(filterAdminUsers(users, 'bbb-222')).toEqual([users[1]]);
  });
});
