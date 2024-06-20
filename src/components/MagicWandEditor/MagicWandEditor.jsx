import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const standardSizes = [
  { label: 'Mobile Small (320x480)', width: 320, height: 480 },
  { label: 'Mobile Medium (375x667)', width: 375, height: 667 },
  { label: 'Mobile Large (414x736)', width: 414, height: 736 },
  { label: 'Desktop Small (1366x768)', width: 1366, height: 768 },
  { label: 'Desktop Medium (1440x900)', width: 1440, height: 900 },
  { label: 'Desktop Large (1920x1080)', width: 1920, height: 1080 },
  { label: 'Desktop Ultra-Wide (2560x1080)', width: 2560, height: 1080 },
  { label: 'Desktop 4K (3840x2160)', width: 3840, height: 2160 },
];

const ImageEditor = () => {
  const [image, setImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [columnWidth, setColumnWidth] = useState(60); // percentage of the image width
  const [columnOpacity, setColumnOpacity] = useState(0.9); // opacity of the column
  const [previewImage, setPreviewImage] = useState(null);
  const [tolerance, setTolerance] = useState(30); // tolerance for the magic wand tool
  const [isColumnVisible, setIsColumnVisible] = useState(true); // toggle central column
  const [aspectRatio, setAspectRatio] = useState(0);
  const [isCropperVisible, setIsCropperVisible] = useState(true); // toggle cropper visibility
  const cropperRef = useRef(null);
  const canvasRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageWidth(img.width);
        setImageHeight(img.height);
        setAspectRatio(img.width / img.height);
        setImage(e.target.result);
        setPreviewImage(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const updatePreview = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: imageWidth,
        height: imageHeight,
      });
      if (canvas) {
        const ctx = canvas.getContext('2d');
        
        if (isColumnVisible) {
          // Apply magic wand tool to the central column
          applyMagicWand(ctx, canvas, tolerance);
        }

        setPreviewImage(canvas.toDataURL());
      }
    }
  };

  const downloadImage = () => {
    const canvas = cropperRef.current.cropper.getCroppedCanvas({
      width: imageWidth,
      height: imageHeight,
    });
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleStandardSizeChange = (size) => {
    setImageWidth(size.width);
    setImageHeight(size.height);
    setAspectRatio(size.width / size.height);
  };

  const changeAspectRatio = (ratio) => {
    setAspectRatio(ratio);
    if (cropperRef.current) {
      cropperRef.current.cropper.setAspectRatio(ratio);
    }
  };

  const applyMagicWand = (ctx, canvas, tolerance) => {
    const columnPxWidth = (canvas.width * columnWidth) / 100;
    const startX = (canvas.width - columnPxWidth) / 2;
    const endX = startX + columnPxWidth;

    const imageData = ctx.getImageData(startX, 0, columnPxWidth, canvas.height);
    const data = imageData.data;
    const threshold = tolerance * 255 / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (Math.abs(r - 255) < threshold && Math.abs(g - 255) < threshold && Math.abs(b - 255) < threshold) {
        data[i + 3] = 0; // Make the pixel transparent
      }
    }

    ctx.putImageData(imageData, startX, 0);
  };

  useEffect(() => {
    updatePreview();
  }, [imageWidth, imageHeight, tolerance, columnWidth, columnOpacity, isColumnVisible]);

  useEffect(() => {
    const updateCropData = () => {
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        updatePreview();
      }
    };

    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.on('cropmove', updateCropData);
      cropper.on('cropend', updateCropData);

      return () => {
        cropper.off('cropmove', updateCropData);
        cropper.off('cropend', updateCropData);
      };
    }
  }, []);

  return (
    <div className="container text-center mt-4">
        <h1>Magic Wand Editor</h1>
      {!image && (
        <div {...getRootProps({ className: 'dropzone border p-4 my-4' })}>
          <input {...getInputProps()} />
          <p>Drag & drop an image here, or click to select one</p>
        </div>
      )}
      {image && (
        <>
          <div className="row justify-content-center my-4">
            <div className="form-group col-2">
              <label>
                Width:
              </label>
              <input
                type="number"
                className="form-control"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group col-2">
              <label>
                Height:
              </label>
              <input
                type="number"
                className="form-control"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseInt(e.target.value))}
              />
            </div>
            <div className="form-group col-2">
              <label>
                Tolerance:
              </label>
              <input
                type="number"
                className="form-control"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group col-2">
              <label>
                Column Width (%):
              </label>
              <input
                type="number"
                className="form-control"
                value={columnWidth}
                onChange={(e) => setColumnWidth(parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group col-2">
              <label>
                Column Opacity:
              </label>
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
            <div className="form-group col-2">
              <label>
                Column:
              </label>
              <button
                className={`btn ${isColumnVisible ? 'btn-danger' : 'btn-success'} form-control mt-0`}
                onClick={() => setIsColumnVisible(!isColumnVisible)}
              >
                {isColumnVisible ? 'Hide Column' : 'Show Column'}
              </button>
            </div>
          </div>
          <div className="row justify-content-center my-3">
            <div className="form-group col-3">
              <label>
                Sizes:
              </label>
              <select
                className="form-control"
                onChange={(e) => handleStandardSizeChange(JSON.parse(e.target.value))}
              >
                <option value="">Select a size</option>
                {standardSizes.map((size, index) => (
                  <option key={index} value={JSON.stringify(size)}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group col-4">
              <label>
                Aspect Ratio:
              </label>
              <div className="d-flex justify-content-around">
                <button
                  className={`btn ${aspectRatio === 16 / 9 ? 'btn-primary' : 'btn-secondary'} mx-1 mt-0 flex-fill`}
                  onClick={() => changeAspectRatio(16 / 9)}
                >
                  16:9
                </button>
                <button
                  className={`btn ${aspectRatio === 9 / 16 ? 'btn-primary' : 'btn-secondary'} mx-1 mt-0 flex-fill`}
                  onClick={() => changeAspectRatio(9 / 16)}
                >
                  9:16
                </button>
                <button
                  className={`btn ${aspectRatio === 0 ? 'btn-primary' : 'btn-secondary'} mx-1 mt-0 flex-fill`}
                  onClick={() => changeAspectRatio(0)}
                >
                  Free
                </button>
              </div>
            </div>
            <div className="form-group col-4">
              <button
                className="btn btn-secondary mt-4"
                onClick={() => setIsCropperVisible(!isCropperVisible)}
              >
                {isCropperVisible ? 'Minimize Cropper' : 'Show Cropper'}
              </button>
            </div>
          </div>
        
          {isCropperVisible && (
            <div className="position-relative" style={{ height: 400 }}>
              <Cropper
                src={image}
                style={{ height: '100%', width: '100%' }}
                initialAspectRatio={imageWidth / imageHeight}
                aspectRatio={imageWidth / imageHeight}
                guides={true}
                cropBoxResizable={true}
                dragMode="move"
                scalable={true}
                zoomable={false} // Disable mouse wheel zoom
                ref={cropperRef}
              />
            </div>
          )}
          {previewImage && (
            <div>
              <img src={previewImage} alt="Preview" className="img-fluid mb-4" />
              <p>{`Preview Size: ${imageWidth} x ${imageHeight}`}</p>
            </div>
          )}
          <canvas ref={canvasRef} className="d-none"></canvas>
          <button className="btn btn-success" onClick={downloadImage}>
            Download
          </button>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
