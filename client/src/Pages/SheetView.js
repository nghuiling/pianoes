import React from 'react';
import { Grid, Typography } from '@mui/material';
import CustomStave from '../Components/CustomStave';

export default function MusicSelect() {
  const staveNotes = [
    // sample, will need to fetch notes or song from backend
    'f5/8, e5, d5, c5/16, c5, d5/8, e5, f5, f5/32, f5, f5, f5',
    'e4/4, e4, e4, d4/8, c4',
  ];
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h5' sx={{ textAlign: 'center' }}>
          Sheet Name here
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <CustomStave notes={staveNotes}></CustomStave>
      </Grid>
    </Grid>
  );
}
