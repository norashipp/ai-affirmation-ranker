import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Link,
  Divider,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
/* Optional QR code ...
   import qrCode from '../assets/qrCode.png'*/

function LandingPage() {
    // Set body background to transparent so ocean background shows through
    useEffect(() => {
      document.body.style.background = 'transparent';
      return () => {
        document.body.style.background = '';
      };
    }, []);
  const navigate = useNavigate();

  return (
    <>
      {/* Ocean background — fixed, full viewport (no fish) */}
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
      </Box>
      <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center" sx={{ background: 'transparent' }}>
      <Typography
        variant="h1"
        component="h1"
        align="center"
        color="primary.dark"
      >
        The Ethical Gradient
      </Typography>

	  {/*<Box sx={{ height: 0 }} />
	  <img src={qrCode} alt="QR Code" style={{ width: 270, height: 300 }} />
	   */}
          <Card sx={{ width: "100%", maxWidth: 600, background: 'transparent', boxShadow: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'white' }}>
              How It Works
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: 'white' }}>
		Welcome to the LLM Ethical Gradient Game! In this activity you will evaluate
		scenarios involving the use of large language models as it pertains to our department.
		Your task is to judge how concerning each situation is. Your input
		is anonymous, and we will only look at bulk histograms of the results from everyone to initiate department-wide discussions.
            </Typography>
	      <Typography variant="body1" paragraph sx={{ color: 'white' }}>
              You will receive a set of scenario cards. Drag and drop them to place
		each one on the scale from "All Good" to "Sirens Blaring". Rank each card
		generally, as we will bin them coarsely.
            </Typography>
          </CardContent>
        </Card>

	  

        <Card sx={{ width: "100%", maxWidth: 600, background: 'transparent', boxShadow: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'white' }}>
              Instructions
            </Typography>
            <Typography variant="body1" sx={{ color: 'white' }}>
              1. Click "Start Ranking" to begin
              <br />
              2. Drag scenarios into the cosmos and drop them at your chosen level, or click anywhere on the scale to place them. Reposition placed cards anytime. Scenarios you think should be <strong>banned</strong> go below the red line.
              <br />
              3. Submit when finished
            </Typography>
          </CardContent>
        </Card>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/rank-abs")}
        sx={{
          px: { xs: 5, sm: 6 },
          py: { xs: 1.5, sm: 1.5 },
          fontSize: { xs: "1rem", sm: "1.1rem" },
          minWidth: 200,
          minHeight: 48,
        }}
      >
        Start Ranking
      </Button>

      <Divider sx={{ width: "100%", maxWidth: 600 }} />

      <Card sx={{ width: "100%", maxWidth: 600, background: 'transparent', boxShadow: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'white' }}>
            About This App
          </Typography>
          <Typography variant="body1" sx={{ color: 'white' }}>
            This application was originally primarily vibe-coded using{" "}
            <Link href="https://kilo.ai/cli" target="_blank" rel="noopener">
              Kilocode
            </Link>{" "}
            (v7.0.33) and the{" "}
            <Link href="https://minimax.io/" target="_blank" rel="noopener">
              MiniMax model
            </Link>{" "}
            (MiniMax-M2.5), as well as{" "}
            <Link href="https://claude.ai/code" target="_blank" rel="noopener">
              Claude Code
            </Link>{" "}
            and{" "}
            <Link href="https://chatgpt.com/" target="_blank" rel="noopener">
              ChatGPT
            </Link>. It was subsequently adapted for department use by N. Shipp using Claude Code as an AI coding assistant.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Link
              href="https://github.com/norashipp/ai-affirmation-ranker"
              target="_blank"
              rel="noopener"
              underline="none"
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "grey.200",
                    transform: "translateY(-2px)",
                    boxShadow: 1,
                  },
                }}
              >
                <GitHubIcon sx={{ fontSize: 32, color: "text.primary" }} />
                <Typography
                  variant="body1"
                  color="text.primary"
                  fontWeight={500}
                >
                  View on GitHub
                </Typography>
              </Box>
            </Link>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ width: "100%", maxWidth: 600, background: 'transparent', boxShadow: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h2" component="h2" gutterBottom sx={{ color: 'white' }}>
            Authors
          </Typography>
          <Typography variant="body1" sx={{ color: 'white' }}>
              Morgan Fouesneau (MPIfA), Ivelina G. Momcheva (MPIfA), Sarah Burke-Spolaor (WVU/JHU), & Clara Salditt (Ludwig-Maximilian-Universität Munich)
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Adapted for department use by Nora Shipp.
          </Typography>
        </CardContent>
      </Card>

      <Link href="/admin" underline="hover" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
        View Results (Admin)
      </Link>
    </Stack>
    </>
  );
}

export default LandingPage;
