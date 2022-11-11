import './App.css';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';

import Navbar from './Components/Navbar';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Container
        className='fancy-bg'
        maxWidth='xl'
        sx={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Outlet />
      </Container>
    </ThemeProvider>
  );
}

export default App;
