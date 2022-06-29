// import React, { useState, useEffect } from 'react';
import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Viz from './Viz.js';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*">
          <Route exact path="/*" element={<Viz />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
