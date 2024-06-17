import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // Utility function to get cropped image data
import './ImageEditor.css';

const standardSizes = {
  mobile: [
    { label: 'Mobile Small (320x480)', width: 320, height: 480 },
    { label: 'Mobile Medium (375x667)', width: 375, height: 667 },
    { label: 'Mobile Large (414x736)', width: 414, height: 736 },
  ],
  desktop: [
    { label: 'Desktop Small (1366x768)', width: 1366, height: 768 },
    { label: 'Desktop Medium (1440x900)', width: 1440, height: 900 },
    { label: 'Desktop Large (1920x1080)', width: 1920, height: 1080 },
    { label: 'Desktop Ultra-Wide (2560x1080)', width: 2560, height: 1080 },
    { label: 'Desktop 4K (3840x2160)', width: 3840, height: 2160 },
  ],
  web: [
    { label: 'Thumbnail (150x150)', width: 150, height: 150 },
    { label: 'Banner (1200x300)', width: 1200, height: 300 },
    { label: 'Facebook Cover (820x312)', width: 820, height: 312 },
    { label: 'Instagram Post (1080x1080)', width: 1080, height: 1080 },
    { label: 'Instagram Story (1080x1920)', width: 1080, height: 1920 },
    { label: 'Twitter Post (1024x512)', width: 1024, height: 512 },
  ],
};

const ImageEditor = () => {
  const [image, setImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [columnWidth, setColumnWidth] = useState(20); // percentage of the image width
  const [columnOpacity, setColumnOpacity] = useState(0.9); // opacity of the column
  const [selectedCategory, setSelectedCategory] = useState('web');
  const [previewImage, setPreviewImage] = useState(null);
  const [isColumnVisible, setIsColumnVisible] = useState(true); // toggle white column
  const [isCropping, setIsCropping] = useState(false); // toggle cropping mode
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const canvasRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const updatePreview = () => {
    if (image && croppedAreaPixels) {
      getCroppedImg(image, croppedAreaPixels).then((croppedImg) => {
        setCroppedImage(croppedImg);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = croppedImg;
        img.onload = () => {
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

          // Draw the white column if visible
          if (isColumnVisible) {
            const columnPxWidth = (canvas.width * columnWidth) / 100;
            ctx.fillStyle = `rgba(255, 255, 255, ${columnOpacity})`;
            ctx.fillRect((canvas.width - columnPxWidth) / 2, 0, columnPxWidth, canvas.height);
          }

          setPreviewImage(canvas.toDataURL());
        };
      });
    } else if (image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

        // Draw the white column if visible
        if (isColumnVisible) {
          const columnPxWidth = (canvas.width * columnWidth) / 100;
          ctx.fillStyle = `rgba(255, 255, 255, ${columnOpacity})`;
          ctx.fillRect((canvas.width - columnPxWidth) / 2, 0, columnPxWidth, canvas.height);
        }

        setPreviewImage(canvas.toDataURL());
      };
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleStandardSizeChange = (size) => {
    setImageWidth(size.width);
    setImageHeight(size.height);
    updatePreview();
  };

  const handleCrop = () => {
    setIsCropping(true);
  };

  const handleCropComplete = async () => {
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(croppedImg);
      setPreviewImage(croppedImg);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      setIsCropping(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setPreviewImage(image);
  };

  return (
    <div className="container text-center">
      {!image && (
        <div {...getRootProps({ className: 'dropzone border p-4 my-4' })}>
          <input {...getInputProps()} />
          <p>Drag & drop an image here, or click to select one</p>
        </div>
      )}
      {image && (
        <>
          <div className="controls row my-4">
            <div className="form-group col-4">
              <label>Width:</label>
              <input
                type="number"
                className="form-control"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group col-4">
              <label>Height:</label>
              <input
                type="number"
                className="form-control"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group col-4">
              <label>Column Width (%):</label>
              <input
                type="number"
                className="form-control"
                value={columnWidth}
                onChange={(e) => setColumnWidth(parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group col-4">
              <label>Column Opacity:</label>
              <input
                type="number"
                className="form-control"
                value={columnOpacity}
                onChange={(e) => setColumnOpacity(parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="form-group col-4">
              <label>Show Column:</label>
              <button
                className={`btn ${isColumnVisible ? 'btn-danger' : 'btn-success'} form-control`}
                onClick={() => setIsColumnVisible(!isColumnVisible)}
              >
                {isColumnVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="form-group col-4">
              <label>Crop Image:</label>
              <button
                className={`btn ${isCropping ? 'btn-secondary' : 'btn-warning'} form-control`}
                onClick={handleCrop}
                disabled={isCropping}
              >
                {isCropping ? 'Cropping...' : 'Crop'}
              </button>
            </div>
            <div className="form-group col-6">
              <label>Category:</label>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
            <div className="form-group col-6">
              <label>Standard Sizes:</label>
              <select
                className="form-control"
                onChange={(e) => handleStandardSizeChange(JSON.parse(e.target.value))}
              >
                <option value="">Select a size</option>
                {standardSizes[selectedCategory].map((size, index) => (
                  <option key={index} value={JSON.stringify(size)}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary my-2" onClick={updatePreview}>
                Apply Changes
              </button>
            </div>
          </div>
          {isCropping && (
            <div className="crop-container" style={{ position: 'relative', height: '400px' }}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={imageWidth / imageHeight}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
              <button className="btn btn-success my-2" onClick={handleCropComplete}>
                Complete Crop
              </button>
              <button className="btn btn-danger my-2" onClick={handleCancelCrop}>
                Cancel Crop
              </button>
            </div>
          )}
          {!isCropping && previewImage && <img src={previewImage} alt="Preview" className="img-fluid mb-4" />}
          <canvas ref={canvasRef} className="d-none"></canvas>
          <button className="btn btn-success" onClick={downloadImage}>
            Download Edited Image
          </button>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
