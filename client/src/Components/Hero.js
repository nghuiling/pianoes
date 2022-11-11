import { Box, Typography } from '@mui/material';
import React from 'react';

export default function Hero() {
  return (
    <Box>
      <Typography variant='h4' sx={{ py: 5, textAlign: 'center' }}>
        Select a sheet music to play
      </Typography>
    </Box>
  );
}
