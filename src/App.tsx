import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

const PASSPORT_WIDTH = 354;
const PASSPORT_HEIGHT = 472;
const PADDING = 20;

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    };
    loadModels();
  }, []);

  const handleUploadClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    } else if (croppedImage) {
      const link = document.createElement("a");
      link.href = croppedImage;
      link.download = "passport.png";
      link.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imgUrl = reader.result as string;
      setImage(imgUrl);
      await cropFace(imgUrl);
    };
    reader.readAsDataURL(file);
  };

  const cropFace = async (imgUrl: string) => {
    setIsLoading(true);
    const img = new Image();
    img.src = imgUrl;
    await new Promise((res) => (img.onload = res));

    const detections = await faceapi.detectSingleFace(img);
    if (!detections) {
      setIsLoading(false);
      alert("No face detected. Try uploading a clearer or larger image.");
      return;
    }

    const box = detections.box;
    const x = Math.max(box.x - PADDING, 0);
    const y = Math.max(box.y - PADDING, 0);
    const width = Math.min(box.width + PADDING * 2, img.width - x);
    const height = Math.min(box.height + PADDING * 2, img.height - y);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(img, x, y, width, height, 0, 0, width, height);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = PASSPORT_WIDTH;
    finalCanvas.height = PASSPORT_HEIGHT;
    const finalCtx = finalCanvas.getContext("2d")!;
    finalCtx.fillStyle = "#fff";
    finalCtx.fillRect(0, 0, PASSPORT_WIDTH, PASSPORT_HEIGHT);

    const scale = Math.min(PASSPORT_WIDTH / width, PASSPORT_HEIGHT / height);
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const dx = (PASSPORT_WIDTH - scaledWidth) / 2;
    const dy = (PASSPORT_HEIGHT - scaledHeight) / 2;

    finalCtx.drawImage(
      tempCanvas,
      0,
      0,
      width,
      height,
      dx,
      dy,
      scaledWidth,
      scaledHeight
    );

    setCroppedImage(finalCanvas.toDataURL("image/png"));
    setIsLoading(false);
  };

  return (
    <>
      <div className="img-placeholder">
        {croppedImage && <img src={croppedImage} alt="Cropped" />}
        {isLoading && <div className="overlay">Loading...</div>}
      </div>
      <div className="card">
        <button onClick={handleUploadClick}>
          {!image ? "Upload Image" : "Download"}
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>
    </>
  );
};

export default App;
