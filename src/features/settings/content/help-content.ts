export const SUPPORT_EMAIL = "support@champoapp.com";
export const FOOTBALL_DATA_URL = "https://www.football-data.org/";

export const helpContent = [
    {
        title: "Getting Started",
        items: [
            {
                question: "How do I create an account?",
                answer:
                    "You can sign in with Google or Apple, or you can sign up using your email address and password. After creating your account, verify your email address to get started.",
            },
            {
                question: "How do I join a league?",
                answer:
                    'On the "My Leagues" screen, tap "Create League" to create a new league, or tap "Join League" to join an existing league using the league code.',
            },
            {
                question: "What is a league?",
                answer:
                    "A league is a group where you compete with other users by making predictions on football matches. Each league tracks points and rankings.",
            },
        ],
    },
    {
        title: "Making Predictions",
        items: [
            {
                question: "How do I make a prediction?",
                answer:
                    'Go to the "Matches" tab, select a match, and enter your predicted score for both teams. You can update your prediction until the match starts.',
            },
            {
                question: "When can I make predictions?",
                answer:
                    "You can make or update predictions anytime before a match kicks off. Once the match starts, predictions are locked and cannot be changed.",
            },
            {
                question: "How are points calculated?",
                answer:
                    "An exact score is worth 5 points, a correct result is worth 3 points, and an incorrect prediction is worth 0 points.",
            },
        ],
    },
    {
        title: "Leagues & Rankings",
        items: [
            {
                question: "How do I create my own league?",
                answer:
                    'Tap the "+" button in "My Leagues", select "Create League", choose a competition, and invite friends using the league code.',
            },
            {
                question: "How do I view the leaderboard?",
                answer:
                    "On the Leaderboard screen you can see members' points rankings, and you can also see the world ranking.",
            },
            {
                question: "Can I leave a league?",
                answer:
                    "Yes, you can leave a league at any time from the league details screen. Note that your predictions and points will remain in the league history.",
            },
        ],
    },
    {
        title: "Matches & Fixtures",
        items: [
            {
                question: "How do I view upcoming matches?",
                answer: "On the League screen you can see today's matches.",
            },
            {
                question: "What match information is available?",
                answer: "For each match, you can see the match results.",
            },
            {
                question: "How often are match results updated?",
                answer: "Match results are updated every 5 minutes.",
            },
        ],
    },
    {
        title: "Account & Settings",
        items: [
            {
                question: "How do I change my password?",
                answer:
                    "If you signed up with email, go to Settings and use the password reset option. You will receive a reset link via email.",
            },
            {
                question: "Can I change my email address?",
                answer:
                    "Email addresses cannot be changed from within the app. Please contact support if you need to update your email address.",
            },
            {
                question: "How do I manage notifications?",
                answer:
                    "Open Settings and tap Match reminders. Champo explains how reminders work before requesting permission. You can change permission later in your device settings.",
            },
        ],
    },
    {
        title: "Subscription & Premium",
        items: [
            {
                question: "What are the subscription benefits?",
                answer:
                    "Champo Pro unlocks all 6 competitions, up to 5 active friend leagues, up to 12 members per league, and full AI match analysis.",
            },
            {
                question: "How do I subscribe?",
                answer:
                    "Open Settings, tap Subscription, and choose Upgrade to purchase the Champo Pro Season Pass.",
            },
            {
                question: "How do I cancel my subscription?",
                answer:
                    "Champo Pro is a one-time Season Pass and does not renew automatically, so there is nothing to cancel.",
            },
        ],
    },
] as const;
