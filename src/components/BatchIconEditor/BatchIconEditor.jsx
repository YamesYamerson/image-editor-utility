import React, { useState } from 'react';

const BatchIconEditor = () => {
  const [sourceFolder, setSourceFolder] = useState([]);
  const [outputFolder, setOutputFolder] = useState(null);
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
    <div className="container mt-4 text-center">
      <h1 className="mb-4">Batch Icon Processor</h1>
      <p className="mb-5">
        This application is designed for creating square aspect ratio icons with transparent backgrounds.
        You can choose the dimensions of the rescale and the amount of padding to add to the images.
      </p>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="d-flex row">
            <div className="mb-4 col-8">
              <label className="form-label">Select Source Folder</label>
              <input type="file" className="form-control" multiple webkitdirectory="true" onChange={handleSourceFolderChange} />
            </div>
            <div className="form-check mb-4 col-4">
              <input type="checkbox" className="form-check-input" id="saveToOriginal" checked={saveToOriginal} onChange={() => setSaveToOriginal(!saveToOriginal)} />
              <label className="form-check-label" htmlFor="saveToOriginal">Save files to their original directories</label>
            </div>
          </div>

          <div class="d-flex row">
            <div className="mb-4 col-5">
              <label className="form-label">Enter the dimensions for rescale (width x height):</label>
              <input type="text" className="form-control" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            </div>
            <div className="mb-4 col-5">
              <label className="form-label">Enter the amount of padding to add:</label>
              <input type="text" className="form-control" value={padding} onChange={(e) => setPadding(e.target.value)} />
            </div>
            <button className="btn btn-primary mb-4 col-2" onClick={handleProcessImages}>Process Images</button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="mt-5">
          <h2 className="mb-4">Preview Processed Images</h2>
          <div className="d-flex flex-wrap justify-content-center">
            {previews.map((preview, index) => (
              <div key={index} className="p-2">
                <img src={preview} alt={`Preview ${index}`} className="img-thumbnail" />
              </div>
            ))}
          </div>
          <button className="btn btn-success mt-4" onClick={handleConfirm}>Confirm</button>
        </div>
      )}

      {showResults && (
        <div className="mt-5">
          <h2 className="mb-4">Processing Results</h2>
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
