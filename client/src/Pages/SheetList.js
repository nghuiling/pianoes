import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Carousel from '../Components/Carousel';
import { get } from '../Adapters/base';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import imgAmazon from '../images/pic_amazon.png';
import imgMountain from '../images/pic_mountain.png';
import imgWater from '../images/pic_water.png';

const images = [imgAmazon, imgMountain, imgWater];

const SlideCard = (song) => {
  return (
    <Link to={`/sheet/${song.music_id}`} key={song.music_id}>
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          margin: 'auto',
          display: 'flex',
          '&:hover': {
            transform: 'scale(110%)',
          },
        }}
      >
        <img
          src={images[song.music_id % images.length]}
          alt='sample'
          className='btn-logo'
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyItems: 'center',
          }}
        >
          <Typography
            sx={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              p: 0,
            }}
          >
            {song.music_title}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default function MusicSelect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    get('/api/music')
      .then((data) => {
        setPieces(data.map(SlideCard));
      })
      .catch(console.log('sheet load error'));
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
