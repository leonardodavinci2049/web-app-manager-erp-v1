export interface SupplierGalleryImage {
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

export type SupplierGalleryInitialState =
  | {
      status: "ready";
      images: SupplierGalleryImage[];
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

export type SupplierGalleryMutationResult =
  | {
      success: true;
      message: string;
      preferredImageId?: string;
      warning?: string;
    }
  | { success: false; error: string };
