const importImage = async (path: string): Promise<ImageMetadata> => {
  // Create a mapping for all the images in the src/ folder and its subdirectories
  const images = import.meta.glob<{ default: ImageMetadata }>('src/**/*.{jpeg,jpg,png,gif,webp}');

  if (!images[path]) throw new Error(`"${path}" does not exist in glob: "src/**/*.{jpeg,jpg,png,gif}"`);

  // The glob import returns a promise, so we need to await it
  const imageModule = await images[path]();
  return imageModule.default;
};

export default importImage;
