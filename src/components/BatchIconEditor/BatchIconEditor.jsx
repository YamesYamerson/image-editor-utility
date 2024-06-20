import React, { useState } from 'react';

const BatchIconEditor = () => {
  const [sourceFolder, setSourceFolder] = useState([]);
  const [outputFolder, setOutputFolder] = useState('');
  const [saveToOriginal, setSaveToOriginal] = useState(false);
  const [dimensions, setDimensions] = useState('200x200');
  const [padding, setPadding] = useState('25');
  const [previews, setPreviews] = useState([]);
  const [alteredImages, setAlteredImages] = useState([]);
  const [unalteredImages, setUnalteredImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSourceFolderChange = (event) => {
    setSourceFolder(event.target.files);
  };

  const handleOutputFolderChange = (event) => {
    setOutputFolder(event.target.value);
  };

  const handleProcessImages = () => {
    const processedImages = [];
    const unprocessedImages = [];

    Array.from(sourceFolder).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const [width, height] = dimensions.split('x').map(Number);
          const paddingValue = parseInt(padding);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = width;
          canvas.height = height;

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, paddingValue, paddingValue, width - 2 * paddingValue, height - 2 * paddingValue);

          const finalImg = canvas.toDataURL('image/png');
          processedImages.push({ src: finalImg, fileName: file.name });
          setPreviews((prevPreviews) => [...prevPreviews, finalImg]);
        };
      };
      reader.readAsDataURL(file);
    });

    setAlteredImages(processedImages);
    setUnalteredImages(unprocessedImages);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    setShowPreview(false);
    setShowResults(true);
  };

  const handleSave = () => {
    alteredImages.forEach((image) => {
      const link = document.createElement('a');
      link.href = image.src;
      link.download = image.fileName.replace('.', '-sm.');
      link.click();
    });
  };

  return (
    <div className="container mt-5">
      <h1>Batch Icon Processor</h1>
      <p>
        This application is designed for creating square aspect ratio icons with transparent backgrounds.
        You can choose the dimensions of the rescale and the amount of padding to add to the images.
      </p>

      <div className="mb-3">
        <label className="form-label">Select Source Folder</label>
        <input type="file" className="form-control" multiple webkitdirectory="true" onChange={handleSourceFolderChange} />
      </div>

      <div className="mb-3">
        <label className="form-label">Select Output Folder</label>
        <input type="text" className="form-control" value={outputFolder} onChange={handleOutputFolderChange} placeholder="Output folder path" />
      </div>

      <div className="form-check mb-3">
        <input type="checkbox" className="form-check-input" id="saveToOriginal" checked={saveToOriginal} onChange={() => setSaveToOriginal(!saveToOriginal)} />
        <label className="form-check-label" htmlFor="saveToOriginal">Save files to their original directories</label>
      </div>

      <div className="mb-3">
        <label className="form-label">Enter the dimensions for rescale (width x height):</label>
        <input type="text" className="form-control" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Enter the amount of padding to add:</label>
        <input type="text" className="form-control" value={padding} onChange={(e) => setPadding(e.target.value)} />
      </div>

      <button className="btn btn-primary" onClick={handleProcessImages}>Process Images</button>

      {showPreview && (
        <div className="mt-5">
          <h2>Preview Processed Images</h2>
          <div className="d-flex flex-wrap">
            {previews.map((preview, index) => (
              <div key={index} className="p-2">
                <img src={preview} alt={`Preview ${index}`} className="img-thumbnail" />
              </div>
            ))}
          </div>
          <button className="btn btn-success mt-3" onClick={handleConfirm}>Confirm</button>
        </div>
      )}

      {showResults && (
        <div className="mt-5">
          <h2>Processing Results</h2>
          <div className="alert alert-info">
            <h4>Altered Images ({alteredImages.length}):</h4>
            <ul>
              {alteredImages.map((image, index) => (
                <li key={index}>{image.fileName}</li>
              ))}
            </ul>
            <h4>Unaltered Images ({unalteredImages.length}):</h4>
            <ul>
              {unalteredImages.map((image, index) => (
                <li key={index}>{image.fileName}</li>
              ))}
            </ul>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>Save Images</button>
        </div>
      )}
    </div>
  );
};

export default BatchIconEditor;
