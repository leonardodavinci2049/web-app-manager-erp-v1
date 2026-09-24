export interface SettingsGalleryImage {
  id: string;
  originalName: string;
  uploadedAt: string;
  displayOrder: number;
  isPrimary: boolean;
  urls: {
    original: string;
    preview: string;
    medium: string;
    thumbnail: string;
  };
}

export type SettingsGalleryInitialState =
  | {
      status: "ready";
      images: SettingsGalleryImage[];
      totalImages: number;
    }
  | {
      status: "empty";
      images: [];
      totalImages: 0;
    }
  | {
      status: "error";
      images: [];
      totalImages: 0;
      error: string;
    };

export type SettingsGalleryMutationResult =
  | {
      success: true;
      message: string;
      preferredImageId?: string;
      warning?: string;
    }
  | { success: false; error: string };
