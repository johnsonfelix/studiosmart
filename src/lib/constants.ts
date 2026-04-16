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

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export const SIGNED_URL_EXPIRY = 48 * 3600; // 48 hours in seconds
