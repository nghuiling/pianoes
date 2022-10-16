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
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  margin: 'auto',
                  display: 'flex',
                }}
              >
                <img
                  src={images[index % images.length]}
                  alt='sample'
                  className='btn-logo'
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Box sx={{ position: 'absolute' }}>Sheet {index + 1}</Box>
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
