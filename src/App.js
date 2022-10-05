import "./App.css";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import Carousel from "./components/Carousel";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

function App() {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100vh" }}
    >
      <ResponsiveAppBar />
      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ textAlign: "center" }}>
              Select a sheet music to play
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Carousel />
          </Grid>
        </Grid>
      </Container>
    </Stack>
  );
}

export default App;
