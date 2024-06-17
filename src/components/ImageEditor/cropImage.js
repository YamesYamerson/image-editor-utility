export const getCroppedImg = (imageSrc, crop) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const { width, height } = crop;
    canvas.width = width;
    canvas.height = height;
  
    return new Promise((resolve) => {
      image.onload = () => {
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );
  
        resolve(canvas.toDataURL('image/jpeg'));
      };
    });
  };
  
  export default getCroppedImg;
  