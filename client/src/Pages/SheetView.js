import * as React from 'react';
import { Grid, Typography } from '@mui/material';

export default function MusicSelect() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h5' sx={{ textAlign: 'center' }}>
          Sheet Name here
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h5' sx={{ textAlign: 'center' }}>
          Rest of sheet
        </Typography>
      </Grid>
    </Grid>
  );
}
