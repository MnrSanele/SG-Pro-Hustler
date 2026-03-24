import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StorageProvider = "local" | "s3" | "supabase";

export interface UploadResult {
  url: string;
  key: string;
}

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).replace(/[^a-zA-Z0-9.]/g, "");
  return `${randomUUID()}${extension || ".bin"}`;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult> {
  const provider = (process.env.STORAGE_PROVIDER ?? "local") as StorageProvider;

  if (provider === "local") {
    if (!contentType.startsWith("image/")) {
      throw new Error("Only image uploads are supported");
    }

    const safeFilename = sanitizeFilename(filename);
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDirectory, { recursive: true });

    const destination = path.join(uploadsDirectory, safeFilename);
    await writeFile(destination, file);

    return {
      url: `/uploads/${safeFilename}`,
      key: safeFilename,
    };
  }

  throw new Error(`Storage provider "${provider}" not yet implemented`);
}
