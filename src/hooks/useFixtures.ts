import { supabase } from "@/lib/supabase"
import useAuthStore from "@/services/store/AuthStore"
import { useEffect, useState } from "react"

export const useFixtures = (leagueId: string) => {
    const { user } = useAuthStore()
    const [fixtures, setFixtures] = useState([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      const fetchFixtures = async () => {
        const { data } = await supabase.rpc('get_league_fixtures_with_predictions', {
          user_id: user?.id,
          league_id: leagueId,
          limit_count: 20
        })
        setFixtures(data || [])
        setLoading(false)
      }
      
      fetchFixtures()
    }, [leagueId])
    
    return { fixtures, loading }
  }