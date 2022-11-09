import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Logo from '../images/logo_black.png';
import LogoBack from '../images/back_button.png';
import { Link } from 'react-router-dom';

const pages = [];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position='static' sx={{ backgroundColor: '#000' }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>

          <Box sx={{ display: { xs: 'none', md: 'flex' },  padding: 1 }}>
            <Link to='/'>
              <img
                src={Logo}
                alt='PIANOES'
                className='btn-logo'
                style={{
                  width: '80px',
                }}
              />
            </Link>            
          </Box>


          <Box sx={{ display: { xs: 'none', md: 'flex' },  padding: 1}}>
            <Link to='/'>
              <img
                src={LogoBack}
                alt='BACK'
                className='btn-logo'
                style={{
                  width: '80px',
                }}
              />
            </Link>            
          </Box>


          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {pages.length > 0 && (
              <IconButton
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleOpenNavMenu}
                color='inherit'
              >
                <MenuIcon />
              </IconButton>
            )}
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign='center'>{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <Link to='/' style={{ display: 'flex' }}>
              <img
                src={Logo}
                alt='PIANOES'
                className='nav--logo'
                style={{
                  width: '50px',
                }}
              />
            </Link>
          </Box>
          <Typography
            variant='h5'
            noWrap
            component='a'
            href=''
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Tw Cen MT',
              fontWeight: 200,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PIANOES
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
