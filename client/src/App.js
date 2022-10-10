import './App.css';
import ResponsiveAppBar from './Components/ResponsiveAppBar';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Outlet, Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { Test } from './Components/Test';
import { get } from './Adapters/base';

function App() {
  // // added this for testing
  // // start of test
  // const [initialState, setState] = useState([]);

  // useEffect(() => {
  //   get().then((data) => setState(data));
  // }, []);
  // // end of test

  return (
    <>
      {/* testing start */}
      {/* <div className='App'>
        <header>
          <Test data={initialState} />
        </header>
      </div> */}
      {/* testing end */}
      <Stack
        direction='column'
        justifyContent='center'
        alignItems='center'
        sx={{ height: '100vh' }}
      >
        <ResponsiveAppBar />
        <Container
          maxWidth='lg'
          sx={{
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Outlet />
        </Container>
      </Stack>
    </>
  );
}

export default App;
