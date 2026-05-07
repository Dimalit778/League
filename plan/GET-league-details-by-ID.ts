// Get League Details by ID
export const response = {
  status: 'success',
  response: {
    leagues: {
      id: 47,
      type: 'league',
      name: 'Premier League',
      selectedSeason: '2025/2026',
      latestSeason: '2025/2026',
      shortName: 'Premier League',
      country: 'ENG',
      gender: 'male',
      faqJSONLD: null,
      breadcrumbJSONLD: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.fotmob.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Premier League',
            item: 'https://www.fotmob.com/leagues/47/overview/premier-league',
          },
        ],
      },
      canSyncCalendar: false,
      leagueColor: '#3F1152',
      dataProvider: 'enet',
      seopath: 'premier-league',
    },
  },
};
