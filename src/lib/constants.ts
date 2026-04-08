export const APP_NAME = "StudioSmart";
export const APP_DESCRIPTION = "Photo selection and proofing platform for photography studios";

export const ROLES = {
  ADMIN: "ADMIN",
  STUDIO: "STUDIO",
  CLIENT: "CLIENT",
} as const;

export const PHOTOS_PER_PAGE = 24;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds
