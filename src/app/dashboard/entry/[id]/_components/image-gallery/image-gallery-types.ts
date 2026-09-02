export interface EntryGalleryImage {
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

export type EntryGalleryInitialState =
  | {
      status: "ready";
      images: EntryGalleryImage[];
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
