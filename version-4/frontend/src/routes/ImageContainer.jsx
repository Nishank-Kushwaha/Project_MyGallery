import React, { useState, useEffect } from "react";
import {
  X,
  ZoomIn,
  Download,
  Heart,
  Share2,
  RefreshCw,
  Camera,
} from "lucide-react";

const Image = ({ img, onImageClick, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-gray-900 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      onClick={() => onImageClick(index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative">
        {!imageError ? (
          <img
            src={img.src}
            alt={img.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          // Error placeholder
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Camera size={48} className="text-gray-500" />
          </div>
        )}

        {/* Loading skeleton */}
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-700 animate-pulse" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-lg">{img.name}</h3>
          {img.description && (
            <p className="text-sm text-gray-300 mt-1">{img.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {img.uploadDate && new Date(img.uploadDate).toLocaleDateString()}
          </p>
        </div>

        {/* Hover icons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
          <button
            className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(index);
            }}
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Modal = ({ img, isOpen, onClose, onNext, onPrev }) => {
  if (!isOpen || !img) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = img.src;
    link.download = img.originalName || img.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* Image details and actions */}
        <div className="mt-6 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">{img.name}</h2>
          {img.description && (
            <p className="text-gray-300 mb-4">{img.description}</p>
          )}

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Download size={16} />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
              <Heart size={16} />
              Like
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Share2 size={16} />
              Share
            </button>
          </div>

          {img.size && (
            <p className="text-sm text-gray-400 mt-4">
              Size: {(img.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          {img.uploadDate && (
            <p className="text-sm text-gray-400">
              Uploaded: {new Date(img.uploadDate).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ImageContainer = () => {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadImagesFromBackend = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/auth/get-photos", {
        method: "GET",
        credentials: "include", // Include cookies/session
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        // Transform the data to match our component structure
        const transformedImages = result.data.map((photo, index) => ({
          src: `http://localhost:8080${photo.fileUrl}`,
          name: photo.originalName || `Image ${index + 1}`,
          description: photo.description,
          originalName: photo.originalName,
          filename: photo.filename,
          size: photo.size,
          mimetype: photo.mimetype,
          uploadDate: photo.uploadDate,
        }));

        setImages(transformedImages);
        console.log("Loaded photos:", transformedImages);
      } else {
        setError(result.message || "Failed to load photos");
      }
    } catch (error) {
      console.error("Error loading images:", error);
      setError("Failed to load photos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load images when component mounts
  useEffect(() => {
    loadImagesFromBackend();
  }, []);

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
      {/* Header with Load Button */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Photo Gallery
            </h1>
            <p className="text-gray-400">
              {images.length > 0
                ? `${images.length} photo${
                    images.length !== 1 ? "s" : ""
                  } loaded`
                : "No photos loaded yet"}
            </p>
          </div>

          <button
            onClick={loadImagesFromBackend}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading Photos..." : "Load Photos"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && images.length === 0 && !error && (
          <div className="text-center py-16">
            <Camera size={64} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Photos Found
            </h3>
            <p className="text-gray-400 mb-6">
              Upload some photos first, then click "Load Photos" to see them
              here.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <RefreshCw
              size={48}
              className="text-blue-500 mx-auto mb-4 animate-spin"
            />
            <p className="text-white">Loading your photos...</p>
          </div>
        )}

        {/* Gallery Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <Image
                key={`${img.filename || img.name}-${index}`}
                img={img}
                onImageClick={handleImageClick}
                index={index}
              />
            ))}
          </div>
        )}
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
