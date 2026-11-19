export const AVATAR_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 mb antes de redimensionar

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image"));
    };
    img.src = url;
  });

// corta num quadrado e diminui a imagem (vira jpeg em base64)
export const resizeImageToDataUrl = async (file, size = 256, quality = 0.85) => {
  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  const target = Math.min(size, side);

  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  // fundo branco (jpeg não tem transparência)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, target, target);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);

  return canvas.toDataURL("image/jpeg", quality);
};
