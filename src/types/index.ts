import { Role } from "@prisma/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PhotoWithSelection {
  id: string;
  albumId: string;
  fileName: string;
  previewUrl: string;
  thumbnailUrl: string;
  originalUrl: string | null;
  width: number;
  height: number;
  fileSize: number;
  createdAt: Date;
  isSelected?: boolean;
}

export interface AlbumWithCounts {
  id: string;
  title: string;
  studioId: string;
  clientId: string;
  isActive: boolean;
  accessToken: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    photos: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
  selectedCount?: number;
}

export interface StudioWithStats {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    albums: number;
    clients: number;
  };
}

export interface DashboardStats {
  totalAlbums: number;
  totalPhotos: number;
  totalClients: number;
  totalSelections: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  studioId?: string;
}
