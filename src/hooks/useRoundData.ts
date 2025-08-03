import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export const useGameweekData = (leagueId: number, season: number = 2024) => {
  const [selectedRound, setSelectedRound] = useState<string>('Regular Season - 1')
  const [fixtures, setFixtures] = useState([])
  const [availableRounds, setAvailableRounds] = useState([])
  const [loading, setLoading] = useState(false)

  // Get available rounds for the league
  useEffect(() => {
    const fetchRounds = async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select('round')
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('date', { ascending: true })
      
      if (data) {
        // Get unique rounds
        const rounds = [...new Set(data.map(f => f.round))]
        setAvailableRounds(rounds as any[])
        
        // Set first round as default
        if (rounds.length > 0) {
          setSelectedRound(rounds[0])
        }
      }
    }
    
    fetchRounds()
  }, [leagueId, season])

  // Get fixtures for selected round
  useEffect(() => {
    const fetchFixtures = async () => {
      if (!selectedRound) return
      
      setLoading(true)
      
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          id,
          date,
          round,
          status_long,
          home_team_id,
          away_team_id,
          goals_home,
          goals_away,
          score_fulltime_home,
          score_fulltime_away,
          home_team:teams!fixtures_home_team_id_fkey(id, name, logo),
          away_team:teams!fixtures_away_team_id_fkey(id, name, logo),
          user_predictions!inner(
            predicted_home_score,
            predicted_away_score,
            points
          )
        `)
        .eq('league_id', leagueId)
        .eq('season', season)
        .eq('round', selectedRound)
        .order('date', { ascending: true })
      
      setFixtures(data as any[])
      setLoading(false)
    }
    
    fetchFixtures()
  }, [selectedRound, leagueId, season])

  return {
    selectedRound,
    setSelectedRound,
    fixtures,
    availableRounds,
    loading
  }
}