import { CLOUDINARY_CONFIG, isCloudinaryConfigured } from "./config";

export const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}`;

/**
 * Upload an image to Cloudinary using an unsigned upload preset
 * @param file - The image file from the input
 * @returns The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Please check your environment variables.");
  }

  // The upload preset is provided by the user as 'sms_group'
  const UPLOAD_PRESET = "sms_group";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Generate an optimized Cloudinary URL
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "thumb" | "crop" | "pad" | "lpad" | "mpad" | "scale";
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png" | "gif";
    gravity?: string;
    radius?: number;
    border?: string;
  }
): string {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "Cloudinary is not configured. Image optimization will not work. Check your .env.local file for NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME."
    );
    return publicId;
  }

  const transforms = [];

  if (options?.width || options?.height) {
    const size = `w_${options.width || "auto"},h_${options.height || "auto"}`;
    transforms.push(size);
  }

  if (options?.crop) {
    transforms.push(`c_${options.crop}`);
  }

  if (options?.quality) {
    transforms.push(`q_${options.quality}`);
  }

  if (options?.format) {
    transforms.push(`f_${options.format}`);
  }

  if (options?.gravity) {
    transforms.push(`g_${options.gravity}`);
  }

  if (options?.radius) {
    transforms.push(`r_${options.radius}`);
  }

  if (options?.border) {
    transforms.push(`bo_${options.border}`);
  }

  const transformString = transforms.length > 0 ? `/${transforms.join(",")}` : "";
  return `${CLOUDINARY_URL}/image/upload${transformString}/${publicId}`;
}

export function getResponsiveImageSrcSet(publicId: string): string {
  if (!isCloudinaryConfigured()) {
    return publicId;
  }

  const sizes = [320, 640, 960, 1280, 1920];
  return sizes
    .map((width) => `${getCloudinaryUrl(publicId, { width, quality: "auto", format: "auto" })} ${width}w`)
    .join(", ");
}

export function getThumbnailUrl(publicId: string, size: number = 100): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
    gravity: "face",
    quality: "auto",
    format: "auto",
  });
}

export function getOptimizedImageUrl(
  publicId: string,
  width: number = 800,
  height: number = 600
): string {
  return getCloudinaryUrl(publicId, {
    width,
    height,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

export function getAvatarUrl(publicId: string, size: number = 200): string {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
    gravity: "face",
    radius: 0,
    quality: "auto",
    format: "auto",
  });
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com") || url.includes(CLOUDINARY_URL);
}

export function externalUrlToCloudinary(externalUrl: string): string {
  if (!isCloudinaryConfigured()) {
    return externalUrl;
  }

  const encodedUrl = Buffer.from(externalUrl).toString("base64");
  return `${CLOUDINARY_URL}/image/fetch/q_auto,f_auto/${encodedUrl}`;
}

const cloudinaryHelpers = {
  uploadImageToCloudinary,
  getCloudinaryUrl,
  getResponsiveImageSrcSet,
  getThumbnailUrl,
  getOptimizedImageUrl,
  getAvatarUrl,
  isCloudinaryUrl,
  externalUrlToCloudinary,
  isConfigured: isCloudinaryConfigured,
};

export default cloudinaryHelpers;
