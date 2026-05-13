import React, { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Grid
} from "@mui/material"
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon } from "@mui/icons-material"
//import { getSurveys } from "../services/surveyService"
import { getResultsFromFirestore, getSurveyStats } from "../services/adminService"
import { getAllAffirmations } from "../services/surveyService"

const SURVEY_ID = "uwastro2026"

// Ordered bin definitions; uncomment below for thinner bins.
/*
  const BINS = [
  { min: 0, max: 10, key: 0, color: "#28a745", label: "0-10" },
  { min: 10, max: 20, key: 0, color: "#8bc225", label: "10-20" },
  { min: 20, max: 30, key: 20, color: "#c4eb00", label: "20-30" },
  { min: 30, max: 40, key: 20, color: "#ffea07", label: "30-40" },
  { min: 40, max: 50, key: 40, color: "#ffc107", label: "40-50" },
  { min: 50, max: 60, key: 40, color: "#fc990d", label: "50-60" },
  { min: 60, max: 70, key: 60, color: "#fd7e14", label: "60-70" },
  { min: 70, max: 80, key: 60, color: "#dc3545", label: "70-80" },
  { min: 80, max: 90, key: 80, color: "#bf0013", label: "80-90" },
  { min: 90, max: 100, key: 80, color: "#8b0000", label: "90-100" },
]*/
/*COARSER BINS OPTION*/
const BINS = [
  { min: 0, max: 20, key: 0, color: "#28a745", label: "0-20" },
  { min: 20, max: 40, key: 20, color: "#ffc107", label: "20-40" },
  { min: 40, max: 60, key: 40, color: "#fd7e14", label: "40-60" },
  { min: 60, max: 80, key: 60, color: "#dc3545", label: "60-80" },
  { min: 80, max: 100, key: 80, color: "#8b0000", label: "80-100" },
]


// Helper to safely parse score
const parseScore = (score) => {
  const num = Number(score)
  return Number.isFinite(num) ? Math.min(Math.max(num, 0), 100) : null
}

// Histogram Component for each card
const ScoreHistogram = ({ cardId, text, referenceScore, scores, stats }) => {
  const { mean, stdev, count } = stats

  // Create bins from scores
  const bins = useMemo(() => {
    const binCounts = BINS.map((bin) => ({ ...bin, count: 0 }))

    scores.forEach((score) => {
      const parsedScore = parseScore(score)
      if (parsedScore === null) return

      const binIndex = BINS.findIndex((b) => parsedScore >= b.min && parsedScore < b.max)
      const idx = binIndex === -1 && parsedScore === 100 ? BINS.length - 1 : binIndex
      if (idx >= 0) binCounts[idx].count++
    })

    return binCounts
  }, [scores])

  const maxBinCount = Math.max(...bins.map((b) => b.count), 1)

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Histogram */}
        <Box sx={{ position: "relative", height: "170px", mb: 4 }}>
          {/* Bars */}
          <Box sx={{ display: "flex", height: "170px", alignItems: "flex-end", gap: "2px" }}>
            {bins.map((bin) => {
              const height = maxBinCount > 0 ? (bin.count / maxBinCount) * 100 : 0
              return (
                <Box
                  key={bin.key}
                  sx={{
                    flex: 1,
                    height: `${height}%`,
                    backgroundColor: bin.color,
                    minHeight: bin.count > 0 ? "4px" : "0px",
                    transition: "height 0.3s ease",
                  }}
                  title={`${bin.label}: ${bin.count} votes`}
                />
              )
            })}
          </Box>

          {/* X-axis labels */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.7rem",
              color: "#666",
              mt: 0.5,
            }}
          >
            {[0, 20, 40, 60, 80, 100].map((val) => (
              <span key={val}>{val}</span>
            ))}
          </Box>

          {/* Reference line for ChatGPT score */}
          {referenceScore != null && Number.isFinite(referenceScore) && (
            <Box
              sx={{
                position: "absolute",
                left: `${Math.min(Math.max(referenceScore, 0), 100)}%`,
                top: 0,
                height: "170px",
                borderLeft: "2px dashed black",
                pointerEvents: "none",
              }}
            >
              <Typography
                sx={{
                  position: "absolute",
                  top: "-18px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  backgroundColor: "white",
                  padding: "1px 4px",
                  borderRadius: "3px",
                  whiteSpace: "nowrap",
                }}
              >
                Claude
              </Typography>
            </Box>
          )}

          {/* Alert line at 80 */}
          <Box
            sx={{
              position: "absolute",
              left: "80%",
              top: 0,
              height: "170px",
              borderLeft: "2px solid black",
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={{
                position: "absolute",
                top: "-18px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.65rem",
                fontWeight: "bold",
                backgroundColor: "white",
                padding: "1px 4px",
                borderRadius: "3px",
                color: "#8b0000",
                whiteSpace: "nowrap",
              }}
            >
              Alert!
            </Typography>
          </Box>
        </Box>

        {/* Card Text */}
        <Box
          sx={{
            fontSize: "1.1rem",
            fontWeight: 500,
            mb: 1.5,
            p: 1.5,
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            borderLeft: "4px solid #1976d2",
          }}
        >
            {text}
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 5,
            fontSize: "0.95rem",
            color: "#555",
            fontFamily: "monospace",
          }}
        >
          <span>
            <strong>Votes:</strong> {count}
          </span>
          <span>
            <strong>Mean:</strong> {count > 0 ? mean.toFixed(1) : "N/A"}
          </span>
          <span>
            <strong>Stdev:</strong> {count > 1 ? stdev.toFixed(1) : "N/A"}
          </span>
        </Box>
      </CardContent>
    </Card>
  )
}

