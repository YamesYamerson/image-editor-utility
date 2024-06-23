import React, { useState } from "react";
import axios from "axios";

const DalleInputWindow = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    try {
      const apiKey = import.meta.env.VITE_DALLE_SECRET_KEY;
      if (!apiKey) {
        throw new Error("API key is missing");
      }
      if (!prompt.trim()) {
        throw new Error("Prompt is empty");
      }

      setLoading(true);

      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      console.log("API Response:", response);
      setGeneratedImage(response.data.data[0].url);
    } catch (error) {
      console.error("Error generating image:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      alert(`Error generating image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center mt-4">
      <h1>DALL-E Image Generator</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter prompt for image generation"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="form-control mb-2"
        />
        <button className="btn btn-primary" onClick={generateImage} disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {generatedImage && (
        <div className="mt-4">
          <img src={generatedImage} alt="Generated" className="img-fluid" />
        </div>
      )}
    </div>
  );
};

export default DalleInputWindow;
