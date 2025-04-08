import React from 'react';

interface ImageProps {
  src: string;
  className?: string;
  w?: number;
  h?: number;
  alt?: string;
}

const Image: React.FC<ImageProps> = ({ src, className, w, h, alt }) => {
  return (
    <img
      src={src} // Path to the image
      className={className} // Custom styles
      loading="lazy" // Enable lazy loading
      alt={alt || "image"} // Alt text for accessibility
      width={w} // Image width
      height={h} // Image height
      style={{
        width: w ? `${w}px` : "auto",
        height: h ? `${h}px` : "auto",
      }} // Inline styles for transformation
    />
  );
};

export default Image; 