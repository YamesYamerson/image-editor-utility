// DalleInputWindow.js
import React, { useState } from "react";

const DalleInputWindow = ({ generateImage, loading }) => {
  const [prompt, setPrompt] = useState("");

  const handleGenerateClick = () => {
    generateImage(prompt);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Enter prompt for image generation"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="form-control mb-2"
      />
      <button className="btn btn-primary" onClick={handleGenerateClick} disabled={loading}>
        {loading ? "Generating..." : "Generate Image"}
      </button>
    </div>
  );
};

export default DalleInputWindow;
