import { useState, useRef } from 'react'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import AffirmationCard from './AffirmationCard'

const ZONES = [
  { label: '🟢🟢🟢', color: '#43a047' },
  { label: '🟡🟡🟡', color: '#fdd835' },
  { label: '🟠🟠🟠', color: '#fb8c00' },
  { label: '🔴🔴🔴', color: '#e53935' },
  { label: '🚨🚨🚨', color: '#b71c1c' },
]

const getZoneEmoji = (score) => {
  if (score <= 20) return '🟢'
  if (score <= 40) return '🟡'
  if (score <= 60) return '🟠'
  if (score <= 80) return '🔴'
  return '🚨'
}

function RankingList({ affirmations, cardScores, onScoreChange, onAllRated, surfacePct = 0, children }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const LEFT_PANEL_VW = isMobile ? 42 : 20
  const SCALE_WIDTH = isMobile ? 80 : 120
  const CARD_LEFT_OFFSET = SCALE_WIDTH + 2  // always starts just past the scale box edge

  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragPos, setDragPos] = useState(null)
  const [hoverScore, setHoverScore] = useState(null)
  const scaleRef = useRef(null)

  const cards = affirmations.slice(0, 6)
  const total = cards.length
  const isDone = currentIndex >= total
  const remaining = total - currentIndex

  const getScoreFromClientY = (clientY) => {
    const rect = scaleRef.current.getBoundingClientRect()
    const y = clientY - rect.top
    const clamped = Math.max(0, Math.min(rect.height, y))
    return Math.round((clamped / rect.height) * 100)
  }

  const placeCard = (clientY) => {
    const score = getScoreFromClientY(clientY)
    onScoreChange(cards[currentIndex].id, score)
    const next = currentIndex + 1
    setCurrentIndex(next)
    setHoverScore(null)
    setDragPos(null)
    if (next >= total) onAllRated?.()
  }

  const handleCardPointerDown = (e) => {
    if (isDone) return
    e.preventDefault()
    setDragPos({ x: e.clientX, y: e.clientY })

    const onMove = (me) => {
      setDragPos({ x: me.clientX, y: me.clientY })
      // Show hover indicator once dragged into the ocean area
      if (me.clientX > window.innerWidth * (LEFT_PANEL_VW / 100)) {
        setHoverScore(getScoreFromClientY(me.clientY))
      } else {
        setHoverScore(null)
      }
    }

    const onUp = (ue) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      // Only place if dropped in the ocean (past the left panel)
      if (ue.clientX > window.innerWidth * (LEFT_PANEL_VW / 100)) {
        placeCard(ue.clientY)
      } else {
        setDragPos(null)
        setHoverScore(null)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handlePlacedCardPointerDown = (e, cardId) => {
    e.preventDefault()
    e.stopPropagation()

    const onMove = (me) => {
      if (scaleRef.current) {
        onScoreChange(cardId, getScoreFromClientY(me.clientY))
      }
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleScaleClick = (e) => {
    if (isDone || dragPos !== null) return
    placeCard(e.clientY)
  }

  const placedCards = cards.slice(0, currentIndex)

  return (
    <>
      {/* Left white panel — fixed */}
      <Box sx={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: `${LEFT_PANEL_VW}vw`,
        bgcolor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { xs: 1.5, sm: 3 },
        gap: { xs: 1, sm: 2 },
        zIndex: 10,
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        <Typography variant="caption" color="text.secondary">
          Drag each card into the cosmos and drop it at your chosen level, or <strong>click anywhere on the scale</strong> to place it. Reposition placed cards anytime. Scenarios you think should possibly be <strong>banned</strong> go below the red line.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {isDone ? 'All cards placed.' : `Card ${currentIndex + 1} of ${total}`}
        </Typography>

        {!isDone && (
          <Box sx={{ position: 'relative', mb: remaining > 1 ? 1.5 : 0 }}>
            {remaining > 2 && (
              <Box sx={{ position: 'absolute', top: 10, left: 10, right: -10, bottom: -10, bgcolor: 'grey.200', borderRadius: 2, zIndex: 0 }} />
            )}
            {remaining > 1 && (
              <Box sx={{ position: 'absolute', top: 5, left: 5, right: -5, bottom: -5, bgcolor: 'grey.300', borderRadius: 2, zIndex: 1 }} />
            )}
            <Box
              sx={{ position: 'relative', zIndex: 2, cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
              onPointerDown={handleCardPointerDown}
            >
              <AffirmationCard affirmation={cards[currentIndex]} />
            </Box>
          </Box>
        )}

        {/* Back / Submit buttons rendered by parent via children */}
        {children}
      </Box>

      {/* Scale — fixed, right edge of left panel, full viewport height */}
      <Box
        ref={scaleRef}
        onClick={handleScaleClick}
        onMouseMove={(e) => { if (!dragPos && !isDone) setHoverScore(getScoreFromClientY(e.clientY)) }}
        onMouseLeave={() => { if (!dragPos) setHoverScore(null) }}
        sx={{
          position: 'fixed',
          left: `${LEFT_PANEL_VW}vw`,
          top: `${surfacePct}%`, bottom: 0,
          width: SCALE_WIDTH,
          zIndex: 10,
          overflow: 'visible',
          cursor: isDone ? 'default' : 'pointer',
        }}
      >
        {/* Zone segments */}
        {ZONES.map((zone, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            left: 48, top: `${i * 20}%`,
            width: 24, height: '20%',
            bgcolor: zone.color,
            borderRadius: i === 0 ? '4px 4px 0 0' : i === ZONES.length - 1 ? '0 0 4px 4px' : 0,
            opacity: hoverScore !== null && Math.floor(hoverScore / 20) === i ? 1 : 0.75,
            transition: 'opacity 0.1s',
          }} />
        ))}

        {/* Zone emoji labels */}
        {ZONES.map((zone, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            left: 0, top: `${i * 20 + 10}%`,
            transform: 'translateY(-50%)',
            width: 44, textAlign: 'right',
            pointerEvents: 'none',
          }}>
            <Typography sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>{zone.label}</Typography>
          </Box>
        ))}

        {/* Ban line — between 🔴🔴🔴 and 🚨🚨🚨 (at 80% of scale) */}
        <Box sx={{
          position: 'absolute', left: 0, top: '80%',
          width: '100vw', height: 3, bgcolor: '#e53935',
          pointerEvents: 'none', zIndex: 5,
        }} />
        <Box sx={{
          position: 'absolute', right: 0, top: '80%',
          transform: 'translateY(4px)',
          pointerEvents: 'none', zIndex: 5,
        }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#e53935', fontWeight: 700, lineHeight: 1 }}>ALERT↓</Typography>
        </Box>

        {/* Hover indicator */}
        {hoverScore !== null && (
          <Box sx={{
            position: 'absolute', left: 40, top: `${hoverScore}%`,
            transform: 'translateY(-50%)', pointerEvents: 'none',
          }}>
            <Box sx={{ width: 40, height: 3, bgcolor: 'rgba(0,0,0,0.45)', borderRadius: 1 }} />
          </Box>
        )}

        {/* Placed cards */}
        {placedCards.map((card) => {
          const score = cardScores[card.id]
          return (
            <Box
              key={card.id}
              onPointerDown={(e) => handlePlacedCardPointerDown(e, card.id)}
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'absolute',
                left: CARD_LEFT_OFFSET,
                top: `${score}%`,
                transform: 'translateY(-50%)',
                width: `calc(${100 - LEFT_PANEL_VW}vw - ${CARD_LEFT_OFFSET + 8}px)`,
                zIndex: 3,
                cursor: 'grab',
                touchAction: 'none',
                '&:active': { cursor: 'grabbing' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <AffirmationCard affirmation={card} />
                <Box sx={{ position: 'absolute', top: 6, right: 6, fontSize: '1rem', lineHeight: 1, pointerEvents: 'none' }}>
                  {getZoneEmoji(score)}
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* Drag ghost */}
      {dragPos && !isDone && (
        <Box sx={{
          position: 'fixed',
          left: dragPos.x, top: dragPos.y,
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '45vw' : '28vw',
          pointerEvents: 'none',
          opacity: 0.92,
          zIndex: 9999,
          boxShadow: 6,
        }}>
          <AffirmationCard affirmation={cards[currentIndex]} />
        </Box>
      )}
    </>
  )
}

export default RankingList
