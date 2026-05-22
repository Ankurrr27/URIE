import "server-only";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { assertCloudinaryEnv, env } from "@/lib/env";
import { ApiError } from "@/lib/api-response";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type CloudinaryFolder = "profiles" | "resumes";
export type ImageUploadResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  provider: "cloudinary" | "local";
};

function configureCloudinary() {
  assertCloudinaryEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function uploadImage(file: File, folder: CloudinaryFolder, userId: string): Promise<ImageUploadResult> {
  validateImageFile(file);

  try {
    const result = await uploadImageToCloudinary(file, folder, userId);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      provider: "cloudinary"
    };
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("Cloudinary upload failed in development; using local upload fallback.", error);
    return uploadImageLocally(file, folder, userId);
  }
}

async function uploadImageToCloudinary(file: File, folder: CloudinaryFolder, userId: string) {
  validateImageFile(file);
  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = `${folder}/${userId}/${crypto.randomUUID()}`;

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: "resubee",
        resource_type: "image",
        overwrite: false,
        transformation: [
          { quality: "auto:good", fetch_format: "auto" },
          folder === "profiles" ? { width: 512, height: 512, crop: "fill", gravity: "face" } : { width: 1600, crop: "limit" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(502, "Cloudinary upload failed. Check your cloud name, API key, and API secret.", "CLOUDINARY_UPLOAD_FAILED"));
          return;
        }
        if (!result) {
          reject(new ApiError(502, "Cloudinary did not return an upload result.", "CLOUDINARY_EMPTY_RESPONSE"));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function uploadImageLocally(file: File, folder: CloudinaryFolder, userId: string): Promise<ImageUploadResult> {
  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const publicId = `${folder}/${userId}/${crypto.randomUUID()}.${extension}`;
  const relativePath = join("uploads", folder, userId);
  const absoluteDir = join(process.cwd(), "public", relativePath);
  await mkdir(absoluteDir, { recursive: true });

  const fileName = `${crypto.randomUUID()}.${extension}`;
  const absolutePath = join(absoluteDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    url: `/${relativePath.replaceAll("\\", "/")}/${fileName}`,
    publicId,
    bytes: file.size,
    format: extension,
    provider: "local"
  };
}

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ApiError(415, "Only JPEG, PNG, WebP, and GIF images are supported.", "INVALID_IMAGE_TYPE");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(413, "Image must be smaller than 3MB.", "IMAGE_TOO_LARGE");
  }
}
