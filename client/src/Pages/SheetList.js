import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Carousel from '../Components/Carousel';
import { get } from '../Adapters/base';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MusicSelect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    get('path/to/get/music')
      .then((data) => {
        setPieces(data);
      })
      .catch(
        setPieces(
          Array.from({ length: 1000 }).map((el, index) => (
            <Link to='/sheet/id'>
              <Box sx={{ height: 100, width: 100, margin: 'auto' }}>
                Sheet ${index + 1}
              </Box>
            </Link>
          ))
        )
      );
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h5' sx={{ textAlign: 'center' }}>
          Select a sheet music to play
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Carousel items={pieces} />
      </Grid>
    </Grid>
  );
}
