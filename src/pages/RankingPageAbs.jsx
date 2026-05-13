import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import RankingList from '../components/RankingList'
import { useAffirmations } from '../hooks/useAffirmations'
import { submitRankingResults } from '../services/resultsService'

import { useMediaQuery, useTheme } from '@mui/material'

const SURVEY_ID = 'uwastro2026'
const SURFACE_PCT = 14

const SPACE_OBJECTS = ['🪐', '🚀', '🛸', '☄️', '🌙', '🛰️', '🌟', '⭐', '🔭']

function rand(min, max) { return min + Math.random() * (max - min) }

function RankingPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const bigEmojiSize = isMobile ? 80 : 130
  const { affirmations } = useAffirmations(SURVEY_ID, 6)
  const [allRated, setAllRated] = useState(false)
  const [cardScores, setCardScores] = useState(() =>
    affirmations.reduce((acc, card) => { acc[card.id] = 50; return acc }, {})
  )
  const startTimeRef = useRef(null)

  // Make body transparent so space background shows through; disable scrolling
  useEffect(() => {
    document.body.style.background = 'transparent'
    document.body.style.overflow = 'hidden'
    startTimeRef.current = Date.now()
    return () => {
      document.body.style.background = ''
      document.body.style.overflow = ''
    }
  }, [])

  const stars = useMemo(() =>
    Array.from({ length: 90 }, () => ({
      x: rand(0, 100),
      y: rand(0, 100),
      size: rand(1, 3),
      opacity: rand(0.3, 1),
    }))
  , [])

  const spaceObjects = useMemo(() =>
    Array.from({ length: 9 }, () => ({
      emoji: SPACE_OBJECTS[Math.floor(Math.random() * SPACE_OBJECTS.length)],
      x: rand(2, 90),
      y: rand(3, 92),
      size: rand(20, 45),
      opacity: rand(0.5, 0.9),
    }))
  , [])

  const handleScoreChange = (id, score) => {
    setCardScores(prev => ({ ...prev, [id]: score }))
  }

  const handleSubmit = () => {
    const duration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const rankingData = affirmations.map(card => ({ ...card, refScore: card.score, score: cardScores[card.id] }))
    submitRankingResults(rankingData, duration, SURVEY_ID)
    navigate('/success', { state: { ranking: rankingData, duration } })
  }

  return (
    <>
      {/* Space background — fixed, full viewport */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1, overflow: 'hidden',
        background: `linear-gradient(to bottom,
          #000010 0%,
          #020318 20%,
          #050830 50%,
          #0e0030 75%,
          #0a0018 100%)`,
      }}>
        {/* Stars */}
        {stars.map((s, i) => (
          <Box key={`s${i}`} sx={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            bgcolor: 'white',
            opacity: s.opacity,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Space objects */}
        {spaceObjects.map((obj, i) => (
          <Box key={`o${i}`} sx={{
            position: 'absolute',
            left: `${obj.x}%`, top: `${obj.y}%`,
            fontSize: obj.size,
            opacity: obj.opacity,
            pointerEvents: 'none',
            lineHeight: 1,
            userSelect: 'none',
          }}>
            {obj.emoji}
          </Box>
        ))}

        {/* Fixed large planet — bottom right */}
        <Box sx={{
          position: 'absolute', right: '1%', bottom: 0,
          fontSize: bigEmojiSize, lineHeight: 1,
          opacity: 0.85, pointerEvents: 'none',
          transform: 'translateY(30%)',
          userSelect: 'none',
        }}>🪐</Box>

        {/* Fixed black hole — bottom, 30% from left */}
        <Box sx={{
          position: 'absolute', left: '30%', bottom: 0,
          fontSize: bigEmojiSize, lineHeight: 1,
          opacity: 0.8, pointerEvents: 'none',
          transform: 'translateY(25%)',
          userSelect: 'none',
        }}>🌑</Box>
      </Box>

      {/* Game content */}
      <RankingList
        affirmations={affirmations}
        cardScores={cardScores}
        onScoreChange={handleScoreChange}
        onAllRated={() => setAllRated(true)}
        surfacePct={SURFACE_PCT}
      >
        <Button variant="outlined" onClick={() => navigate('/')}
          sx={{ bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
          Back
        </Button>
        {allRated && (
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </RankingList>
    </>
  )
}

export default RankingPage
