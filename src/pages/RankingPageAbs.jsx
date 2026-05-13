import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import RankingList from '../components/RankingList'
import { useAffirmations } from '../hooks/useAffirmations'
import { submitRankingResults } from '../services/resultsService'

import { useMediaQuery, useTheme } from '@mui/material'

const SURVEY_ID = 'uwastro2026'
const SURFACE_PCT = 14

const FLOAT_EMOJIS = ['🚀', '🛸', '☄️', '🌙', '🛰️', '🌟', '⭐', '🔭', '🪐']

// Fixed nebula blobs — positions, size, color, blur
const NEBULAE = [
  { left: '5%',  top: '10%', w: 230, h: 115, color: 'rgba(100,30,220,0.18)', blur: 50, rotate: -25 },
  { left: '62%', top: '18%', w: 185, h: 95,  color: 'rgba(20,80,220,0.15)',  blur: 42, rotate: 18  },
  { left: '72%', top: '50%', w: 205, h: 118, color: 'rgba(200,40,120,0.14)', blur: 55, rotate: -35 },
  { left: '18%', top: '65%', w: 265, h: 132, color: 'rgba(220,70,20,0.13)',  blur: 60, rotate: 12  },
  { left: '45%', top: '78%', w: 310, h: 148, color: 'rgba(180,20,20,0.20)',  blur: 55, rotate: -18 },
]

function rand(min, max) { return min + Math.random() * (max - min) }

function RankingPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const bhSize = isMobile ? 70 : 100
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
    Array.from({ length: 180 }, () => {
      const r = Math.random()
      const color = r < 0.62 ? '#ffffff' : r < 0.76 ? '#c8e8ff' : r < 0.88 ? '#fff8c0' : '#ffcccc'
      return { x: rand(0, 100), y: rand(0, 100), size: rand(0.8, 3.5), opacity: rand(0.3, 1), color }
    })
  , [])

  // Floating emoji — kept in upper 70% so bottom danger zone stays clear
  const floaters = useMemo(() =>
    Array.from({ length: 10 }, () => ({
      emoji: FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)],
      x: rand(2, 90),
      y: rand(3, 70),
      size: rand(18, 38),
      opacity: rand(0.5, 0.85),
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
          #020320 18%,
          #060835 42%,
          #120030 62%,
          #1e0018 78%,
          #150008 90%,
          #080002 100%)`,
      }}>
        {/* Nebulae — blurred color clouds */}
        {NEBULAE.map((n, i) => (
          <Box key={`n${i}`} sx={{
            position: 'absolute',
            left: n.left, top: n.top,
            width: n.w, height: n.h,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${n.color} 0%, transparent 70%)`,
            filter: `blur(${n.blur}px)`,
            transform: `rotate(${n.rotate}deg)`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Stars — colored by spectral type */}
        {stars.map((s, i) => (
          <Box key={`s${i}`} sx={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%',
            bgcolor: s.color,
            opacity: s.opacity,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Galaxies — fixed positions with soft glow behind */}
        {[
          { left: '4%',  top: '6%',  size: 70, opacity: 0.75 },
          { left: '68%', top: '14%', size: 58, opacity: 0.65 },
          { left: '38%', top: '44%', size: 46, opacity: 0.55 },
        ].map((g, i) => (
          <Box key={`g${i}`} sx={{ position: 'absolute', left: g.left, top: g.top, pointerEvents: 'none' }}>
            <Box sx={{
              position: 'absolute',
              width: g.size * 1.6, height: g.size * 0.8,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(200,180,255,0.25) 0%, transparent 70%)',
              filter: 'blur(12px)',
              transform: 'translate(-20%, -10%)',
            }} />
            <Box sx={{ fontSize: g.size, lineHeight: 1, opacity: g.opacity, userSelect: 'none' }}>🌌</Box>
          </Box>
        ))}

        {/* Floating emoji objects */}
        {floaters.map((obj, i) => (
          <Box key={`f${i}`} sx={{
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

        {/* === DANGER ZONE: bottom third === */}

        {/* Ominous red-orange glow rising from bottom */}
        <Box sx={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: '45%',
          background: 'linear-gradient(to top, rgba(140,10,0,0.35) 0%, rgba(80,0,20,0.15) 50%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Dark matter filament — left side */}
        <Box sx={{
          position: 'absolute', left: '8%', top: '60%',
          width: 6, height: '35%',
          background: 'linear-gradient(to bottom, transparent, rgba(120,0,180,0.5), transparent)',
          filter: 'blur(4px)',
          transform: 'rotate(12deg)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', left: '20%', top: '65%',
          width: 4, height: '28%',
          background: 'linear-gradient(to bottom, transparent, rgba(100,0,150,0.4), transparent)',
          filter: 'blur(3px)',
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
        }} />

        {/* CSS Black hole — bottom right */}
        <Box sx={{ position: 'absolute', right: `${bhSize * 0.6}px`, bottom: `${bhSize * 0.2}px` }}>
          {/* Outer diffuse glow */}
          <Box sx={{
            position: 'absolute',
            width: bhSize * 3.5, height: bhSize * 3.5,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,80,0,0.14) 0%, rgba(180,0,0,0.07) 45%, transparent 70%)',
            transform: `translate(${-bhSize * 1.75}px, ${-bhSize * 1.75}px)`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }} />
          {/* Accretion disk — outer diffuse band */}
          <Box sx={{
            position: 'absolute',
            width: bhSize * 2.8, height: bhSize * 0.45,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,120,30,0.5), rgba(255,210,80,0.8), rgba(255,120,30,0.5))',
            transform: `translate(${-bhSize * 1.4}px, ${-bhSize * 0.22}px) rotate(-22deg)`,
            filter: 'blur(5px)',
            pointerEvents: 'none',
          }} />
          {/* Event horizon */}
          <Box sx={{
            position: 'absolute',
            width: bhSize, height: bhSize,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #000000 55%, #08000a 100%)',
            transform: `translate(${-bhSize / 2}px, ${-bhSize / 2}px)`,
            boxShadow: [
              `0 0 ${bhSize * 0.3}px ${bhSize * 0.12}px rgba(255,110,20,0.7)`,
              `0 0 ${bhSize * 0.7}px ${bhSize * 0.25}px rgba(200,40,0,0.35)`,
              `0 0 ${bhSize * 1.4}px ${bhSize * 0.5}px rgba(120,0,0,0.18)`,
            ].join(', '),
            pointerEvents: 'none',
          }} />
          {/* Accretion disk — bright inner ring */}
          <Box sx={{
            position: 'absolute',
            width: bhSize * 2.0, height: bhSize * 0.28,
            borderRadius: '50%',
            border: `3px solid rgba(255,190,60,0.9)`,
            transform: `translate(${-bhSize}px, ${-bhSize * 0.14}px) rotate(-22deg)`,
            boxShadow: '0 0 14px rgba(255,150,0,0.9), 0 0 28px rgba(255,80,0,0.5)',
            pointerEvents: 'none',
          }} />
        </Box>

        {/* Second smaller dark object bottom-center — gravitational lens / dark matter clump */}
        <Box sx={{ position: 'absolute', left: '28%', bottom: `${bhSize * 0.3}px` }}>
          <Box sx={{
            width: bhSize * 0.55, height: bhSize * 0.55,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #020004 55%, transparent 100%)',
            boxShadow: [
              `0 0 ${bhSize * 0.2}px ${bhSize * 0.08}px rgba(160,0,220,0.45)`,
              `0 0 ${bhSize * 0.5}px ${bhSize * 0.2}px rgba(80,0,140,0.2)`,
            ].join(', '),
            pointerEvents: 'none',
          }} />
        </Box>
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
