import React from 'react';
import pianoesLogo from '../images/logo_black.png';
import backButton from '../images/back_button.png';

import { Link } from 'react-router-dom';
import { AppBar, Stack } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position='static' sx={{ backgroundColor: '#000' }}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
      >
        <Link to='/' style={{ padding: '5px', display: 'flex' }}>
          <img src={pianoesLogo} alt='Pianoes' className='nav--logo' />
        </Link>

        <Link to='/' style={{ padding: '5px', display: 'flex' }}>
          <img src={backButton} alt='Back' className='nav--logo' />
        </Link>
      </Stack>
    </AppBar>
  );
}
