/**
 * services/upload.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Helpers for client-side image selection + Cloudinary-backed upload.
 *
 * Flow: read the chosen file into a base64 data URI → POST to /uploads/image →
 * backend uploads to Cloudinary and returns the hosted URL.
 */
import apiClient from "./axios";

/** Read a File into a base64 data URI. */
export function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate + upload an image File. Returns the hosted Cloudinary URL.
 * `folder` groups assets server-side ("students" | "employees").
 * Throws on validation failure or upload error (caller shows the toast).
 */
export async function uploadImageFile(file, folder = "misc") {
  if (!file) throw new Error("No file selected");
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  // No size cap on photos (per requirement). The server body limit is the only bound.

  const dataUri = await fileToDataUri(file);
  const res = await apiClient.post("/uploads/image", { image: dataUri, folder });
  const url = res?.data?.data?.url;
  if (!url) throw new Error("Upload failed");
  return url;
}

const MAX_DOC_BYTES = 1 * 1024 * 1024; // 1MB (matches "Max 1MB each")
const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

/**
 * Validate + upload a document File (pdf/doc/jpeg). Returns the hosted URL.
 * Throws on validation/upload failure.
 */
export async function uploadDocumentFile(file, folder = "docs") {
  if (!file) throw new Error("No file selected");
  if (DOC_TYPES.length && !DOC_TYPES.includes(file.type)) {
    throw new Error("Only PDF, DOC or JPEG files are allowed");
  }
  if (file.size > MAX_DOC_BYTES) throw new Error("Each file must be under 1MB");

  const dataUri = await fileToDataUri(file);
  const res = await apiClient.post("/uploads/file", { file: dataUri, folder });
  const url = res?.data?.data?.url;
  if (!url) throw new Error("Upload failed");
  return url;
}
