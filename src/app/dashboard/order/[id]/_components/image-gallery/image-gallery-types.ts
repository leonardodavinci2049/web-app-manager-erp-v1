export interface OrderSellerGalleryImage {
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

export type OrderSellerGalleryInitialState =
  | {
      status: "ready";
      images: OrderSellerGalleryImage[];
      totalImages: number;
    }
  | {
      status: "empty" | "unavailable";
      images: [];
      totalImages: 0;
    }
  | {
      status: "error";
      images: [];
      totalImages: 0;
      error: string;
    };
