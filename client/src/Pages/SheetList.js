import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Carousel from '../Components/Carousel';
import { get } from '../Adapters/base';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import pic0 from '../images/0.jpg';
import pic1 from '../images/1.jpg';
import pic2 from '../images/2.jpg';
import pic3 from '../images/3.jpg';
import pic4 from '../images/4.jpg';
import pic5 from '../images/5.jpg';
import pic6 from '../images/6.jpg';
import pic7 from '../images/7.jpg';
import pic8 from '../images/8.jpg';
import pic9 from '../images/9.jpg';


import Hero from '../Components/Hero';

import Card from '../Components/Card';

const images = [pic0,pic1,pic2,pic3,pic4,pic5,pic6,pic7,pic8,pic9];

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
        <Hero />
      </Grid>
      <Grid item xs={12}>
        <Carousel items={pieces} />
      </Grid>
    </Grid>
  );
}
