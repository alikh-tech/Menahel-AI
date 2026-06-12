import { createClient } from "@/lib/supabase/client";

// Storage paths are stored as "<bucket>/<path-within-bucket>", e.g.
// "students-documents/Grades.pdf".
function parseStoragePath(storagePath: string): { bucket: string; path: string } {
  const slashIndex = storagePath.indexOf("/");
  return {
    bucket: storagePath.slice(0, slashIndex),
    path: storagePath.slice(slashIndex + 1),
  };
}

// Returns the public URL for viewing an academic document stored in Supabase
// Storage. The "students-documents" bucket is public, so no signed URL is
// needed.
export async function getAcademicDocumentViewUrl(storagePath: string): Promise<string | null> {
  const { bucket, path } = parseStoragePath(storagePath);
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

// Returns a public URL that forces a download of the academic document.
export async function getAcademicDocumentDownloadUrl(storagePath: string): Promise<string | null> {
  const { bucket, path } = parseStoragePath(storagePath);
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, { download: true });
  return data?.publicUrl ?? null;
}

// Returns the URL to be used as the attachment source for the
// "שלח למייל" flow.
export async function getAcademicDocumentEmailAttachmentUrl(storagePath: string): Promise<string | null> {
  return getAcademicDocumentViewUrl(storagePath);
}
