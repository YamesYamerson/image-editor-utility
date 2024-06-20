import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ImageEditor from './components/ImageEditor/ImageEditor';
import BatchIconEditor from './components/BatchIconEditor/BatchIconEditor';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-0">
          <Routes>
            <Route path="/image-editor" element={<ImageEditor />} />
            <Route path="/batch-icon-editor" element={<BatchIconEditor />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
