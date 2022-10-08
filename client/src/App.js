import "./App.css";
import ResponsiveAppBar from "./Components/ResponsiveAppBar";
import Carousel from "./Components/Carousel";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import {useState, useEffect} from 'react';
import { Test } from './Components/Test'

function App() {



  // // added this for testing
  // // start of test
  const [initialState, setState] = useState([])

  const url = '/api'

  useEffect(()=> {
    fetch(url).then(response => {
      if(response.status === 200){
        return response.json()
      }
    }).then(data => setState(data))
  }, [])
  // // end of test


  return (
    <>
    {/* testing start */}
    <div className="App">
      <header>
        <Test data={initialState}/>
      </header>
    </div>
      {/* testing end */}
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
    </>
  );
}

export default App;
