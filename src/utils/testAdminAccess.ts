/**
 * Admin Access Test Utility
 *
 * Use this to verify that admin RLS policies are working correctly.
 * Run this in your admin dashboard or any admin-only component.
 *
 * Usage:
 * ```typescript
 * import { testAdminAccess } from '@/utils/testAdminAccess';
 *
 * // In your component or useEffect
 * testAdminAccess().then(results => {
 *   console.log('Admin test results:', results);
 * });
 * ```
 */

import { supabase } from '@/lib/supabase';

export interface AdminTestResults {
  success: boolean;
  timestamp: string;
  currentUser: {
    id: string | undefined;
    email: string | undefined;
    role: string | undefined;
  };
  tests: {
    name: string;
    status: 'pass' | 'fail' | 'error';
    message: string;
    data?: any;
    error?: any;
  }[];
}

export async function testAdminAccess(): Promise<AdminTestResults> {
  const results: AdminTestResults = {
    success: false,
    timestamp: new Date().toISOString(),
    currentUser: {
      id: undefined,
      email: undefined,
      role: undefined,
    },
    tests: [],
  };

  try {
    // Test 1: Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      results.tests.push({
        name: 'Session Check',
        status: 'fail',
        message: 'No active session found',
        error: sessionError,
      });
      return results;
    }

    results.currentUser.id = session.user.id;
    results.currentUser.email = session.user.email;

    results.tests.push({
      name: 'Session Check',
      status: 'pass',
      message: 'Active session found',
      data: {
        userId: session.user.id,
        email: session.user.email,
      },
    });

    // Test 2: Get user profile with role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      results.tests.push({
        name: 'User Profile Check',
        status: 'error',
        message: 'Failed to fetch user profile',
        error: userError,
      });
    } else {
      results.currentUser.role = userData?.role;
      results.tests.push({
        name: 'User Profile Check',
        status: 'pass',
        message: `User role: ${userData?.role || 'Not set'}`,
        data: userData,
      });
    }

    // Test 3: Check if user is admin
    const isAdmin = userData?.role === 'ADMIN';

    if (!isAdmin) {
      results.tests.push({
        name: 'Admin Role Check',
        status: 'fail',
        message: 'User does not have ADMIN role',
      });
      return results;
    }

    results.tests.push({
      name: 'Admin Role Check',
      status: 'pass',
      message: 'User has ADMIN role',
    });

    // Test 4: Test read access to users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(10);

    if (usersError) {
      results.tests.push({
        name: 'Users Table Read Access',
        status: 'error',
        message: 'Failed to read users table',
        error: usersError,
      });
    } else {
      results.tests.push({
        name: 'Users Table Read Access',
        status: 'pass',
        message: `Successfully read ${usersData?.length || 0} users`,
        data: { count: usersData?.length },
      });
    }

    // Test 5: Test read access to leagues table
    const { data: leaguesData, error: leaguesError } = await supabase
      .from('leagues')
      .select('id, name, owner_id')
      .limit(10);

    if (leaguesError) {
      results.tests.push({
        name: 'Leagues Table Read Access',
        status: 'error',
        message: 'Failed to read leagues table',
        error: leaguesError,
      });
    } else {
      results.tests.push({
        name: 'Leagues Table Read Access',
        status: 'pass',
        message: `Successfully read ${leaguesData?.length || 0} leagues`,
        data: { count: leaguesData?.length },
      });
    }

    // Test 6: Test read access to league_members table
    const { data: membersData, error: membersError } = await supabase
      .from('league_members')
      .select('id, user_id, league_id, nickname')
      .limit(10);

    if (membersError) {
      results.tests.push({
        name: 'League Members Table Read Access',
        status: 'error',
        message: 'Failed to read league_members table',
        error: membersError,
      });
    } else {
      results.tests.push({
        name: 'League Members Table Read Access',
        status: 'pass',
        message: `Successfully read ${membersData?.length || 0} members`,
        data: { count: membersData?.length },
      });
    }

    // Test 7: Test read access to predictions table
    const { data: predictionsData, error: predictionsError } = await supabase
      .from('predictions')
      .select('id, user_id, league_id, match_id')
      .limit(10);

    if (predictionsError) {
      results.tests.push({
        name: 'Predictions Table Read Access',
        status: 'error',
        message: 'Failed to read predictions table',
        error: predictionsError,
      });
    } else {
      results.tests.push({
        name: 'Predictions Table Read Access',
        status: 'pass',
        message: `Successfully read ${predictionsData?.length || 0} predictions`,
        data: { count: predictionsData?.length },
      });
    }

    // Test 8: Test read access to competitions table
    const { data: competitionsData, error: competitionsError } = await supabase
      .from('competitions')
      .select('id, name, area')
      .limit(10);

    if (competitionsError) {
      results.tests.push({
        name: 'Competitions Table Read Access',
        status: 'error',
        message: 'Failed to read competitions table',
        error: competitionsError,
      });
    } else {
      results.tests.push({
        name: 'Competitions Table Read Access',
        status: 'pass',
        message: `Successfully read ${competitionsData?.length || 0} competitions`,
        data: { count: competitionsData?.length },
      });
    }

    // Test 9: Test read access to subscriptions table
    const { data: subscriptionsData, error: subscriptionsError } =
      await supabase
        .from('subscription')
        .select('id, user_id, subscription_type')
        .limit(10);

    if (subscriptionsError) {
      results.tests.push({
        name: 'Subscriptions Table Read Access',
        status: 'error',
        message: 'Failed to read subscription table',
        error: subscriptionsError,
      });
    } else {
      results.tests.push({
        name: 'Subscriptions Table Read Access',
        status: 'pass',
        message: `Successfully read ${subscriptionsData?.length || 0} subscriptions`,
        data: { count: subscriptionsData?.length },
      });
    }

    // Check overall success
    const allPassed = results.tests.every(
      (test) => test.status === 'pass' || test.status === 'error'
    );
    const hasErrors = results.tests.some((test) => test.status === 'error');

    results.success = allPassed && !hasErrors;

    return results;
  } catch (error) {
    results.tests.push({
      name: 'Unexpected Error',
      status: 'error',
      message: 'An unexpected error occurred during testing',
      error,
    });

    return results;
  }
}

/**
 * Format test results as a human-readable string
 */
export function formatTestResults(results: AdminTestResults): string {
  let output = '=== ADMIN ACCESS TEST RESULTS ===\n\n';
  output += `Timestamp: ${results.timestamp}\n`;
  output += `Overall Status: ${results.success ? '✅ PASS' : '❌ FAIL'}\n\n`;

  output += `Current User:\n`;
  output += `  ID: ${results.currentUser.id || 'Unknown'}\n`;
  output += `  Email: ${results.currentUser.email || 'Unknown'}\n`;
  output += `  Role: ${results.currentUser.role || 'Unknown'}\n\n`;

  output += `Test Results:\n`;
  results.tests.forEach((test, index) => {
    const icon =
      test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
    output += `  ${index + 1}. ${icon} ${test.name}\n`;
    output += `     ${test.message}\n`;
    if (test.error) {
      output += `     Error: ${JSON.stringify(test.error, null, 2)}\n`;
    }
  });

  output += '\n=== END OF RESULTS ===\n';

  return output;
}

/**
 * Quick admin check - returns true if user is admin and can access data
 */
export async function quickAdminCheck(): Promise<boolean> {
  const results = await testAdminAccess();
  return results.success;
}
