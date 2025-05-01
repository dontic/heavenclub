// Type for optional metadata in each page
export interface MetaData {
  title?: string; // Title of the page
  useTitleTemplate?: boolean; // Use the title template -> %s - My Site
  description?: string; // Description of the page
  canonical?: string; // Canonical URL
  index?: boolean; // Index the page
  follow?: boolean; // Follow the page
  openGraph?: MetaDataOpenGraph;
  twitter?: MetaDataTwitter;
}

export interface MetaDataOpenGraph {
  title: string;
  description?: string;
  type: string;
  image: string;
  url?: string;
  siteName?: string;
  locale?: string;
}

type TwitterCardType = "summary" | "summary_large_image" | "app" | "player";

export interface MetaDataTwitter {
  cardType: TwitterCardType;
  site?: string;
  title?: string;
  description?: string;
  image?: string;
}
