import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SheetList from './Pages/SheetList';
import SheetView from './Pages/SheetView';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route path='/' element={<SheetList />} />
        <Route path='/sheet/:id' element={<SheetView />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
