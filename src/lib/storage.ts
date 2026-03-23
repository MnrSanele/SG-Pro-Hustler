export type StorageProvider = "local" | "s3" | "supabase";

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  _contentType: string
): Promise<UploadResult> {
  const provider = (process.env.STORAGE_PROVIDER ?? "local") as StorageProvider;

  if (provider === "local") {
    // Local dev: return a placeholder URL
    return {
      url: `/uploads/${filename}`,
      key: filename,
    };
  }

  throw new Error(`Storage provider "${provider}" not yet implemented`);
}
