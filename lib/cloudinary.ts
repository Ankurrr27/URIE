import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Upload a File object directly to Cloudinary (converting to base64 Data URI internally).
 */
export async function uploadImage(
  file: File,
  folder: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataURI = `data:${file.type};base64,${base64}`;

  const cloudinaryFolder = folder === "profiles" ? "resubee/avatars" : `resubee/${folder}`;
  const publicId = folder === "profiles" ? `user_${userId}` : `${userId}_${Date.now()}`;

  const options: any = {
    folder: cloudinaryFolder,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  };

  if (folder === "profiles") {
    options.transformation = [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ];
  } else {
    options.transformation = [
      { quality: "auto", fetch_format: "auto" }
    ];
  }

  const result = await cloudinary.uploader.upload(dataURI, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Upload a profile picture from a base64 data URI or a remote URL.
 * Returns structured result with the secure CDN URL.
 */
export async function uploadProfilePicture(
  source: string, // base64 dataURI OR remote URL
  userId: string
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(source, {
    folder: "resubee/avatars",
    public_id: `user_${userId}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
    resource_type: "image",
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete a profile picture by its Cloudinary public ID.
 */
export async function deleteProfilePicture(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/**
 * Derive the Cloudinary public_id from a stored URL (for deletion).
 * e.g. "https://res.cloudinary.com/.../resubee/avatars/user_abc.jpg"
 *   → "resubee/avatars/user_abc"
 */
export function publicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // pathname: /cloud_name/image/upload/v123456/resubee/avatars/user_abc.jpg
    const parts = u.pathname.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1]; // v123456/resubee/avatars/user_abc.jpg
    // strip optional version segment "v\d+/"
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // strip extension
    return withoutVersion.replace(/\.[^.]+$/, "");
  } catch {
    return null;
  }
}
