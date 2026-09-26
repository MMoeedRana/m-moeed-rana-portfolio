export async function uploadFile(
  file: File,
): Promise<{ id: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd }),
    j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? "Upload failed.");
  return j;
}
