import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import DalleInputWindow from "../DalleInputWindow/DalleInputWindow"; // Adjust the import path as necessary

const standardSizes = [
  { label: "Mobile Small (320x480)", width: 320, height: 480 },
  { label: "Mobile Medium (375x667)", width: 375, height: 667 },
  { label: "Mobile Large (414x736)", width: 414, height: 736 },
  { label: "Desktop Small (1366x768)", width: 1366, height: 768 },
  { label: "Desktop Medium (1440x900)", width: 1440, height: 900 },
  { label: "Desktop Large (1920x1080)", width: 1920, height: 1080 },
  { label: "Desktop Ultra-Wide (2560x1080)", width: 2560, height: 1080 },
  { label: "Desktop 4K (3840x2160)", width: 3840, height: 2160 },
];

const DalleImageEditor = () => {
  const [image, setImage] = useState(null);
  const [imageWidth, setImageWidth] = useState(800);
  const [imageHeight, setImageHeight] = useState(600);
  const [columnWidth, setColumnWidth] = useState(60); // percentage of the image width
  const [columnOpacity, setColumnOpacity] = useState(0.9); // opacity of the column
  const [previewImage, setPreviewImage] = useState(null);
  const [isColumnVisible, setIsColumnVisible] = useState(true); // toggle white column
  const [cropData, setCropData] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(0);
  const [isCropperVisible, setIsCropperVisible] = useState(true); // toggle cropper visibility
  const [loading, setLoading] = useState(false);
  const cropperRef = useRef(null);
  const canvasRef = useRef(null);

  const generateImage = async (prompt) => {
    try {
      const apiKey = import.meta.env.VITE_DALLE_SECRET_KEY;
      if (!apiKey) {
        throw new Error("API key is missing");
      }
      if (!prompt.trim()) {
        throw new Error("Prompt is empty");
      }
  
      setLoading(true);
  
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
  
      const data = await response.json();
      console.log("API Response:", data);
      setImage(data.data[0].url);
      setPreviewImage(data.data[0].url);
    } catch (error) {
      console.error("Error generating image:", error);
      alert(`Error generating image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
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
        const ctx = canvas.getContext("2d");

        // Draw the white column if visible
        if (isColumnVisible) {
          const columnPxWidth = (canvas.width * columnWidth) / 100;
          ctx.fillStyle = `rgba(255, 255, 255, ${columnOpacity})`;
          ctx.fillRect(
            (canvas.width - columnPxWidth) / 2,
            0,
            columnPxWidth,
            canvas.height
          );
        }

        setPreviewImage(canvas.toDataURL());
        setCropData({ width: canvas.width, height: canvas.height });
      }
    }
  };

  const downloadImage = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: imageWidth,
        height: imageHeight,
      });
      if (canvas) {
        const ctx = canvas.getContext("2d");

        // Draw the white column if visible
        if (isColumnVisible) {
          const columnPxWidth = (canvas.width * columnWidth) / 100;
          ctx.fillStyle = `rgba(255, 255, 255, ${columnOpacity})`;
          ctx.fillRect(
            (canvas.width - columnPxWidth) / 2,
            0,
            columnPxWidth,
            canvas.height
          );
        }

        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = canvas.toDataURL();
        link.click();
      }
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

  useEffect(() => {
    updatePreview();
  }, [imageWidth, imageHeight, columnWidth, columnOpacity, isColumnVisible]);

  useEffect(() => {
    const updateCropData = () => {
      const cropper = cropperRef.current?.cropper;
      if (cropper) {
        const { width, height } = cropper.getCropBoxData();
        setCropData({ width, height });
        updatePreview();
      }
    };

    if (cropperRef.current) {
      const cropper = cropperRef.current.cropper;
      cropper.on("cropmove", updateCropData);
      cropper.on("cropend", updateCropData);

      return () => {
        cropper.off("cropmove", updateCropData);
        cropper.off("cropend", updateCropData);
      };
    }
  }, []);

  useEffect(() => {
    updatePreview();
  }, [cropData]);

  useEffect(() => {
    // Initialize tooltips
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }, []);

  return (
    <div className="container text-center mt-4">
      <h1>Dalle Image Editor</h1>

      <DalleInputWindow generateImage={generateImage} loading={loading} />

      {!image && (
        <div {...getRootProps({ className: "dropzone border p-4 my-4" })}>
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
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Adjust the width of the cropping area."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
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
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Adjust the height of the cropping area."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
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
                Col. Width (%):
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Adjust the width of the white column as a percentage of the image width."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
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
                Col. Opacity:
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Adjust the opacity of the white column."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
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
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Toggle the visibility of the white column."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
              </label>
              <button
                className={`btn ${
                  isColumnVisible ? "btn-danger" : "btn-success"
                } form-control mt-0`}
                onClick={() => setIsColumnVisible(!isColumnVisible)}
              >
                {isColumnVisible ? "Hide Column" : "Show Column"}
              </button>
            </div>
          </div>
          <div className="row justify-content-center my-3">
            <div className="form-group col-3">
              <label>
                Sizes:
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Select a predefined size for the background. The size of the output image is limited by the uploaded image size."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
              </label>
              <select
                className="form-control"
                onChange={(e) =>
                  handleStandardSizeChange(JSON.parse(e.target.value))
                }
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
                <span
                  className="ms-1"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Adjust the aspect ratio of the cropping area. 16:9 is for landscape, 9:16 is for portrait, and Free is for custom sizes."
                >
                  <i className="bi bi-info-circle"></i>
                </span>
              </label>
              <div className="d-flex justify-content-around">
                <button
                  className={`btn ${
                    aspectRatio === 16 / 9 ? "btn-primary" : "btn-secondary"
                  } mx-1 mt-0 flex-fill`}
                  onClick={() => changeAspectRatio(16 / 9)}
                >
                  16:9
                </button>
                <button
                  className={`btn ${
                    aspectRatio === 9 / 16 ? "btn-primary" : "btn-secondary"
                  } mx-1 mt-0 flex-fill`}
                  onClick={() => changeAspectRatio(9 / 16)}
                >
                  9:16
                </button>
                <button
                  className={`btn ${
                    aspectRatio === 0 ? "btn-primary" : "btn-secondary"
                  } mx-1 mt-0 flex-fill`}
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
                {isCropperVisible ? "Minimize Cropper" : "Show Cropper"}
              </button>
            </div>
          </div>

          {isCropperVisible && (
            <div className="position-relative" style={{ height: 400 }}>
              <Cropper
                src={image}
                style={{ height: "100%", width: "100%" }}
                initialAspectRatio={imageWidth / imageHeight}
                aspectRatio={imageWidth / imageHeight}
                guides={true}
                cropBoxResizable={true}
                dragMode="move"
                scalable={true}
                zoomable={false} // Disable mouse wheel zoom
                ref={cropperRef}
              />
              <div
                className="position-absolute"
                style={{
                  top: "10px",
                  right: "10px",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                {`Crop Size: ${cropData.width} x ${cropData.height}`}
              </div>
            </div>
          )}
          {previewImage && (
            <div>
              <img
                src={previewImage}
                alt="Preview"
                className="img-fluid mb-4"
              />
              <p>{`Preview Size: ${cropData.width} x ${cropData.height}`}</p>
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

export default DalleImageEditor;
