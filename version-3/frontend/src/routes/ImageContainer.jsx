import React, { useState } from "react";
import { X, ZoomIn, Download, Heart, Share2 } from "lucide-react";

// This would come from your backend API
const images = [
  { src: "/images/img1.jpg", name: "Image 1" },
  { src: "/images/img2.jpg", name: "Image 2" },
  { src: "/images/img3.jpg", name: "Image 3" },
  { src: "/images/img4.jpg", name: "Image 4" },
  { src: "/images/img5.jpg", name: "Image 5" },
  { src: "/images/img6.jpg", name: "Image 6" },
  { src: "/images/img7.jpg", name: "Image 7" },
  { src: "/images/img8.jpg", name: "Image 8" },
  { src: "/images/img9.jpg", name: "iImage 9" },
  { src: "/images/img10.jpg", name: "Image 10" },
  { src: "/images/img11.jpg", name: "Image 11" },
  { src: "/images/img12.jpg", name: "Image 12" },
  { src: "/images/img13.jpg", name: "Image 13" },
  { src: "/images/img14.jpg", name: "Image 14" },
  { src: "/images/img15.jpg", name: "Image 15" },
];

const Image = ({ img, onImageClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-gray-900 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={() => onImageClick(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative">
        <img
          src={img.src}
          alt={img.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
          } ${isHovered ? "scale-110" : "scale-100"}`}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-lg">{img.name}</h3>
        </div>

        {/* Hover icons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors">
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ img, isOpen, onClose, onNext, onPrev }) => {
  if (!isOpen || !img) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-[90vh] w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X size={32} />
        </button>

        {/* Image */}
        <div className="relative">
          <img
            src={img.src}
            alt={img.name}
            className="w-full h-auto max-h-[76vh] object-contain rounded-lg"
          />

          {/* Navigation arrows */}
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            ←
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            →
          </button>
        </div>

        {/* Image details */}
        <div className="mt-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">{img.name}</h2>
        </div>
      </div>
    </div>
  );
};

const ImageContainer = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, index) => (
            <Image
              key={`${img.name}-${index}`}
              img={img}
              onImageClick={handleImageClick}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        img={selectedImageIndex !== null ? images[selectedImageIndex] : null}
        isOpen={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
};

export default ImageContainer;
