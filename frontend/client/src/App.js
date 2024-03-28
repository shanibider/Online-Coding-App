// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlock from './components/CodeBlock';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css'



const App = () => {
  return (
    <Router> 
    <Routes> 
    
        <Route path="/" element={<Lobby/>} />
        <Route path="/code/:id" element={<CodeBlock/>} />
    </Routes>
    </Router> 
  );
};

export default App;