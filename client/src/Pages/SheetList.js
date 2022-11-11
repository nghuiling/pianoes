import * as React from 'react';
import { Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
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

// import Card from '../Components/Card';

const images = [pic0, pic1, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9];

export default function MusicSelect() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    get('/api/music')
      .then((data) => {
        console.log(data);
        setPieces(data);
      })
      .catch(console.log('sheet load error'));
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Hero />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {pieces.map((song) => {
            return (
              <Grid
                item
                xs={12}
                sm={12 / 2}
                md={12 / 3}
                lg={12 / 5}
                key={song.music_id}
              >
                <Link to={`/sheet/${song.music_id}`}>
                  <Card
                    sx={{
                      border: 8,
                      borderColor: 'white',
                      position: 'relative',
                    }}
                  >
                    <CardMedia
                      component='img'
                      alt={song.music_title}
                      height='250'
                      image={images[song.music_id % images.length]}
                    />
                    <CardContent
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        margin: 'auto',
                        width: '100%',
                        padding: '0!important',
                      }}
                    >
                      <Typography
                        variant='h5'
                        component='div'
                        sx={{
                          textAlign: 'center',
                          backgroundColor: '#ffffffcc',
                          p: 1,
                        }}
                      >
                        {song.music_title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
}
