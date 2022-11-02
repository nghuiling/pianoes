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
const sampleData = [
  {
    id: 1,
    title: 'Spirit Duet',
    file: 'spirit_duet.mid',
    imgSrc: imgAmazon,
  },
  {
    id: 2,
    title: 'To Zanarkand',
    file: 'to_zanarkand.mid',
    imgSrc: imgMountain,
  },
  {
    id: 3,
    title: 'Croation Rhapsody',
    file: 'croation_rhapsody.mid',
    imgSrc: imgWater,
  },
  {
    id: 4,
    title: 'The Entertainer',
    file: 'the_entertainer.mid',
    imgSrc: imgAmazon,
  },
  {
    id: 5,
    title: 'Waltz of Chihiro',
    file: 'waltz_of_chihiro.mid',
    imgSrc: imgMountain,
  },
  {
    id: 6,
    title: 'Kiss the Rain',
    file: 'kiss_the_rain.mid',
    imgSrc: imgWater,
  },
  {
    id: 7,
    title: 'Moonlight Sonata No. 14',
    file: 'moonlight_sonata_no_14.mid',
    imgSrc: imgAmazon,
  },
];

const SlideCard = (song) => {
  return (
    <Link to='/sheet/id' key={song.id}>
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
          src={song.imgSrc}
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
            {song.title}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default function MusicSelect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    get('path/to/get/music')
      .then((data) => {
        setPieces(data.map(SlideCard));
      })
      .catch(setPieces(sampleData.map(SlideCard)));
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
