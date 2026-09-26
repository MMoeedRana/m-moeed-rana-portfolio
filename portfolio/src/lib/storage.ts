import "server-only";

import { v2 as cloudinary } from "cloudinary";

export const MAX_BYTES = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ascii = (b: Buffer, a: number, z: number) =>
  b.subarray(a, z).toString("latin1");

const TYPES: Record<
  string,
  {
    mime: string;
    resourceType: "image" | "raw" | "video";
    ok: (b: Buffer) => boolean;
  }
> = {
  png: {
    mime: "image/png",
    resourceType: "image",
    ok: (b) => b[0] === 0x89 && ascii(b, 1, 4) === "PNG",
  },

  jpg: {
    mime: "image/jpeg",
    resourceType: "image",
    ok: (b) => b[0] === 0xff && b[1] === 0xd8,
  },

  gif: {
    mime: "image/gif",
    resourceType: "image",
    ok: (b) => ascii(b, 0, 3) === "GIF",
  },

  webp: {
    mime: "image/webp",
    resourceType: "image",
    ok: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },

  pdf: {
    mime: "application/pdf",
    resourceType: "raw",
    ok: (b) => ascii(b, 0, 4) === "%PDF",
  },

  mp4: {
    mime: "video/mp4",
    resourceType: "video",
    ok: (b) => b.length >= 12 && ascii(b, 4, 8) === "ftyp",
  },

  webm: {
    mime: "video/webm",
    resourceType: "video",
    ok: (b) =>
      b.length >= 4 &&
      b[0] === 0x1a &&
      b[1] === 0x45 &&
      b[2] === 0xdf &&
      b[3] === 0xa3,
  },
};

const ext = (name: string) => {
  const e = name.split(".").pop()?.toLowerCase() ?? "";
  return e === "jpeg" ? "jpg" : e;
};

export const mimeFor = (name: string) => TYPES[ext(name)]?.mime;

export async function store(buf: Buffer, original: string) {
  const extension = ext(original);
  const type = TYPES[extension];

  if (!type || !type.ok(buf)) return null;

  const dataUri = `data:${type.mime};base64,${buf.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: type.resourceType,
    folder: "moeed-rana-portfolio",
    use_filename: false,
    unique_filename: true,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    path: result.public_id,
    mime: type.mime,
  };
}

export async function remove(publicId: string) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch {
    // Ignore image deletion errors.
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch {
    // Ignore video deletion errors.
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  } catch {
    // Ignore raw/PDF deletion errors.
  }
}
