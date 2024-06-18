import React from 'react';
import ImageEditor from './components/ImageEditor/ImageEditor';
import Navbar from './components/Navbar/Navbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container mt-0">
        <ImageEditor />
      </div>
    </div>
  );
}

export default App;
