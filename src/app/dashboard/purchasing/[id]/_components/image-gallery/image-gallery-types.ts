export interface PurchasingGalleryImage {
  id: string;
  originalName: string;
  isPrimary: boolean;
  urls: {
    original: string;
    preview: string;
    thumbnail: string;
  };
}

export type PurchasingGalleryInitialState =
  | {
      status: "ready";
      images: PurchasingGalleryImage[];
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

export type PurchasingGalleryMutationResult =
  | {
      success: true;
      message: string;
      preferredImageId?: string;
      warning?: string;
    }
  | { success: false; error: string };