function AdminPage() {
  const navigate = useNavigate()
//Sarah removed - I think we need affirmations not surveys here  const surveys = getSurveys()
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({ totalVotes: 0, uniqueSessions: 0 })
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("mean")

  // Get affirmations from surveyService
  const affirmations = useMemo(() => getAllAffirmations(), [])

  // Helper to get affirmation by ID
  const getAffirmationById = (id) => {
    const numId = parseInt(id)
    return affirmations.find((a) => a.id === numId) || null
  }
  //Sarah // Get the survey data to access card text and reference scores
  //Sarah const survey = useMemo(() => {
  //Sarah   return surveys.find((s) => s.id === SURVEY_ID) || null
  //Sarah }, [surveys])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resultsData, statsData] = await Promise.all([
        getResultsFromFirestore(SURVEY_ID),
        getSurveyStats(SURVEY_ID),
      ])
      setResults(resultsData)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Process results into per-card statistics
  const cardStats = useMemo(() => {
    if (!results || results.length === 0) return []

    // Collect all scores by card ID
    const scoresByCard = {}

    results.forEach((result) => {
      if (!result.scores || !Array.isArray(result.scores)) return

      result.scores.forEach((scoreEntry) => {
        const cardId = scoreEntry.id
        const score = parseScore(scoreEntry.playerScore)

        if (cardId == null || score === null) return

        if (!scoresByCard[cardId]) {
          scoresByCard[cardId] = []
        }
        scoresByCard[cardId].push(score)
      })
    })

    // Calculate stats for each card
    return Object.entries(scoresByCard).map(([cardId, scores]) => {
      const count = scores.length
      let mean = 0
      let stdev = 0

      if (count > 0) {
        mean = scores.reduce((sum, s) => sum + s, 0) / count

        if (count > 1) {
          const variance =
            scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (count - 1)
          stdev = Math.sqrt(variance)
        }
      }

      // Get card text and reference score from survey data
      const affirmation = getAffirmationById(cardId)
      //const cardData = survey?.affirmations?.find((a) => a.id === parseInt(cardId)) || {}

      return {
        cardId: parseInt(cardId),
        text: affirmation?.text || `Unknown affirmation #${cardId}`,
        referenceScore: affirmation?.score ?? null,
	  //SARAH IM NOT SURE ABOUT THE ABOVE LINE - WANT ACTUAL SCORE NOT REFERENCE SCORE!
        //text: cardData.text || `Card #${cardId}`,
        //referenceScore: cardData.score || null, // Assuming 'score' is the reference score in affirmations
        scores,
        stats: { mean, stdev, count },
      }
    })
  }, [results, affirmations])

  // Sort cards based on selected criteria
  const sortedCardStats = useMemo(() => {
    const sorted = [...cardStats]

    if (sortBy === "mean") {
      sorted.sort((a, b) => b.stats.mean - a.stats.mean)
    } else if (sortBy === "stdev") {
      sorted.sort((a, b) => b.stats.stdev - a.stats.stdev)
    } else if (sortBy === "id") {
      sorted.sort((a, b) => a.cardId - b.cardId)
    }

    return sorted
  }, [cardStats, sortBy])

  // Export CSV function
  const exportCSV = () => {
    if (!results || results.length === 0) return

    const allIds = [...new Set(results.flatMap((r) => (r.scores || []).map((s) => s.id)))].sort(
      (a, b) => a - b
    )
    const headers = ["timestamp", "surveyId", "sessionId", "duration_s", ...allIds.map((id) => `card_${id}`)]
    const rows = results.map((result) => {
      const scoreMap = Object.fromEntries((result.scores || []).map((s) => [s.id, s.playerScore]))
      return [
        result.timestamp || "",
        result.surveyId || "Default",
        result.sessionId || "",
        result.duration ? Math.round(result.duration / 1000) : "",
        ...allIds.map((id) => scoreMap[id] ?? ""),
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `nanorank-results-${SURVEY_ID}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Results Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                  Total Sessions: {stats.totalVotes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
	  {/*        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unique Sessions
              </Typography>
              <Typography variant="h3" color="secondary">
                {stats.uniqueSessions}
              </Typography>
            </CardContent>
          </Card>
          </Grid>
	   */}
      </Grid>

      {/* Display By Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Display by...</InputLabel>
              <Select
                value={sortBy}
                label="Display by..."
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="mean">Mean Score (Highest First)</MenuItem>
                <MenuItem value="stdev">Standard Deviation (Highest First)</MenuItem>
                <MenuItem value="id">Card ID (Ascending)</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportCSV}
              disabled={loading || results.length === 0}
            >
              Export CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Histograms */}
      <Typography variant="h6" gutterBottom>
        Card Results ({sortedCardStats.length} cards)
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : sortedCardStats.length === 0 ? (
        <Typography color="textSecondary" sx={{ py: 4, textAlign: "center" }}>
          No results found for this survey.
        </Typography>
      ) : (
        sortedCardStats.map(({ cardId, text, referenceScore, scores, stats }) => (
          <ScoreHistogram
            key={cardId}
            cardId={cardId}
            text={text}
            referenceScore={referenceScore}
            scores={scores}
            stats={stats}
          />
        ))
      )}

      {/* Legend */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Score Legend
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {BINS.map((bin) => (
              <Box key={bin.key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: bin.color,
                    borderRadius: "3px",
                  }}
                />
                <Typography variant="body2">{bin.label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Back Button */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
        >
          Back to Landing Page
        </Button>
      </Box>
    </Box>
  )
}

export default AdminPage
