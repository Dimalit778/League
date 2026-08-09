// cspell:disable
import { SupportedLanguage } from '@/store/LanguageStore';

export type TranslationDictionary = Record<string, string>;

// Helper function to flatten nested translation objects (merges without prefixes for backward compatibility)
function flattenTranslations(obj: Record<string, any>): TranslationDictionary {
  const result: TranslationDictionary = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value));
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Organized translations by screen/feature
const translationsByFeature: Record<SupportedLanguage, Record<string, any>> = {
  en: {
    // Common - shared across all screens
    common: {
      Cancel: 'Cancel',
      Continue: 'Continue',
      Delete: 'Delete',
      Error: 'Error',
      OK: 'OK',
      Save: 'Save',
      'Enter prediction': 'Enter prediction',
      Success: 'Success',
      Update: 'Update',
      Remove: 'Remove',
      Name: 'Name',
      Email: 'Email',
      'Email address': 'Email address', 
      Password: 'Password',
      Country: 'Country',
      Status: 'Status',
      Type: 'Type',
      Preview: 'Preview',
      Primary: 'Primary',
      Unknown: 'Unknown',
      'Not assigned': 'Not assigned',
      'Copied!': 'Copied!',
      'Deleted Player': 'Deleted Player',
      'Member Details': 'Member Details',
      '{{name}} profile picture': '{{name}} profile picture',
      'User profile picture': 'User profile picture',
      '{{name}} profile placeholder, {{initial}}': '{{name}} profile placeholder, {{initial}}',
      'User profile placeholder, {{initial}}': 'User profile placeholder, {{initial}}',
      
      'An unexpected error occurred': 'An unexpected error occurred',
      'An unexpected error occurred. Please try again.': 'An unexpected error occurred. Please try again.',
      Loading: 'Loading',
      'Button disabled': 'Button disabled',
      'Double tap to {{action}}': 'Double tap to {{action}}',
      '{{name}} input field': '{{name}} input field',
      'Enter {{placeholder}}': 'Enter {{placeholder}}',
      'Toggle password visibility': 'Toggle password visibility',
      Validation: 'Validation',
      'from this league': 'from this league',
      Leave: 'Leave',
      'Privacy Policy': 'Privacy Policy',
      'Terms of Service': 'Terms of Service',
      'By creating an account, you agree to:': 'By creating an account, you agree to:',
      
    },

    // Auth screens
    auth: {
      'Delete Account': 'Delete Account',
      
      'Delete account confirmation message':
        'Are you sure? Your account, profile and personal data will be deleted. Past predictions and scores will remain under “Deleted Player” so league history stays accurate. This cannot be undone. Deleting your account does not cancel your App Store subscription — cancel it in Apple ID → Subscriptions.',
      'Delete personal data while keeping anonymized league history.':
        'Delete personal data while keeping anonymized league history.',
      'Check your subscription first': 'Check your subscription first',
      'Deleting your Champo account does not cancel an active App Store subscription.':
        'Deleting your Champo account does not cancel an active App Store subscription.',
      'Continue deletion': 'Continue deletion',
      'Sign In': 'Sign In',
      'Sign Up': 'Sign Up',
      'Sign Out': 'Sign Out',
      
      Logout: 'Logout',
      'Sign in to your account': 'Sign in to your account',
      'Sign up to get started': 'Sign up to get started',
      
      
      
      'Welcome Back': 'Welcome Back',
      
      'Welcome to League': 'Welcome to League',
      
      'Get Started': 'Get Started',
      'Every match is a challenge': 'Every match is a challenge',
      'Predict scores, compete with friends, and climb the table.':
        'Predict scores, compete with friends, and climb the table.',
      'My prediction': 'My prediction',
      'Predicted score': 'Predicted score',
      'Already have an account?': 'Already have an account?',
      'Create your Champo account': 'Create your Champo account',
      Back: 'Back',
      'Join the challenge': 'Join the challenge',
      'Sign in to continue your predictions': 'Sign in to continue your predictions',
      'Create one account and keep all your predictions in one place.':
        'Create one account and keep all your predictions in one place.',
      'Predict. Compete. Climb.': 'Predict. Compete. Climb.',
      "Don't have an account?": "Don't have an account?",
      'Password strength': 'Password strength',
      'Strong password': 'Strong password',
      'At least 8 characters with a letter and a number':
        'At least 8 characters with a letter and a number',
      'Reset Password': 'Reset Password',
      
      
      
      'Enter your email': 'Enter your email',
      
      
      'Send Reset Link': 'Send Reset Link',
      
      
      
      
      'We sent a 6-digit code to': 'We sent a 6-digit code to',
      'Apple and Google sign-in do not require email verification.':
        'Apple and Google sign-in do not require email verification.',
      'Prefer not to wait?': 'Prefer not to wait?',
      'Sign in with Apple or Google': 'Sign in with Apple or Google',
      'Email is required': 'Email is required',
      'Invalid email': 'Invalid email',
      'Password is required': 'Password is required',
    
      'New Password': 'New Password',
      
  
      'Failed to sign out': 'Failed to sign out',
      'Failed to update password': 'Failed to update password',
      
      'Sign in with Apple': 'Sign in with Apple',
      // form errors
      'Please enter a valid email address': 'Please enter a valid email address',
      'Minimum 8 characters': 'Minimum 8 characters',
      'Password must contain at least one letter and one number': 'Password must contain at least one letter and one number',
      'Full name is required': 'Full name is required',
      'Full name must be at least 3 characters': 'Full name must be at least 3 characters',
    },

    // Leagues screens
    leagues: {
      League: 'League',
      Leagues: 'Leagues',
      'Create or join a league to get started.': 'Create or join a league to get started.',
      'Full ranking': 'Full ranking',
      Round: 'Round',
      'All season': 'All season',
      Friends: 'Friends',
      World: 'World',
      'Requires PRO': 'Requires PRO',
      You: 'You',
      'More friends, more competition': 'More friends, more competition',
      'Invite friends to your league and make every match more exciting.':
        'Invite friends to your league and make every match more exciting.',
      '{{count}} leagues': '{{count}} leagues',
      'Enter league': 'Enter league',
      'Requires Pro': 'Requires Pro',
      'Want to open more leagues?': 'Want to open more leagues?',
      'Upgrade to Pro and open up to {{count}} leagues': 'Upgrade to Pro and open up to {{count}} leagues',
      'Create League': 'Create League',

      'Manage League': 'Manage League',
      'Invite friends': 'Invite friends',
      'Invite code': 'Invite code',
      'Danger zone': 'Danger zone',
      'Deleting a league cannot be undone.': 'Deleting a league cannot be undone.',
      'You will lose access to this league.': 'You will lose access to this league.',
      'Save changes': 'Save changes',
      "That's the whole leaderboard for now": "That's the whole leaderboard for now",
      'Invite more friends and make the league more competitive.':
        'Invite more friends and make the league more competitive.',
      
      'Leave league': 'Leave league',
      'Failed to share invite code': 'Failed to share invite code',
      'Join League': 'Join League',
      
      'Save active leagues': 'Save active leagues',
      'Activate league': 'Activate league',
      'Activate leagues': 'Activate leagues',
      'Select league to activate': 'Select league to activate',
      
      '{{count}} inactive leagues kept in your account': '{{count}} inactive leagues kept in your account',

      'League Name': 'League Name',
      'League name': 'League name',
      'League details': 'League details',
      'League Details': 'League Details',
      'Select Competition': 'Select Competition',
      'Enter league name': 'Enter league name',
      
      'League name is required': 'League name is required',
      
      'League name must be between 2 and 20 characters.': 'League name must be between 2 and 20 characters.',
      'League name must be at most 20 characters long': 'League name must be at most 20 characters long',
      
      
      
      'League not found': 'League not found',
      
      
      'Unable to load leagues. Pull to refresh to try again.': 'Unable to load leagues. Pull to refresh to try again.',
      'Failed to create league': 'Failed to create league',
      'Subscription not confirmed': 'Subscription not confirmed',
      'We could not confirm your PRO subscription. Please try again in a moment.':
        'We could not confirm your PRO subscription. Please try again in a moment.',
      'Failed to join league': 'Failed to join league',
      
      
      'Start League': 'Start League',
      
      'How to Join a League': 'How to Join a League',
      'Get the 7-digit invite code from the league owner.': 'Get the 7-digit invite code from the league owner.',
      'Enter the code above to find the league.': 'Enter the code above to find the league.',
      'Choose your nickname for the league.': 'Choose your nickname for the league.',
      'Tap "Join League" to become a member.': 'Tap "Join League" to become a member.',
      
      
      
      
      'Enter 7-digit invite code': 'Enter 7-digit invite code',
      'Invite Code': 'Invite Code',
      'Join Code': 'Join Code',
      'Invite code is required': 'Invite code is required',
      
      'Searching for league...': 'Searching for league...',
      'Join code copied to clipboard.': 'Join code copied to clipboard.',
      'Share Join Code': 'Share Join Code',
      'League Join Code': 'League Join Code',
      'Tap to copy code': 'Tap to copy code',
      'Enter your nickname': 'Enter your nickname',
      
      'Your Nickname': 'Your Nickname',
      'Nickname is required': 'Nickname is required',
      'Nickname must be at least 2 characters long': 'Nickname must be at least 2 characters long',
      'Nickname must be at most 20 characters long': 'Nickname must be at most 20 characters long',
      'Nickname must be at most 20 characters': 'Nickname must be at most 20 characters',
      
      Members: 'Members',
      'League table': 'League table',
      Gameweek: 'Gameweek',
      'Your rank': 'Your rank',
      
      User: 'User',
      'Correct Scores': 'Correct Scores',
      Movement: 'Movement',
      'Max Members': 'Max Members',
      
      
      '6 Members': '6 Members',
      
      
      
      
      
      
      
      'League Members': 'League Members',
      'League Owner': 'League Owner',
      
      
      'Remove Member': 'Remove Member',
      'Unable to load league members. Pull to refresh to try again.':
        'Unable to load league members. Pull to refresh to try again.',
      Owner: 'Owner',
      'Unknown owner': 'Unknown owner',
      'Unknown member': 'Unknown member',
      'Unknown League': 'Unknown League',
      Joined: 'Joined',
      
      Created: 'Created',
      'Created at': 'Created at',
      'Leave League': 'Leave League',
      'Are you sure you want to leave this league?': 'Are you sure you want to leave this league?',
      'Delete League': 'Delete League',
      'Are you sure you want to delete this league?':
        'This will permanently delete the league, all members, and all predictions. Are you sure?',
      
      'You have reached the max number of leagues': 'You have reached the max number of leagues',
      
      
    },

    // Matches and Predictions
    matches: {
      Matches: 'Matches',
      Prediction: 'Prediction',

      'Predicted Score': 'Predicted Score',
      'Prediction Results': 'Prediction Results',
      'No prediction': 'No prediction',
      
      'Unable to load predictions. Pull to refresh to try again.':
      'Unable to load predictions. Pull to refresh to try again.',
      pts: 'pts',
      Points: 'Points',
      'Total Points': 'Total Points',
      
      
      Accuracy: 'Accuracy',
      
      
      'Premium stats only': 'Premium stats only',
      'Upgrade to Pro to unlock match statistics': 'Upgrade to Pro to unlock match statistics',
      Submitted: 'Submitted',
      'Fixture ID': 'Fixture ID',
      
      
      'AI match analysis': 'AI match analysis',
      'Unlock the full AI analysis with Pro': 'Unlock the full AI analysis with Pro',
      'AI Prediction': 'AI Prediction',
      'AI Analysis': 'AI Analysis',
      'Get the full breakdown behind every prediction.':
        'Get the full breakdown behind every prediction.',
      
    },

    // Profile and Settings
    profile: {
      Profile: 'Profile',
      Me: 'Me',
      Settings: 'Settings',
      
      
      
      
      
      
      
      'Full Name': 'Full Name',
      
      
      
      
      
      
      
      
      
      
      
      Theme: 'Theme',
      Language: 'Language',
      
      'Switch to {{language}}': 'Switch to {{language}}',
      
      English: 'English',
      Hebrew: 'Hebrew',
      
      'Help & Support': 'Help & Support',
      Help: 'Help',
      'Contact Us': 'Contact Us',
      Info: 'Info',
      
      'Choose Image': 'Choose Image',
      
      
      
      
      
      
      
      'Failed to pick image': 'Failed to pick image',
      'Failed to upload image': 'Failed to upload image',
      
      'Leave League': 'Leave League',
      'Are you sure you want to leave this league?': 'Are you sure you want to leave this league?',
      'Delete League': 'Delete League',
      'Are you sure you want to delete this league?':
        'This will permanently delete the league, all members, and all predictions. Are you sure?',
   
    },

    // Help & Support
    help: {
      'Welcome to League Champion': 'Welcome to League Champion',
      'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!':
        'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!',
      'Getting Started': 'Getting Started',
      'How do I create an account?': 'How do I create an account?',
      'You can sign up using your email address or sign in with Google. After creating your account, verify your email address to get started.':
        'You can sign up using your email address or sign in with Google. After creating your account, verify your email address to get started.',
      'How do I join a league?': 'How do I join a league?',
      'Navigate to the "My Leagues" tab and tap the "+" button. You can either create a new league or join an existing one using a league code.':
        'Navigate to the "My Leagues" tab and tap the "+" button. You can either create a new league or join an existing one using a league code.',
      'What is a league?': 'What is a league?',
      'A league is a group where you compete with other users by making predictions on football matches. Each league tracks points and rankings.':
        'A league is a group where you compete with other users by making predictions on football matches. Each league tracks points and rankings.',
      'Making Predictions': 'Making Predictions',
      'How do I make a prediction?': 'How do I make a prediction?',
      'Go to the "Matches" tab, select a match, and enter your predicted score for both teams. You can update your prediction until the match starts.':
        'Go to the "Matches" tab, select a match, and enter your predicted score for both teams. You can update your prediction until the match starts.',
      'When can I make predictions?': 'When can I make predictions?',
      'You can make or update predictions anytime before a match kicks off. Once the match starts, predictions are locked and cannot be changed.':
        'You can make or update predictions anytime before a match kicks off. Once the match starts, predictions are locked and cannot be changed.',
      'How are points calculated?': 'How are points calculated?',
      'Points are awarded based on the accuracy of your prediction. Exact score predictions earn the most points, followed by correct result (win/draw), and correct goal difference.':
        'Points are awarded based on the accuracy of your prediction. Exact score predictions earn the most points, followed by correct result (win/draw), and correct goal difference.',
      'Leagues & Rankings': 'Leagues & Rankings',
      'How do I create my own league?': 'How do I create my own league?',
      'Tap the "+" button in "My Leagues", select "Create League", choose a competition, and invite friends using the league code.':
        'Tap the "+" button in "My Leagues", select "Create League", choose a competition, and invite friends using the league code.',
      'How do I view the leaderboard?': 'How do I view the leaderboard?',
      'Open any league from "My Leagues" to see the current rankings. Points are updated automatically after matches finish.':
        'Open any league from "My Leagues" to see the current rankings. Points are updated automatically after matches finish.',
      'Can I leave a league?': 'Can I leave a league?',
      'Yes, you can leave a league at any time from the league details screen. Note that your predictions and points will remain in the league history.':
        'Yes, you can leave a league at any time from the Profile tab. Note that your predictions and points will remain in the league history.',
      'Matches & Fixtures': 'Matches & Fixtures',
      'How do I view upcoming matches?': 'How do I view upcoming matches?',
      'Go to the "Matches" tab to see all upcoming fixtures for your leagues. You can filter by round or competition.':
        'Go to the "Matches" tab to see all upcoming fixtures for your leagues. You can filter by round or competition.',
      'What match information is available?': 'What match information is available?',
      'For each match, you can see team lineups, live scores, match events (goals, cards, substitutions), and detailed statistics.':
        'For each match, you can see team lineups, live scores, match events (goals, cards, substitutions), and detailed statistics.',
      'How often are match results updated?': 'How often are match results updated?',
      'Match results and scores are updated in real-time during live matches and automatically finalized when matches end.':
        'Match results and scores are updated in real-time during live matches and automatically finalized when matches end.',
      'Account & Settings': 'Account & Settings',
      'How do I change my profile information?': 'How do I change my profile information?',
      'Go to Settings and tap the edit icon next to your name. You can update your display name and profile photo.':
        'Go to Settings and tap the edit icon next to your name. You can update your display name and profile photo.',
      'How do I change my password?': 'How do I change my password?',
      'If you signed up with email, go to Settings and use the password reset option. You will receive a reset link via email.':
        'If you signed up with email, go to Settings and use the password reset option. You will receive a reset link via email.',
      'Can I change my email address?': 'Can I change my email address?',
      'Email addresses cannot be changed from within the app. Please contact support if you need to update your email address.':
        'Email addresses cannot be changed from within the app. Please contact support if you need to update your email address.',
      'How do I manage notifications?': 'How do I manage notifications?',
      'Open Settings and tap Match reminders. Champo explains how reminders work before requesting permission. You can change permission later in your device settings.':
        'Open Settings and tap Match reminders. Champo explains how reminders work before requesting permission. You can change permission later in your device settings.',
      'Subscription & Premium': 'Subscription & Premium',
      'What are the subscription benefits?': 'What are the subscription benefits?',
      'Premium subscriptions offer priority support, access to additional leagues, advanced statistics, and exclusive features.':
        'Premium subscriptions offer priority support, access to additional leagues, advanced statistics, and exclusive features.',
      'How do I subscribe?': 'How do I subscribe?',
      'Navigate to Settings and tap on "Subscription" to view available plans and manage your subscription.':
        'Navigate to Settings and tap on "Subscription" to view available plans and manage your subscription.',
      'How do I cancel my subscription?': 'How do I cancel my subscription?',
      "Subscriptions are managed through your device's app store (App Store for iOS, Play Store for Android). You can cancel anytime from your account settings.":
        "Subscriptions are managed through your device's app store (App Store for iOS, Play Store for Android). You can cancel anytime from your account settings.",
      'Contact Support': 'Contact Support',
      "Still have questions? Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.":
        "Still have questions? Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.",
      'Email Support': 'Email Support',
      'App Information': 'App Information',
      Version: 'Version',
      Platform: 'Platform',
      'iOS & Android': 'iOS & Android',
      "Thank you for using League! We're constantly working to improve your experience.":
        "Thank you for using League! We're constantly working to improve your experience.",
    },

    // Subscription
    subscription: {
      Subscription: 'Subscription',
      Plan: 'Plan',
      Subscribe: 'Subscribe',
      
      'Active Subscriptions': 'Active Subscriptions',
      
      
      
      
      'Your subscription has been updated successfully': 'Your subscription has been updated successfully',
      
      'Failed to restore purchases': 'Failed to restore purchases',
      'Restore Purchases': 'Restore Purchases',
      'No purchases found to restore': 'No purchases found to restore',
      
      
      Upgrade: 'Upgrade',
      Free: 'Free',
      FREE: 'FREE',
      PRO: 'PRO',
      
      
      
      
      
      
      
      
      
      
      'Upgrade to Pro': 'Upgrade to Pro',
      
      
      
      
      
    },

    moderation: {
      Nickname: 'Nickname',
      'Profile photo': 'Profile photo',
      'Report content': 'Report content',
      'Choose a reason for this report.': 'Choose a reason for this report.',
      'Report submitted': 'Report submitted',
      'Thank you. Our moderation team will review this report.':
        'Thank you. Our moderation team will review this report.',
      'Help keep Champo safe': 'Help keep Champo safe',
      'Reports are confidential. The reported user will not see who submitted the report.':
        'Reports are confidential. The reported user will not see who submitted the report.',
      'What are you reporting?': 'What are you reporting?',
      Reason: 'Reason',
      'Harassment or bullying': 'Harassment or bullying',
      'Hate speech': 'Hate speech',
      'Sexual content': 'Sexual content',
      'Violence or threats': 'Violence or threats',
      'Spam or scam': 'Spam or scam',
      Impersonation: 'Impersonation',
      'Privacy violation': 'Privacy violation',
      Other: 'Other',
      'Additional details': 'Additional details',
      'Describe what happened (optional)': 'Describe what happened (optional)',
      'Additional report details': 'Additional report details',
      'Submit report': 'Submit report',
      'Safety actions': 'Safety actions',
      Report: 'Report',
      Block: 'Block',
      Unblock: 'Unblock',
      'Blocked users': 'Blocked users',
      'Blocked users and their content are hidden from your leagues.':
        'Blocked users and their content are hidden from your leagues.',
      'Unable to load blocked users.': 'Unable to load blocked users.',
      'You have not blocked anyone': 'You have not blocked anyone',
      'Block user': 'Block user',
      'Their profile, predictions and leaderboard entries will be hidden from you.':
        'Their profile, predictions and leaderboard entries will be hidden from you.',
      'User blocked': 'User blocked',
      'This user’s content is now hidden.': 'This user’s content is now hidden.',
      'User unblocked': 'User unblocked',
      'You can see this user’s content again.': 'You can see this user’s content again.',
      'Report league name': 'Report league name',
      'Pending Reports': 'Pending Reports',
      'Content Reports': 'Content Reports',
      'Review reported nicknames, profile photos and league names.':
        'Review reported nicknames, profile photos and league names.',
      Pending: 'Pending',
      Resolved: 'Resolved',
      Dismissed: 'Dismissed',
      'Dismiss report': 'Dismiss report',
      'Remove member': 'Remove member',
      'Remove reported content': 'Remove reported content',
      'Mark this report as reviewed with no action?': 'Mark this report as reviewed with no action?',
      'Remove this member and their predictions from the league?':
        'Remove this member and their predictions from the league?',
      'Replace or hide the reported content immediately?': 'Replace or hide the reported content immediately?',
      Dismiss: 'Dismiss',
      Confirm: 'Confirm',
      'Unable to load content reports. Pull to refresh to try again.':
        'Unable to load content reports. Pull to refresh to try again.',
      'No reports in this queue': 'No reports in this queue',
      'Reported content': 'Reported content',
      'Reporter details': 'Reporter details',
      'Reported user': 'Reported user',
      'Reported by': 'Reported by',
      'Remove content': 'Remove content',
    },

    // Admin screens
    admin: {
      ADMIN: 'ADMIN',
      'Open Admin Dashboard': 'Open Admin Dashboard',
      'Platform Overview': 'Platform Overview',
      'User Management': 'User Management',
      'League Management': 'League Management',
      Users: 'Users',
      'Loading more users...': 'Loading more users...',
      'User deleted successfully': 'User deleted successfully',
      'Delete User': 'Delete User',
      'Unknown User': 'Unknown User',
      'Unknown user': 'Unknown user',
      'Unnamed User': 'Unnamed User',
      'Search by name or email...': 'Search by name or email...',
      'Review registered users and account details.': 'Review registered users and account details.',
      'Manage leagues and their metadata.': 'Manage leagues and their metadata.',
      'Inspect members across every league.': 'Inspect members across every league.',
      
      'Audit recent predictions submitted by users.': 'Audit recent predictions submitted by users.',
      Competitions: 'Competitions',
      Competition: 'Competition',
      'Add Competition': 'Add Competition',
      'Add New Competition': 'Add New Competition',
      'Remove competition': 'Remove competition',
      'Add or remove competitions from the platform.': 'Add or remove competitions from the platform.',
      
      
      'Unable to load competitions. Pull to refresh to try again.':
        'Unable to load competitions. Pull to refresh to try again.',
      'Competition ID': 'Competition ID',
      'Competition ID must be a valid number.': 'Competition ID must be a valid number.',
      Season: 'Season',
      'Season (optional)': 'Season (optional)',
      'Season must be a valid number when provided.': 'Season must be a valid number when provided.',
      
      'ID:': 'ID:',
      'Flag URL': 'Flag URL',
      'Logo URL': 'Logo URL',
      Football: 'Football',
      Showing: 'Showing',
      Validation: 'Validation',
    },

    // Privacy Policy
    privacy: {
      
      
      
      
      'Information We Collect': 'Information We Collect',
      'How We Use Information': 'How We Use Information',
      
      'Your Choices': 'Your Choices',
      'Data Retention': 'Data Retention',
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
    },

    // Match/Prediction Status
    status: {
      LIVE: 'LIVE',
      live: 'live',
      Live: 'Live',
      FT: 'FT',
      FINISHED: 'FINISHED',
      Finished: 'Finished',
      SCHEDULED: 'SCHEDULED',
      Scheduled: 'Scheduled',
      TIMED: 'TIMED',
      IN_PLAY: 'IN_PLAY',
      Pending: 'Pending',
      
      
      
      
      
      
      Bingo: 'Bingo',
      
      
      
      
      Missed: 'Missed',
      Hit: 'Hit',
      Miss: 'Miss',
    },

    // Home
    home: {
      Hello: 'Hello',
      'Good morning': 'Good morning',
      'Good afternoon': 'Good afternoon',
      'Good evening': 'Good evening',
      'Good night': 'Good night',
      Hits: 'Hits',

    },

    // Stats
    stats: {

      Stats: 'Stats',
      Player: 'Player',
      'Minimum 6 characters': 'Minimum 6 characters',
      'Minimum 8 characters': 'Minimum 8 characters',
      'Password must contain at least one letter and one number':
        'Password must contain at least one letter and one number',
      'Your stats': 'Your stats',
      'Primary league': 'Primary league',
      Rank: 'Rank',
      'Total Points': 'Total Points',
      
      Accuracy: 'Accuracy',
      "You're performing great!": "You're performing great!",
      'Keep it up!': 'Keep it up!',
      'Room to improve': 'Room to improve',
      'Correct scores': 'Correct scores',
      'Correct results': 'Correct results',
      
      'Current streak': 'Current streak',
      'Current form': 'Current form',
      'Last 5 finished predictions': 'Last 5 finished predictions',
      'No finished predictions yet': 'No finished predictions yet',
      
      'Performance by round': 'Performance by round',
      'Round {{n}}': 'Round {{n}}',
      'No round data yet': 'No round data yet',
      'Best category': 'Best category',
      '{{count}} correct': '{{count}} correct',
      "You're in the top {{percent}}% of the league": "You're in the top {{percent}}% of the league",
      'View breakdown': 'View breakdown',
    },

    // Fonts (legacy)
    fonts: {
      
      
      
      
      
    },

    // Legacy/Technical keys
    legacy: {
      
      Your: 'Your',
      OR: 'OR',
      
      'competitions.': 'competitions.',
      emailAddress: 'emailAddress',
      
      inviteCode: 'inviteCode',
      
      'league members.': 'league members.',
      leagueName: 'leagueName',
      'leagues.': 'leagues.',
      myLeagues: 'myLeagues',
      onChange: 'onChange',
      signIn: 'signIn',
      signUp: 'signUp',
      tabLongPress: 'tabLongPress',
      tabPress: 'tabPress',
      'recent predictions (latest 200 records).': 'recent predictions (latest 200 records).',
    },

    // World Cup feature
    worldCup: {
      'World Cup': 'World Cup',
      Groups: 'Groups',
      Knockout: 'Knockout',
      Group: 'Group',
      Aggregate: 'Aggregate',
      'League Phase': 'League Phase',
      Matchday: 'Matchday',
      'Round of 16': 'Round of 16',
      'Quarter Finals': 'Quarter Finals',
      'Semi Finals': 'Semi Finals',
      Final: 'Final',
      
      'Third-Fourth': '3rd Place Playoff',
      
      Team: 'Team',
      P: 'P',
      W: 'W',
      D: 'D',
      L: 'L',
      GD: 'GD',
      Pts: 'Pts',
      'No standings found': 'No standings found',
      Predict: 'Predict',
      Leaderboard: 'Leaderboard',
      'View all': 'View all',
      'Show less': 'Show less',

    },
    leagueOverview: {
      'Primary league': 'Primary league',
      
      USER: 'USER',
      POINTS: 'POINTS',
      'of {{count}} players': 'of {{count}} players',


      Table: 'Table',
      'Top leaderboard': 'Top leaderboard',
      
      'Today matches': 'Today matches',
      'No matches today': 'No matches today',
    },
    notifications: {
      Notifications: 'Notifications',
      'No notifications yet': 'No notifications yet',
      'Match starts soon': 'Match starts soon',
      'match-reminder-body': '{{home}} vs {{away}} starts soon, enter your prediction for the match',
    },
    aiAnalysis: {
      'AI analysis is not available': 'AI analysis is not available',
      'There is not enough reliable match data to show a prediction yet.':
        'There is not enough reliable match data to show a prediction yet.',
      'Updated {{date}}': 'Updated {{date}}',
      'AI-generated analysis for entertainment only. It may be inaccurate and is not betting advice.':
        'AI-generated analysis for entertainment only. It may be inaccurate and is not betting advice.',
      'AI prediction: {{home}} {{homeScore}}, {{away}} {{awayScore}}':
        'AI prediction: {{home}} {{homeScore}}, {{away}} {{awayScore}}',
    },
    activeUi: {
      'An email has been sent to your email address with a link to reset your password.': 'An email has been sent to your email address with a link to reset your password.',
      'Are you sure you want to delete your profile picture?': 'Are you sure you want to delete your profile picture?',
      'Ask the league owner for the invite code': 'Ask the league owner for the invite code',
      Away: 'Away',
      'Away score': 'Away score',
      'Choose how many friends can join this league.': 'Choose how many friends can join this league.',
      'Choose {{count}} active leagues': 'Choose {{count}} active leagues',
      'Coming Soon...': 'Coming Soon...',
      'Confirm Password': 'Confirm Password',
      Consistent: 'Consistent',
      'Create account': 'Create account',
      'Delete Profile Picture': 'Delete Profile Picture',
      'Edit league': 'Edit league',
      'Edit nickname': 'Edit nickname',
      Enabled: 'Enabled',
      'Checking...': 'Checking...',
      Blocked: 'Blocked',
      'Not requested': 'Not requested',
      Unavailable: 'Unavailable',
      'Match reminders': 'Match reminders',
      'Never miss a prediction': 'Never miss a prediction',
      'Get a reminder one hour before upcoming matches so you have time to enter your prediction. Notifications are optional and can be changed at any time.':
        'Get a reminder one hour before upcoming matches so you have time to enter your prediction. Notifications are optional and can be changed at any time.',
      'Not now': 'Not now',
      'Enable reminders': 'Enable reminders',
      'Notifications enabled': 'Notifications enabled',
      'Match reminders will be scheduled for upcoming matches.':
        'Match reminders will be scheduled for upcoming matches.',
      'Notifications are enabled. You can change this permission in device settings.':
        'Notifications are enabled. You can change this permission in device settings.',
      'Enable notifications from your device settings to receive match reminders.':
        'Enable notifications from your device settings to receive match reminders.',
      'Open Settings': 'Open Settings',
      'Unable to open device settings.': 'Unable to open device settings.',
      'Unable to update notification permission. Please try again.':
        'Unable to update notification permission. Please try again.',
      'Notifications are unavailable on this device.': 'Notifications are unavailable on this device.',
      'Enter your email address': 'Enter your email address',
      "Enter your email address and we'll send you a reset link": "Enter your email address and we'll send you a reset link",
      'Enter your new password': 'Enter your new password',
      'Enter your password securely': 'Enter your password securely',
      'Failed to delete image': 'Failed to delete image',
      'Failed to update password. Please try again.': 'Failed to update password. Please try again.',
      'Forgot Password': 'Forgot Password',
      General: 'General',
      Home: 'Home',
      'Home score': 'Home score',
      'Join my {{area}} league "{{name}}"! Use code: {{join_code}} Download the app to join!': 'Join my {{area}} league "{{name}}"! Use code: {{join_code}} Download the app to join!',
      'Join {{name}} League': 'Join {{name}} League',
      'League Created Successfully!': 'League Created Successfully!',
      'Manage Subscription': 'Manage Subscription',
      'Member not found': 'Member not found',
      'My Leagues': 'My Leagues',
      Nickname: 'Nickname',
      'Nickname must be at least 2 characters': 'Nickname must be at least 2 characters',
      'No leagues yet': 'No leagues yet',
      'No matches found': 'No matches found',
      'No predictions': 'No predictions',
      Notification: 'Notification',
      'Other Leagues': 'Other Leagues',
      'Password Updated': 'Password Updated',
      'Permission required': 'Permission required',
      'Please request a new link.': 'Please request a new link.',
      Predictor: 'Predictor',
      Preferences: 'Preferences',
      'Primary League': 'Primary League',
      'Reached top 10 in the table': 'Reached top 10 in the table',
      Regular: 'Regular',
      'Resend New Link': 'Resend New Link',
      'Reset link is invalid or expired.': 'Reset link is invalid or expired.',
      'Save New Password': 'Save New Password',
      'Sign in with Google': 'Sign in with Google',
      'Subscription status may be outdated while offline.': 'Subscription status may be outdated while offline.',
      'This league is full. Upgrade to create larger leagues.': 'This league is full. Upgrade to create larger leagues.',
      'Top 10': 'Top 10',
      'Upgrade to create more leagues and unlock more competitions.': 'Upgrade to create more leagues and unlock more competitions.',
      'Your PRO subscription is active.': 'Your PRO subscription is active.',
      'Your achievements': 'Your achievements',
      'Your password has been changed successfully.': 'Your password has been changed successfully.',
      button: 'button',
      '{{count}} correct predictions': '{{count}} correct predictions',
      '{{count}} matches played': '{{count}} matches played',
      'Code resent successfully!': 'Code resent successfully!',
      'Back to Sign In': 'Back to Sign In',
      'Change email address': 'Change email address',
      'Confirm and continue': 'Confirm and continue',
      "Didn't receive the code?": "Didn't receive the code?",
      'Email address is missing. Please try signing up again.': 'Email address is missing. Please try signing up again.',
      'Email verified successfully!': 'Email verified successfully!',
      'Enter the code': 'Enter the code',
      'Enter the code to finish creating your account.': 'Enter the code to finish creating your account.',
      'Forgot your password?': 'Forgot your password?',
      'Get back in the game': 'Get back in the game',
      'If an account exists for this email, a reset link will arrive shortly.':
        'If an account exists for this email, a reset link will arrive shortly.',
      'If an account exists for this email, the link may take a few minutes to arrive.':
        'If an account exists for this email, the link may take a few minutes to arrive.',
      'Error Details (Dev Only):': 'Error Details (Dev Only):',
      'Football Prediction': 'Football Prediction',
      'Go Home': 'Go Home',
      'No internet connection. Some features may not work.': 'No internet connection. Some features may not work.',
      'Predict. Compete. Win.': 'Predict. Compete. Win.',
      'Resend Code': 'Resend Code',
      'Resend in {{count}}s': 'Resend in {{count}}s',
      'Sending...': 'Sending...',
      'Secure your predictions': 'Secure your predictions',
      'Still need help?': 'Still need help?',
      'Contact support': 'Contact support',
      'Something went wrong': 'Something went wrong',
      'Try Again': 'Try Again',
      'Verify Email': 'Verify Email',
      'The code is single-use and expires shortly.': 'The code is single-use and expires shortly.',
      "We encountered an unexpected error. Don't worry, your data is safe.": "We encountered an unexpected error. Don't worry, your data is safe.",
      'Your other leagues and data will remain saved.': 'Your other leagues and data will remain saved.',
      'Your subscription has ended. Choose the leagues you want to keep active.': 'Your subscription has ended. Choose the leagues you want to keep active.',
      'Are you sure you want to delete {{name}}? This action cannot be undone.': 'Are you sure you want to delete {{name}}? This action cannot be undone.',
      'Are you sure you want to remove {{name}}?': 'Are you sure you want to remove {{name}}?',
      'Delete user': 'Delete user',
      Display: 'Display',
      'Failed to delete user: {{message}}': 'Failed to delete user: {{message}}',
      'ID: {{id}}': 'ID: {{id}}',
      No: 'No',
      'No email': 'No email',
      'No users found': 'No users found',
      'No users found matching your search': 'No users found matching your search',
      Predictions: 'Predictions',
      'Showing {{count}} competitions.': 'Showing {{count}} competitions.',
      'Showing {{count}} league members.': 'Showing {{count}} league members.',
      'Showing {{count}} leagues.': 'Showing {{count}} leagues.',
      'Showing {{count}} recent predictions (latest 200 records).': 'Showing {{count}} recent predictions (latest 200 records).',
      Yes: 'Yes',
      'this user': 'this user',
      '{{count}} users found': '{{count}} users found',
      points: 'points',
      pts: 'pts',
      '{{name}}, position {{position}}, {{points}} points': '{{name}}, position {{position}}, {{points}} points',
      'Toggle menu': 'Toggle menu',
      'My leagues': 'My leagues',
      'Verification code digit {{number}}': 'Verification code digit {{number}}',
      'Enter a single digit': 'Enter a single digit',
      'Resend verification code': 'Resend verification code',
      'Resend the verification code to your email': 'Resend the verification code to your email',
      '6 Members': '6 Members',
      '12 Members': '12 Members',
      Close: 'Close',
      'Loading card': 'Loading card',
      'Loading match': 'Loading match',
      'Loading match details': 'Loading match details',
      'Longest streak': 'Longest streak',
      'Member statistics': 'Member statistics',
      'Prediction statistics': 'Prediction statistics',
      Privacy: 'Privacy',
      Terms: 'Terms',
    },
  },
  //@eslint-disable-next-line @typescript-eslint/ban-ts-comment
  he: {
    // Data
    data: {
      
      
      
      
      
      
      
      
      
      
    },
    // Common - shared across all screens
    common: {
      Cancel: 'ביטול',
      Continue: 'המשך',
      Delete: 'מחיקה',
      Error: 'שגיאה',
      OK: 'OK',
      Save: 'שמור',
      'Enter prediction': 'הכנס תוצאה',
      Success: 'הצלחה',
      Update: 'עדכון',
      Remove: 'הסר',
      Name: 'שם',
      Email: 'דואר אלקטרוני',
      'Email address': 'דואר אלקטרוני',
      Password: 'סיסמה',
      Country: 'מדינה',
      Status: 'סטטוס',
      Type: 'סוג',
      Preview: 'תצוגה מקדימה',
      Primary: 'ראשי',
      Unknown: 'לא ידוע',
      'Not assigned': 'לא מוקצה',
      'Copied!': 'הועתק!',
      'Deleted Player': 'שחקן שנמחק',
      'Member Details': 'פרטי חבר',
      '{{name}} profile picture': 'תמונת הפרופיל של {{name}}',
      'User profile picture': 'תמונת פרופיל של משתמש',
      '{{name}} profile placeholder, {{initial}}': 'מציין מקום לפרופיל של {{name}}, האות {{initial}}',
      'User profile placeholder, {{initial}}': 'מציין מקום לפרופיל, האות {{initial}}',
      
      'An unexpected error occurred': 'אירעה שגיאה בלתי צפויה. נסו שנית.',
      'An unexpected error occurred. Please try again.': 'אירעה שגיאה בלתי צפויה. נסו שנית.',
      Loading: 'טוען',
      'Button disabled': 'כפתור מושבת',
      'Double tap to {{action}}': 'הקשה כפולה ל{{action}}',
      '{{name}} input field': 'שדה קלט {{name}}',
      'Enter {{placeholder}}': 'הזן {{placeholder}}',
      'Toggle password visibility': 'החלף תצוגת סיסמה',
      'from this league': 'מהליגה הזאת',
      Validation: 'אימות',
      'Privacy Policy': 'מדיניות פרטיות',
      'Terms of Service': 'תנאי שימוש',
      'By creating an account, you agree to:': 'ביצירת חשבון, הנך מסכים/ה ל:',
      'Terms': 'תנאי שימוש',
      'Privacy': 'פרטיות',
    },

    // Auth screens
    auth: {
      'Sign In': 'התתחבר',
      'Sign Up': 'הירשם',
      'Sign Out': 'התנתק',
      
      OR: 'או',
      Logout: 'יציאה',
      'Create account': 'יצירת חשבון',
      'Sign in to your account': 'התחבר לחשבון שלך',
      'Forgot Password': 'שכחתי סיסמה',
      'Sign in with Google': 'התחברות עם Google',
      'Sign in with Apple': 'התחברות עם Apple',
      
      'Full Name': 'שם מלא',

      'Sign up to get started': 'הירשם כדי להתחיל',
      
      
      
      'Welcome Back': 'ברוך הבא',
      
      'Welcome to League': 'ברוכים הבאים לליגה',
      
      'Get Started': 'התחילו',
      'Every match is a challenge': 'כל משחק הוא אתגר',
      'Predict scores, compete with friends, and climb the table.':
        'חוזים תוצאות, מתחרים עם חברים ומטפסים בטבלה.',
      'My prediction': 'התחזית שלי',
      'Predicted score': 'התוצאה שלי',
      'Already have an account?': 'כבר יש לך חשבון?',
      'Create your Champo account': 'יצירת חשבון Champo',
      Back: 'חזרה',
      'Join the challenge': 'מצטרפים לאתגר',
      'Sign in to continue your predictions': 'מתחברים כדי להמשיך לתחזיות שלך',
      'Create one account and keep all your predictions in one place.':
        'פותחים חשבון ושומרים את כל התחזיות במקום אחד.',
      'Predict. Compete. Climb.': 'חוזים. מתחרים. מטפסים.',
      "Don't have an account?": 'אין לך חשבון?',
      'Password strength': 'חוזק הסיסמה',
      'Strong password': 'סיסמה חזקה',
      'At least 8 characters with a letter and a number': 'לפחות 8 תווים, כולל אות ומספר',
      'Reset Password': 'איפוס סיסמה',
      
      
      
      'Enter your email': 'הזן דואר אלקטרוני',
      
      
      'Send Reset Link': 'שלח קישור לאיפוס סיסמה',
      
      
      
      
      'We sent a 6-digit code to': 'שלחנו קוד בן 6 ספרות אל',
      'Apple and Google sign-in do not require email verification.':
        'התחברות עם Apple או Google אינה דורשת אימות דואר אלקטרוני.',
      'Prefer not to wait?': 'לא רוצה לחכות?',
      'Sign in with Apple or Google': 'התחבר עם Apple או Google',
      'Email is required': 'דואר אלקטרוני נדרש',
      'Invalid email': 'דואר אלקטרוני שגוי',
      'Password is required': 'סיסמה נדרשת',
      
      
      
      'New Password': 'סיסמה חדשה',
      
      
      
      
      
      
      
      'Failed to sign out': 'שגיאה ביציאה',
      'Failed to update password': 'שגיאה בעדכון סיסמה',
      
    },

    // Leagues screens
    leagues: {
      League: 'ליגה',
      Leagues: 'ליגות',
      'Create or join a league to get started.': 'צור ליגה או הצטרף לליגה כדי להתחיל.',
      'Full ranking': 'הדירוג המלא',
      Round: 'מחזור',
      'All season': 'כל העונה',
      Friends: 'חברים',
      World: 'עולם',
      'Requires PRO': 'דורש מנוי PRO',
      You: 'אתה',
      'More friends, more competition': 'יותר חברים, יותר תחרות',
      'Invite friends to your league and make every match more exciting.':
        'הזמינו חברים לליגה והפכו כל משחק למעניין יותר.',
      '{{count}} leagues': 'ליגות {{count}}',
      'Enter league': 'כניסה לליגה',
      'Requires Pro': 'דורש Pro',
      'Want to open more leagues?': 'רוצה לפתח ליגות נוספות?',
      'Upgrade to Pro and open up to {{count}} leagues': 'שדרג ל-Pro ופתח עד {{count}} ליגות',

      'Create League': 'יצירת ליגה',
      
      'Manage League': 'ניהול ליגה',
      'Invite friends': 'הזמנת חברים',
      'Invite code': 'קוד הצטרפות',
      'Danger zone': 'אזור מסוכן',
      'Deleting a league cannot be undone.': 'לא ניתן לבטל את מחיקת הליגה.',
      'You will lose access to this league.': 'לאחר העזיבה לא תהיה לך גישה לליגה הזו.',
      'Save changes': 'שמירת שינויים',
      "That's the whole leaderboard for now": 'זה כל הדירוג בינתיים',
      'Invite more friends and make the league more competitive.':
        'הזמינו חברים נוספים והפכו את הליגה לתחרותית יותר.',
      
      'Leave league': 'עזיבת ליגה',
      'Failed to share invite code': 'שיתוף קוד ההזמנה נכשל',
      'Join League': 'הצטרפות לליגה',
      
      'Save active leagues': 'שמור ליגות פעילות',
      'Activate league': 'הפעל ליגה',
      'Activate leagues': 'הפעל ליגות',
      'Select league to activate': 'בחר ליגה להפעלה',
      
      '{{count}} inactive leagues kept in your account': '{{count}} ליגות לא פעילות נשמרות בחשבון שלך',
      'Leave League': 'עזוב ליגה',
      
      Leave: 'עזוב ליגה',
      'League Name': 'שם הליגה',
      'League Created Successfully!': 'ליגה נוצרה בהצלחה!',
      'League name': 'שם הליגה',
      'League details': 'פרטי הליגה',
      'League Details': 'פרטי הליגה',
      'Select Competition': 'בחירת ליגה',
      'Ask the league owner for the invite code': 'קבלו ממנהל הליגה קוד הזמנה',
      'Enter league name': 'הזן שם הליגה',
      
      'League name is required': 'שם ליגה שדה חובה',
      
      'League name must be between 2 and 20 characters.': 'שם הליגה חייב להכיל בין 2 ל־20 תווים.',
      'League name must be at most 20 characters long': 'שם הליגה יכול להכיל עד 20 תווים',
      
      
      
      'League not found': 'ליגה לא נמצאה',
      
      
      'Unable to load leagues. Pull to refresh to try again.': 'לא ניתן לטעון ליגות. נסה לטעון מחדש ',
      'Failed to create league': 'שגיאה ביצירת ליגה',
      'Subscription not confirmed': 'המנוי לא אומת',
      'We could not confirm your PRO subscription. Please try again in a moment.':
        'לא הצלחנו לאמת את מנוי ה-PRO שלך. נסה שוב בעוד רגע.',
      'Failed to join league': 'שגיאה בהצטרפות לליגה',
      
      
      'Start League': 'התחל ליגה',
      
      'How to Join a League': 'כיצד להצטרף לליגה',
      'Get the 7-digit invite code from the league owner.': 'קבלו את קוד ההזמנה מהמנהל של הליגה.',
      'Enter the code above to find the league.': 'הזינו את הקוד שלמעלה כדי למצוא את הליגה.',
      'Choose your nickname for the league.': 'בחרו שם משתמש לליגה.',
      'Tap "Join League" to become a member.': 'לחץ על "הצטרף לליגה" כדי להפוך לחבר.',
      
      'Enter 7-digit invite code': 'הזן קוד הזמנה של 7 ספרות',
      'Invite Code': 'קוד הזמנה',
      'Join Code': 'קוד הצטרפות',
      
      'Invite code is required': 'קוד הזמנה נדרש',
      
      'Searching for league...': 'מחפש ליגה...',
      'Join code copied to clipboard.': 'קוד הזמנה הועתק.',
      'Share Join Code': 'שיתפו קוד הזמנה',
      'League Join Code': 'קוד הזמנה לליגה',
      'Tap to copy code': 'לחץ כדי להעתיק את הקוד',
      'Enter your nickname': 'הכנס שם משתמש',
      
      'Your Nickname': 'שם משתמש',
      'Nickname is required': 'שם משתמש שדה חובה',
      'Nickname must be at least 2 characters long': 'שם משתמש חייב להיות לפחות 2 תווים',
      'Nickname must be at most 20 characters long': 'שם המשתמש יכול להכיל עד 20 תווים',
      'Nickname must be at most 20 characters': 'שם המשתמש יכול להכיל עד 20 תווים',
      
      Members: 'חברים',
      'League table': 'טבלת ליגה',
      Gameweek: 'מחזור',
      'Your rank': 'הדירוג שלך',
      
      User: 'משתמש',
      'Correct Scores': 'תוצאות מדויקות',
      Movement: 'שינוי',
      'Max Members': 'מקסימום חברים',
      
      
      '6 Members': '6 חברים',
      
      
      
      'Choose how many friends can join this league.': 'בחר כמה חברים יכולים להצטרף לליגה הזאת.',
      
      
      
      
      'League Members': 'חברים בליגה',
      'League Owner': 'מנהל הליגה',
      
      
      'Remove Member': 'הסר חבר',
      'Unable to load league members. Pull to refresh to try again.': 'לא ניתן לטעון חברים. נסה לטעון מחדש ',
      Owner: 'בעלים',
      'Unknown owner': 'בעל לא ידוע',
      'Unknown member': 'חבר לא ידוע',
      'Unknown League': 'ליגה לא ידועה',
      Joined: 'הצטרפות',
      
      Created: 'נוצר',
      'Created at': 'נוצר בתאריך',
      
      'You have reached the max number of leagues': 'הגעת למספר הליגות המקסימלי',
      
      
    },

    // Matches and Predictions
    matches: {
      Matches: 'משחקים',
      
      
      
      
      
      
      Prediction: 'ניחוש',
      
      
      
      
      
      
      
      'Predicted Score': 'ניקוד צופיות',
      'Prediction Results': 'תוצאות ניחוש ',
      'No prediction': 'אין ניחוש',
      
      'Unable to load predictions. Pull to refresh to try again.': 'לא ניתן לטעון ניחושים. נסה לטעון מחדש ',
      
      

      pts: 'נק',
      Points: 'נקודות',

      
      
      'Premium stats only': 'סטטיסטיקה למנויי פרו בלבד',
      'Upgrade to Pro to unlock match statistics': 'שדרג לפרו כדי לפתוח סטטיסטיקות משחק',
      Submitted: 'נשלח',
      'Fixture ID': 'מזהה צופיות',
      'Coming Soon...': 'בקרוב ...',
      
      'AI match analysis': 'ניתוח המשחק באמצעות AI',
      'Unlock the full AI analysis with Pro': 'ניתוח ה-AI המלא זמין למנויי פרו',
      'AI Prediction': 'תחזית AI',
      'AI Analysis': 'ניתוח AI',
      'Get the full breakdown behind every prediction.':
        'קבל את הניתוח המלא שמאחורי כל תחזית.',
      
    },

    // Profile and Settings
    profile: {
      Profile: 'פרופיל',
      Me: 'שלי',
      Settings: 'הגדרות',
      'Leave League': 'עזוב ליגה',
      'Are you sure you want to leave this league?': 'האם אתה בטוח שברצונך לצאת מהליגה ?',
      'Delete League': 'מחיקת ליגה',
      'Permission required': 'הרשאה נדרשת',
      'from this league': 'מהליגה הזאת',
      Error: 'שגיאה',
      'Nickname is required': 'שם משתמש נדרש',
      'Nickname must be at least 2 characters': 'שם משתמש חייב להיות לפחות 2 תווים',

      Nickname: 'שם משתמש',
      Save: 'שמירה',
      Cancel: 'ביטול',
      'Failed to delete image': 'שגיאה במחיקת תמונה',
      'Delete Profile Picture': 'מחיקת תמונת פרופיל',
      'Are you sure you want to delete this league?':
        'פעולה זו תמחק לצמיתות את הליגה, את כל החברים ואת כל הניחושים. האם אתה בטוח?',
      'Are you sure you want to delete your profile picture?': 'האם אתה בטוח שברצונך למחוק את תמונת הפרופיל שלך?',
      
      'Switch to {{language}}': 'החלף ל {{language}}',
      
      English: 'אנגלית',
      Hebrew: 'עברית',
      
      'Help & Support': 'עזרה ותמיכה',
      Help: 'עזרה',
      'Contact Us': 'יצירת קשר',
      Info: 'מידע',
      
      'Choose Image': 'בחירת תמונה',
      
      
      
      
      
      
      
      'Failed to pick image': 'שגיאה בבחירת תמונה',
      'Failed to upload image': 'שגיאה בהעלאת תמונה',
      
      
      Theme: 'ערכת עיצוב',
      Language: 'שפה',
      'Delete Account': 'מחיקת חשבון',
      
      'Delete account confirmation message':
        'האם למחוק את החשבון? החשבון, הפרופיל והמידע האישי שלך יימחקו. ניחושים וניקוד מהעבר יישמרו בשם „שחקן שנמחק” כדי לשמור על היסטוריית הליגה. לא ניתן לבטל פעולה זו. מחיקת החשבון לא מבטלת מנוי App Store — יש לבטל אותו בהגדרות Apple ID ← מנויים.',
      'Delete personal data while keeping anonymized league history.':
        'מחיקת מידע אישי תוך שמירת היסטוריית ליגה אנונימית.',
      'Check your subscription first': 'לפני המחיקה, חשוב לבדוק את המינוי',
      'Deleting your Champo account does not cancel an active App Store subscription.':
        'מחיקת חשבון Champo אינה מבטלת מינוי פעיל ב-App Store.',
      'Continue deletion': 'המשך למחיקה',
    },

    // Help & Support
    help: {
      'Welcome to League Champion': "ברוכים הבאים לליגה צ'מפיון",
      'League is a football prediction app where you compete with friends by predicting match results. Create or join leagues, make predictions, and climb the leaderboard!':
        'ליגה היא אפליקציית חיזוי כדורגל שבה אתה מתחרה עם חברים על ידי חיזוי תוצאות משחקים. צור או הצטרף לליגות, בצע חיזויים וטיפס בטבלת המובילים!',
      'Getting Started': 'תחילת עבודה',
      'How do I create an account?': 'איך אני יוצר חשבון?',
      'You can sign up using your email address or sign in with Google. After creating your account, verify your email address to get started.':
        'אתה יכול להירשם באמצעות כתובת הדוא"ל שלך או להתחבר עם Google. לאחר יצירת החשבון שלך, אמת את כתובת הדוא"ל שלך כדי להתחיל.',
      'How do I join a league?': 'איך אני מצטרף לליגה?',
      'Navigate to the "My Leagues" tab and tap the "+" button. You can either create a new league or join an existing one using a league code.':
        'נווט לטאב "הליגות שלי" ולחץ על כפתור ה-"+". אתה יכול ליצור ליגה חדשה או להצטרף לליגה קיימת באמצעות קוד ליגה.',
      'What is a league?': 'מה זה ליגה?',
      'A league is a group where you compete with other users by making predictions on football matches. Each league tracks points and rankings.':
        'ליגה היא קבוצה שבה אתה מתחרה עם משתמשים אחרים על ידי ביצוע חיזויים על משחקי כדורגל. כל ליגה עוקבת אחר נקודות ודירוגים.',
      'Making Predictions': 'ביצוע חיזויים',
      'How do I make a prediction?': 'איך אני מבצע חיזוי?',
      'Go to the "Matches" tab, select a match, and enter your predicted score for both teams. You can update your prediction until the match starts.':
        'עבור לטאב "משחקים", בחר משחק והזן את הניקוד הצפוי שלך עבור שתי הקבוצות. אתה יכול לעדכן את החיזוי שלך עד שהמשחק מתחיל.',
      'When can I make predictions?': 'מתי אני יכול לבצע חיזויים?',
      'You can make or update predictions anytime before a match kicks off. Once the match starts, predictions are locked and cannot be changed.':
        'אתה יכול לבצע או לעדכן חיזויים בכל עת לפני שהמשחק מתחיל. ברגע שהמשחק מתחיל, החיזויים ננעלים ולא ניתן לשנות אותם.',
      'How are points calculated?': 'איך מחושבות הנקודות?',
      'Points are awarded based on the accuracy of your prediction. Exact score predictions earn the most points, followed by correct result (win/draw), and correct goal difference.':
        'נקודות מוענקות על בסיס הדיוק של החיזוי שלך. חיזויי ניקוד מדויקים מרוויחים את הכי הרבה נקודות, ואחריהם תוצאה נכונה (ניצחון/תיקו) והפרש שערים נכון.',
      'Leagues & Rankings': 'ליגות ודירוגים',
      'How do I create my own league?': 'איך אני יוצר ליגה משלי?',
      'Tap the "+" button in "My Leagues", select "Create League", choose a competition, and invite friends using the league code.':
        'לחץ על כפתור ה-"+" ב-"הליגות שלי", בחר "צור ליגה", בחר תחרות והזמן חברים באמצעות קוד הליגה.',
      'How do I view the leaderboard?': 'איך אני רואה את טבלת המובילים?',
      'Open any league from "My Leagues" to see the current rankings. Points are updated automatically after matches finish.':
        'פתח כל ליגה מ-"הליגות שלי" כדי לראות את הדירוגים הנוכחיים. הנקודות מתעדכנות אוטומטית לאחר שהמשחקים מסתיימים.',
      'Can I leave a league?': 'האם אני יכול לעזוב ליגה?',
      'Yes, you can leave a league at any time from the league details screen. Note that your predictions and points will remain in the league history.':
        'כן, אתה יכול לעזוב ליגה בכל עת מלשונית הפרופיל. שים לב שהחיזויים והנקודות שלך יישארו בהיסטוריית הליגה.',
      'Matches & Fixtures': 'משחקים ותחרויות',
      'How do I view upcoming matches?': 'איך אני רואה משחקים קרובים?',
      'Go to the "Matches" tab to see all upcoming fixtures for your leagues. You can filter by round or competition.':
        'עבור לטאב "משחקים" כדי לראות את כל המשחקים הקרובים עבור הליגות שלך. אתה יכול לסנן לפי סיבוב או תחרות.',
      'What match information is available?': 'איזה מידע על המשחק זמין?',
      'For each match, you can see team lineups, live scores, match events (goals, cards, substitutions), and detailed statistics.':
        'עבור כל משחק, אתה יכול לראות הרכבי קבוצות, ניקוד חי, אירועי משחק (שערים, כרטיסים, החלפות) וסטטיסטיקות מפורטות.',
      'How often are match results updated?': 'כמה פעמים מתעדכנות תוצאות המשחקים?',
      'Match results and scores are updated in real-time during live matches and automatically finalized when matches end.':
        'תוצאות המשחקים והניקוד מתעדכנים בזמן אמת במהלך משחקים חיים ומתסיימים אוטומטית כאשר המשחקים מסתיימים.',
      'Account & Settings': 'חשבון והגדרות',
      'How do I change my profile information?': 'איך אני משנה את פרטי הפרופיל שלי?',
      'Go to Settings and tap the edit icon next to your name. You can update your display name and profile photo.':
        'עבור להגדרות ולחץ על סמל העריכה ליד השם שלך. אתה יכול לעדכן את שם התצוגה ותמונת הפרופיל שלך.',
      'How do I change my password?': 'איך אני משנה את הסיסמה שלי?',
      'If you signed up with email, go to Settings and use the password reset option. You will receive a reset link via email.':
        'אם נרשמת עם דוא"ל, עבור להגדרות והשתמש באפשרות איפוס הסיסמה. תקבל קישור לאיפוס באמצעות דוא"ל.',
      'Can I change my email address?': 'האם אני יכול לשנות את כתובת הדוא"ל שלי?',
      'Email addresses cannot be changed from within the app. Please contact support if you need to update your email address.':
        'לא ניתן לשנות כתובות דוא"ל מתוך האפליקציה. אנא צור קשר עם התמיכה אם אתה צריך לעדכן את כתובת הדוא"ל שלך.',
      'How do I manage notifications?': 'איך אני מנהל התראות?',
      'Open Settings and tap Match reminders. Champo explains how reminders work before requesting permission. You can change permission later in your device settings.':
        'פתחו את ההגדרות והקישו על תזכורות למשחקים. Champo תציג הסבר לפני בקשת ההרשאה, וניתן לשנות אותה בהמשך בהגדרות המכשיר.',
      'Subscription & Premium': 'מנוי ופרימיום',
      'What are the subscription benefits?': 'מהם היתרונות של המנוי?',
      'Premium subscriptions offer priority support, access to additional leagues, advanced statistics, and exclusive features.':
        'מנויי פרימיום מציעים תמיכה עדיפה, גישה לליגות נוספות, סטטיסטיקות מתקדמות ותכונות בלעדיות.',
      'How do I subscribe?': 'איך אני נרשם למנוי?',
      'Navigate to Settings and tap on "Subscription" to view available plans and manage your subscription.':
        'נווט להגדרות ולחץ על "מנוי" כדי לראות תוכניות זמינות ולנהל את המנוי שלך.',
      'How do I cancel my subscription?': 'איך אני מבטל את המנוי שלי?',
      "Subscriptions are managed through your device's app store (App Store for iOS, Play Store for Android). You can cancel anytime from your account settings.":
        'מנויים מנוהלים דרך חנות האפליקציות של המכשיר שלך (App Store עבור iOS, Play Store עבור Android). אתה יכול לבטל בכל עת מהגדרות החשבון שלך.',
      'Contact Support': 'יצירת קשר עם התמיכה',
      "Still have questions? Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.":
        'עדיין יש לך שאלות? צוות התמיכה שלנו כאן כדי לעזור. פנה אלינו ונחזור אליך בהקדם האפשרי.',
      'Email Support': 'תמיכה בדוא"ל',
      'App Information': 'מידע על האפליקציה',
      Version: 'גרסה',
      Platform: 'פלטפורמה',
      'iOS & Android': 'iOS ו-Android',
      "Thank you for using League! We're constantly working to improve your experience.":
        'תודה על השימוש בליגה! אנחנו עובדים כל הזמן כדי לשפר את החוויה שלך.',
    },

    // Subscription
    subscription: {
      Subscription: 'מנוי',
      Plan: 'מנוי',
      Subscribe: 'הירשם',
      PRO: 'פרו',
      
      
      
      'Active Subscriptions': 'תשלומים פעילים',
      
      
      
      
      
      
      
      
      
      
      
      
      'Your subscription has been updated successfully': 'המנוי שלך עודכן בהצלחה',
      
      'Failed to restore purchases': 'שחזור הרכישות נכשל',
      'Restore Purchases': 'שחזור רכישות',
      'No purchases found to restore': 'לא נמצאו רכישות לשחזור',
      
      
      Upgrade: 'שדרג',
      Free: 'חינם',
      FREE: 'חינם',
      
      
      
      
      
      
      
      
      
      
      'Upgrade to Pro': 'שדרג לפרו',
      
      
      
      
      
    },

    moderation: {
      Nickname: 'כינוי',
      'Profile photo': 'תמונת פרופיל',
      'Report content': 'דיווח על תוכן',
      'Choose a reason for this report.': 'בחר סיבה לדיווח.',
      'Report submitted': 'הדיווח נשלח',
      'Thank you. Our moderation team will review this report.': 'תודה. צוות הניהול יבדוק את הדיווח.',
      'Help keep Champo safe': 'עזרו לנו לשמור על Champo בטוחה',
      'Reports are confidential. The reported user will not see who submitted the report.':
        'הדיווח חסוי. המשתמש שעליו דיווחת לא יראה מי שלח את הדיווח.',
      'What are you reporting?': 'על מה ברצונך לדווח?',
      Reason: 'סיבה',
      'Harassment or bullying': 'הטרדה או בריונות',
      'Hate speech': 'דברי שנאה',
      'Sexual content': 'תוכן מיני',
      'Violence or threats': 'אלימות או איומים',
      'Spam or scam': 'ספאם או הונאה',
      Impersonation: 'התחזות',
      'Privacy violation': 'פגיעה בפרטיות',
      Other: 'אחר',
      'Additional details': 'פרטים נוספים',
      'Describe what happened (optional)': 'תאר מה קרה (אופציונלי)',
      'Additional report details': 'פרטים נוספים לדיווח',
      'Submit report': 'שליחת דיווח',
      'Safety actions': 'פעולות בטיחות',
      Report: 'דיווח',
      Block: 'חסימה',
      Unblock: 'ביטול חסימה',
      'Blocked users': 'משתמשים חסומים',
      'Blocked users and their content are hidden from your leagues.':
        'משתמשים חסומים והתוכן שלהם מוסתרים מהליגות שלך.',
      'Unable to load blocked users.': 'לא ניתן לטעון משתמשים חסומים.',
      'You have not blocked anyone': 'לא חסמת אף משתמש',
      'Block user': 'חסימת משתמש',
      'Their profile, predictions and leaderboard entries will be hidden from you.':
        'הפרופיל, הניחושים והמיקום של המשתמש יוסתרו ממך.',
      'User blocked': 'המשתמש נחסם',
      'This user’s content is now hidden.': 'התוכן של המשתמש מוסתר כעת.',
      'User unblocked': 'החסימה בוטלה',
      'You can see this user’s content again.': 'ניתן לראות שוב את התוכן של המשתמש.',
      'Report league name': 'דיווח על שם הליגה',
      'Pending Reports': 'דיווחים ממתינים',
      'Content Reports': 'דיווחי תוכן',
      'Review reported nicknames, profile photos and league names.':
        'בדיקת כינויים, תמונות פרופיל ושמות ליגה שדווחו.',
      Pending: 'ממתינים',
      Resolved: 'טופלו',
      Dismissed: 'נדחו',
      'Dismiss report': 'דחיית דיווח',
      'Remove member': 'הסרת חבר',
      'Remove reported content': 'הסרת התוכן המדווח',
      'Mark this report as reviewed with no action?': 'לסמן את הדיווח כבדוק ללא פעולה?',
      'Remove this member and their predictions from the league?': 'להסיר את החבר ואת ניחושיו מהליגה?',
      'Replace or hide the reported content immediately?': 'להחליף או להסתיר את התוכן המדווח מיד?',
      Dismiss: 'דחייה',
      Confirm: 'אישור',
      'Unable to load content reports. Pull to refresh to try again.':
        'לא ניתן לטעון דיווחי תוכן. משוך לרענון ונסה שוב.',
      'No reports in this queue': 'אין דיווחים בתור זה',
      'Reported content': 'התוכן המדווח',
      'Reporter details': 'פרטי המדווח',
      'Reported user': 'המשתמש המדווח',
      'Reported by': 'דווח על ידי',
      'Remove content': 'הסרת תוכן',
    },

    // Admin screens
    admin: {
      ADMIN: 'מנהל',
      'Open Admin Dashboard': 'פתיחת לוח הניהול',
      'Platform Overview': 'תקציר פלטפורמה',
      'User Management': 'ניהול משתמשים',
      'League Management': 'ניהול ליגה',
      Users: 'משתמשים',
      'Loading more users...': 'טוען חברים נוספים...',
      'User deleted successfully': 'משתמש נמחק בהצלחה',
      'Delete User': 'מחיקת משתמש',
      'Unknown User': 'משתמש לא ידוע',
      'Unknown user': 'משתמש לא ידוע',
      'Unnamed User': 'משתמש ללא שם',
      'Search by name or email...': 'חפש לפי שם או דואר אלקטרוני...',
      'Review registered users and account details.': 'סקירת משתמשים רשומים ופרטי חשבון.',
      'Manage leagues and their metadata.': 'ניהול ליגות ומידעים נוספים.',
      'Inspect members across every league.': 'בדיקת חברים בכל ליגה.',
      
      'Audit recent predictions submitted by users.': 'בדיקת צופיות שנשלחו על ידי המשתמשים.',
      Competitions: 'ליגות',
      Competition: 'ליגה',
      'Add Competition': 'הוספת ליגה',
      'Add New Competition': 'הוספת ליגה חדשה',
      'Remove competition': 'הסר ליגה',
      'Add or remove competitions from the platform.': 'הוספת או הסרת ליגות מהמערכת.',
      
      
      'Unable to load competitions. Pull to refresh to try again.': 'לא ניתן לטעון ליגות. נסה לטעון מחדש ',
      'Competition ID': 'מזהה ליגה',
      'Competition ID must be a valid number.': 'מזהה ליגה חייב להיות מספר תקין.',
      Season: 'עונה',
      'Season (optional)': 'עונה (אופציונלי)',
      'Season must be a valid number when provided.': 'העונה חייבת להיות מספר תקין כאשר מוצגת.',
      
      'ID:': 'מזהה:',
      'Flag URL': 'תמונת ס国旗',
      'Logo URL': 'כתובת תמונת הלוגו',
      Football: 'כדורגל',
      Showing: 'מוצג',
      Validation: 'אימות',
    },

    // Privacy Policy
    privacy: {
      
      
      
      
      
      'Information We Collect': 'מידע שאנו מאחסנים',
      'How We Use Information': 'שימוש במידע',
      
      'Your Choices': 'החלטות שלך',
      'Data Retention': 'שמירת נתונים',
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
    },

    // Match/Prediction Status
    status: {
      LIVE: 'חי',
      live: 'LIVE',
      Live: 'זמן אמת',
      FT: 'סיום',
      FINISHED: 'סיום',
      Finished: 'סיום',
      SCHEDULED: 'מתוכננים',
      Scheduled: 'מתוכנן',
      TIMED: 'זמני',
      IN_PLAY: 'במשחק',
      Pending: 'ממתין',
      
      
      
      
      
      
      Bingo: 'בינגו',
      
      
      

      Hit: 'פגיעה',
      Miss: 'פיספוס',
    },

    // Home
    home: {
      Hello: 'שלום',
      'Good morning': 'בוקר טוב',
      'Good afternoon': 'צהריים טובים',
      'Good evening': 'ערב טוב',
      'Good night': 'לילה טוב',
      Hits: 'פגיעות',

    },

    // Stats
    stats: {


      Stats: 'סטטיסטיקה',
      Player: 'שחקן',
      Missed: 'פיספוסים',
      Regular: 'פגיעות',
      Bingo: 'בינגו',
      'Minimum 6 characters': 'מינימום 6 תווים',
      'Minimum 8 characters': 'מינימום 8 תווים',
      'Password must contain at least one letter and one number':
        'הסיסמה חייבת לכלול לפחות אות אחת ומספר אחד',
      Accuracy: 'דיוק',
      'Prediction Results': 'תוצאות ניחוש',
      
      
      

      'Total Points': 'סך הכל נקודות',
      
      
      
      
      
      
      'Your stats': 'הסטטיסטיקה שלך',
      'Primary league': 'ליגה ראשית',
      Rank: 'דירוג',
      
      "You're performing great!": 'אתה מצליח מעולה!',
      'Keep it up!': 'המשך כך!',
      'Room to improve': 'יש מקום לשיפור',
      'Correct scores': 'תוצאות מדויקות',
      'Correct results': 'תוצאות נכונות',
      
      'Current streak': 'רצף נוכחי',
      'Current form': 'כושר נוכחי',
      'Last 5 finished predictions': '5 הניחושים האחרונים שהסתיימו',
      'No finished predictions yet': 'עדיין אין ניחושים שהסתיימו',
      
      'Performance by round': 'ביצועים לפי סיבוב',
      'Round {{n}}': 'סיבוב {{n}}',
      'No round data yet': 'אין נתונים לסיבובים עדיין',
      'Best category': 'קטגוריה מובילה',
      '{{count}} correct': '{{count}} נכונים',
      "You're in the top {{percent}}% of the league": 'אתה ב-{{percent}}% העליונים של הליגה',
      'View breakdown': 'צפה בפירוט',
    },

    // Fonts (legacy)
    fonts: {
      
      
      
      
      
    },

    // Legacy/Technical keys
    legacy: {
      
      Your: 'שלך',
      OR: 'או',
      
      'competitions.': 'ליגות.',
      emailAddress: 'דואר',
      
      inviteCode: 'קוד הזמנה',
      
      'league members.': 'חברים בליגה.',
      leagueName: 'שם הליגה',
      'leagues.': 'ליגות.',
      myLeagues: 'הליגות שלי',
      onChange: 'שינוי',
      signIn: 'התחברות',
      signUp: 'הירשם',
      tabLongPress: 'הירשם',
      tabPress: 'הירשם',
      'recent predictions (latest 200 records).': 'צופיות אחרונות (מעדכנות אחרונות 200 רשומות).',
    },

    // World Cup feature
    worldCup: {
      'World Cup': 'גביע העולם',
      Groups: 'בתים',
      Knockout: 'נוקאאוט',
      Group: 'בית',
      Aggregate: 'מצרפי',
      'League Phase': 'שלב הליגה',
      Matchday: 'מחזור',
      'Round of 16': 'שמינית גמר',
      'Quarter Finals': 'רבע גמר',
      'Semi Finals': 'חצי גמר',
      Final: 'גמר',
      
      'Third-Fourth': 'מקום 3–4',
      
      Team: 'קבוצה',
      P: 'מ',
      W: 'נ',
      D: 'ת',
      L: 'ה',
      GD: 'הפרש',
      Pts: 'נק',
      'No standings found': 'לא נמצאה טבלה',
      Predict: 'נחש',
      Leaderboard: 'טבלת חברים',
      'View all': 'הצג הכל',
      'Show less': 'הצג פחות',

    },
    leagueOverview: {
      'Primary league': 'ליגה ראשית',
      
      USER: 'משתמש',
      POINTS: 'נקודות',
      'of {{count}} players': 'מתוך {{count}} שחקנים',


      Table: 'טבלה',
      'Top leaderboard': 'מובילי הטבלה',
      
      'Today matches': 'משחקי היום',
      'No matches today': 'אין משחקים היום',
    },
    notifications: {
      Notifications: 'התראות',
      'No notifications yet': 'אין התראות עדיין',
      'Match starts soon': 'המשחק מתחיל בקרוב',
      'match-reminder-body': '{{home}} נגד {{away}} מתחיל בקרוב, הכנס ניחוש למשחק',
    },
    aiAnalysis: {
      'AI analysis is not available': 'ניתוח ה־AI אינו זמין',
      'There is not enough reliable match data to show a prediction yet.':
        'עדיין אין מספיק נתוני משחק אמינים כדי להציג תחזית.',
      'Updated {{date}}': 'עודכן {{date}}',
      'AI-generated analysis for entertainment only. It may be inaccurate and is not betting advice.':
        'הניתוח נוצר באמצעות AI ומיועד לבידור בלבד. הוא עלול להיות שגוי ואינו מהווה ייעוץ להימורים.',
      'AI prediction: {{home}} {{homeScore}}, {{away}} {{awayScore}}':
        'תחזית AI: {{home}} {{homeScore}}, {{away}} {{awayScore}}',
    },
    activeUi: {
      'An email has been sent to your email address with a link to reset your password.': 'נשלח אליך אימייל עם קישור לאיפוס הסיסמה.',
      Away: 'חוץ',
      'Away score': 'תוצאת קבוצת החוץ',
      'Choose {{count}} active leagues': 'בחירת {{count}} ליגות פעילות',
      'Confirm Password': 'אימות סיסמה',
      Consistent: 'עקבי',
      'Edit league': 'עריכת ליגה',
      'Edit nickname': 'עריכת כינוי',
      Enabled: 'פעיל',
      'Checking...': 'בודק...',
      Blocked: 'חסום',
      'Not requested': 'טרם התבקשה הרשאה',
      Unavailable: 'לא זמין',
      'Match reminders': 'תזכורות למשחקים',
      'Never miss a prediction': 'לא מפספסים ניחוש',
      'Get a reminder one hour before upcoming matches so you have time to enter your prediction. Notifications are optional and can be changed at any time.':
        'קבלו תזכורת שעה לפני משחקים קרובים, כדי שיישאר לכם זמן להזין ניחוש. ההתראות אינן חובה וניתן לשנות את ההרשאה בכל עת.',
      'Not now': 'לא עכשיו',
      'Enable reminders': 'הפעלת תזכורות',
      'Notifications enabled': 'ההתראות הופעלו',
      'Match reminders will be scheduled for upcoming matches.': 'תזכורות יתוזמנו עבור המשחקים הקרובים.',
      'Notifications are enabled. You can change this permission in device settings.':
        'ההתראות פעילות. ניתן לשנות את ההרשאה בהגדרות המכשיר.',
      'Enable notifications from your device settings to receive match reminders.':
        'כדי לקבל תזכורות למשחקים, יש להפעיל התראות בהגדרות המכשיר.',
      'Open Settings': 'פתיחת הגדרות',
      'Unable to open device settings.': 'לא ניתן לפתוח את הגדרות המכשיר.',
      'Unable to update notification permission. Please try again.':
        'לא ניתן לעדכן את הרשאת ההתראות. נסו שוב.',
      'Notifications are unavailable on this device.': 'התראות אינן זמינות במכשיר הזה.',
      'Enter your email address': 'הזנת כתובת אימייל',
      "Enter your email address and we'll send you a reset link": 'הזינו את כתובת האימייל ונשלח אליכם קישור לאיפוס',
      'Enter your new password': 'הזנת הסיסמה החדשה',
      'Enter your password securely': 'הזנת הסיסמה באופן מאובטח',
      'Failed to update password. Please try again.': 'עדכון הסיסמה נכשל. נסו שוב.',
      General: 'כללי',
      Home: 'בית',
      'Home score': 'תוצאת קבוצת הבית',
      'Join my {{area}} league "{{name}}"! Use code: {{join_code}} Download the app to join!': 'הצטרפו לליגת {{area}} שלי "{{name}}"! השתמשו בקוד: {{join_code}} הורידו את האפליקציה כדי להצטרף!',
      'Join {{name}} League': 'הצטרפות לליגה {{name}}',
      'Manage Subscription': 'ניהול המינוי',
      'Member not found': 'החבר לא נמצא',
      'My Leagues': 'הליגות שלי',
      'No leagues yet': 'אין עדיין ליגות',
      'No matches found': 'לא נמצאו משחקים',
      'No predictions': 'אין ניחושים',
      Notification: 'התראות',
      'Other Leagues': 'ליגות נוספות',
      'Password Updated': 'הסיסמה עודכנה',
      'Please request a new link.': 'בקשו קישור חדש.',
      Predictor: 'מנחש מצטיין',
      Preferences: 'העדפות',
      'Primary League': 'ליגה ראשית',
      'Reached top 10 in the table': 'הגעת לעשירייה הראשונה בטבלה',
      'Resend New Link': 'שליחת קישור חדש',
      'Reset link is invalid or expired.': 'קישור האיפוס אינו תקין או שפג תוקפו.',
      'Save New Password': 'שמירת סיסמה חדשה',
      'Subscription status may be outdated while offline.': 'ייתכן שסטטוס המינוי אינו מעודכן במצב לא מקוון.',
      'This league is full. Upgrade to create larger leagues.': 'הליגה מלאה. שדרגו כדי ליצור ליגות גדולות יותר.',
      'Top 10': 'עשירייה ראשונה',
      'Upgrade to create more leagues and unlock more competitions.': 'שדרגו כדי ליצור ליגות נוספות ולפתוח תחרויות נוספות.',
      'Your PRO subscription is active.': 'מינוי ה־PRO שלכם פעיל.',
      'Your achievements': 'ההישגים שלך',
      'Your password has been changed successfully.': 'הסיסמה שונתה בהצלחה.',
      button: 'כפתור',
      '{{count}} correct predictions': '{{count}} ניחושים נכונים',
      '{{count}} matches played': '{{count}} משחקים שוחקו',
      'Code resent successfully!': 'הקוד נשלח מחדש בהצלחה!',
      'Back to Sign In': 'חזרה לכניסה',
      'Change email address': 'שינוי כתובת האימייל',
      'Confirm and continue': 'אימות והמשך',
      "Didn't receive the code?": 'לא קיבלתם את הקוד?',
      'Email address is missing. Please try signing up again.': 'כתובת האימייל חסרה. נסו להירשם מחדש.',
      'Email verified successfully!': 'האימייל אומת בהצלחה!',
      'Enter the code': 'הקלידו את הקוד',
      'Enter the code to finish creating your account.': 'הקלידו את הקוד כדי להשלים את יצירת החשבון.',
      'Forgot your password?': 'שכחתם את הסיסמה?',
      'Get back in the game': 'חוזרים למשחק',
      'If an account exists for this email, a reset link will arrive shortly.':
        'אם קיים חשבון עבור כתובת האימייל הזו, קישור לאיפוס יגיע בקרוב.',
      'If an account exists for this email, the link may take a few minutes to arrive.':
        'אם קיים חשבון עבור כתובת האימייל הזו, הקישור עשוי להגיע תוך כמה דקות.',
      'Error Details (Dev Only):': 'פרטי שגיאה (פיתוח בלבד):',
      'Football Prediction': 'ניחושי כדורגל',
      'Go Home': 'חזרה לבית',
      'No internet connection. Some features may not work.': 'אין חיבור לאינטרנט. ייתכן שחלק מהתכונות לא יעבדו.',
      'Predict. Compete. Win.': 'מנחשים. מתחרים. מנצחים.',
      'Resend Code': 'שליחת הקוד מחדש',
      'Resend in {{count}}s': 'שליחה מחדש בעוד {{count}} שניות',
      'Sending...': 'שולח...',
      'Secure your predictions': 'שומרים על הניחושים שלכם',
      'Still need help?': 'עדיין צריכים עזרה?',
      'Contact support': 'פנייה לתמיכה',
      'Something went wrong': 'משהו השתבש',
      'Try Again': 'ניסיון נוסף',
      'Verify Email': 'אימות אימייל',
      'The code is single-use and expires shortly.': 'הקוד מיועד לשימוש חד־פעמי ותוקפו יפוג בקרוב.',
      "We encountered an unexpected error. Don't worry, your data is safe.": 'אירעה שגיאה בלתי צפויה. הנתונים שלכם שמורים.',
      'Your other leagues and data will remain saved.': 'הליגות והנתונים האחרים שלכם יישארו שמורים.',
      'Your subscription has ended. Choose the leagues you want to keep active.': 'המינוי שלכם הסתיים. בחרו את הליגות שיישארו פעילות.',
      'Are you sure you want to delete {{name}}? This action cannot be undone.': 'האם למחוק את {{name}}? לא ניתן לבטל פעולה זו.',
      'Are you sure you want to remove {{name}}?': 'האם להסיר את {{name}}?',
      'Delete user': 'מחיקת משתמש',
      Display: 'תצוגה',
      'Failed to delete user: {{message}}': 'מחיקת המשתמש נכשלה: {{message}}',
      'ID: {{id}}': 'מזהה: {{id}}',
      No: 'לא',
      'No email': 'אין אימייל',
      'No users found': 'לא נמצאו משתמשים',
      'No users found matching your search': 'לא נמצאו משתמשים התואמים לחיפוש',
      Predictions: 'ניחושים',
      'Showing {{count}} competitions.': 'מוצגות {{count}} תחרויות.',
      'Showing {{count}} league members.': 'מוצגים {{count}} חברי ליגה.',
      'Showing {{count}} leagues.': 'מוצגות {{count}} ליגות.',
      'Showing {{count}} recent predictions (latest 200 records).': 'מוצגים {{count}} ניחושים אחרונים (עד 200 רשומות).',
      Yes: 'כן',
      'this user': 'משתמש זה',
      '{{count}} users found': 'נמצאו {{count}} משתמשים',
      points: 'נקודות',
      pts: 'נק׳',
      '{{name}}, position {{position}}, {{points}} points': '{{name}}, מקום {{position}}, {{points}} נקודות',
      'Toggle menu': 'פתיחת התפריט',
      'My leagues': 'הליגות שלי',
      'Verification code digit {{number}}': 'ספרה {{number}} בקוד האימות',
      'Enter a single digit': 'הזינו ספרה אחת',
      'Resend verification code': 'שליחה מחדש של קוד האימות',
      'Resend the verification code to your email': 'שליחת קוד האימות מחדש לאימייל',
      '6 Members': '6 חברים',
      '12 Members': '12 חברים',
      Close: 'סגירה',
      'Loading card': 'הכרטיס נטען',
      'Loading match': 'המשחק נטען',
      'Loading match details': 'פרטי המשחק נטענים',
      'Longest streak': 'הרצף הארוך ביותר',
      'Member statistics': 'סטטיסטיקות חבר',
      'Prediction statistics': 'סטטיסטיקות ניחושים',
    },
  },
};

// Flatten the nested structure for backward compatibility
export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: flattenTranslations(translationsByFeature.en),
  he: flattenTranslations(translationsByFeature.he),
};
