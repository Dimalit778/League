import MyLeaguesScreen from '@/features/leagues/screens/MyLeaguesScreen';
type Team = {
  name: string;
  clubColors: string;
};
const barcelona: Team = {
  name: 'FCB ',
  clubColors: 'Red / Navy Blue / Orange',
};
const getafe: Team = {
  name: 'GET',
  clubColors: 'Blue / White ',
};

export default function MyLeagues() {
  return <MyLeaguesScreen />;
  // return (
  //   <Screen>
  //     <LeftJersey teamName={barcelona.name} clubColors={barcelona.clubColors} size={250} />
  //     <LeftJersey teamName={getafe.name} clubColors={getafe.clubColors} size={250} />
  //   </Screen>
  // );
}
