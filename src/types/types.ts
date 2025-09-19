export interface Review {
  rating: number;
  comment: string;
  user_email?: string;
}

export interface FoodItem {
  id: number;
  name: string;
  price: number;
  image_urls: string[]; // changed from image_url to image_urls
  reviews: Review[];
  category?: string; // added for category filtering
}
export interface ImagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  dir?: "ltr" | "rtl";
}

export interface MenuHeaderProps {
  logoUrl?: string;
  title?: string;
  subtitle?: string;
}

export type Language = "en" | "ar";

export type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};


