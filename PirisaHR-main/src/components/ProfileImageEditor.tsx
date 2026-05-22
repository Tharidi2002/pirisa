import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ZoomIn, ZoomOut, RotateCw, X, Check, Upload } from 'lucide-react';
import ImageCompressor, { CompressedImage } from '../utils/ImageCompressor';

interface ProfileImageEditorProps {
  employeeId: string;
  token: string;
  onImageChange?: (hasImage: boolean) => void;
  gender?: 'male' | 'female';
  firstName?: string;
}

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({
  employeeId,
  token,
  onImageChange,
  gender = 'male',
  firstName = ''
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressedImage | null>(null);
  
  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const CANVAS_SIZE = 400;
  const CROP_RADIUS = 180;

  useEffect(() => {
    if (employeeId) {
      checkProfileImageExists();
    }
  }, [employeeId, token]);

  const loadProfileImage = async () => {
    try {
      const resp = await fetch(
        `http://localhost:8080/api/profile-image/view/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resp.ok) return;

      const blob = await resp.blob();
      if (!blob || blob.size === 0) return;

      setProfileImage((prev) => {
        if (prev) {
          try {
            URL.revokeObjectURL(prev);
          } catch {
            // no-op
          }
        }
        return URL.createObjectURL(blob);
      });
    } catch {
      // ignore image failures
    }
  };

  const checkProfileImageExists = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile-image/exists/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hasImage = Boolean(data?.hasProfileImage ?? data?.exists);
        setHasProfileImage(hasImage);
        onImageChange?.(hasImage);

        if (hasImage) {
          await loadProfileImage();
        } else {
          setProfileImage((prev) => {
            if (prev) {
              try {
                URL.revokeObjectURL(prev);
              } catch {
                // no-op
              }
            }
            return null;
          });
        }
      }
    } catch (error) {
      console.error('Error checking profile image:', error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = ImageCompressor.validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file', {
        position: 'top-center',
        autoClose: 5000,
        closeButton: true,
        pauseOnHover: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowEditor(true);
      // Reset editor state
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setScale(value);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Save context for transformations
    ctx.save();

    // Move to center
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply scale
    ctx.scale(scale, scale);

    // Apply position
    ctx.translate(position.x, position.y);

    // Draw image centered
    const imgAspect = image.naturalWidth / image.naturalHeight;
    let drawWidth, drawHeight;

    if (imgAspect > 1) {
      drawWidth = CANVAS_SIZE;
      drawHeight = CANVAS_SIZE / imgAspect;
    } else {
      drawHeight = CANVAS_SIZE;
      drawWidth = CANVAS_SIZE * imgAspect;
    }

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    // Restore context
    ctx.restore();

    // Draw circular mask overlay
    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, 2 * Math.PI);
    ctx.clip();

    // Redraw image inside the circle (for the cropped view)
    ctx.save();
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(position.x, position.y);
    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
    ctx.restore();

    // Draw semi-transparent overlay outside the circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.restore();

    // Draw circular border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
  }, [imageSrc, scale, rotation, position]);

  useEffect(() => {
    if (showEditor && imageSrc) {
      drawCanvas();
    }
  }, [showEditor, imageSrc, drawCanvas]);

  const handleImageLoad = () => {
    drawCanvas();
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setImageSrc(null);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleCropConfirm = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    try {
      // Create a new canvas for the final cropped image
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = CROP_RADIUS * 2;
      croppedCanvas.height = CROP_RADIUS * 2;
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) return;

      // Draw circular crop
      ctx.beginPath();
      ctx.arc(CROP_RADIUS, CROP_RADIUS, CROP_RADIUS, 0, 2 * Math.PI);
      ctx.clip();

      // Copy from the main canvas
      const sourceX = (CANVAS_SIZE - CROP_RADIUS * 2) / 2;
      const sourceY = (CANVAS_SIZE - CROP_RADIUS * 2) / 2;
      ctx.drawImage(
        canvas,
        sourceX,
        sourceY,
        CROP_RADIUS * 2,
        CROP_RADIUS * 2,
        0,
        0,
        CROP_RADIUS * 2,
        CROP_RADIUS * 2
      );

      // Convert to blob
      croppedCanvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to process image');
          return;
        }

        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

        // Compress the cropped image
        const compressed = await ImageCompressor.compressImage(croppedFile, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          maxSizeKB: 1000,
        });

        setCompressionInfo(compressed);

        const compressionMsg = `Image compressed: ${ImageCompressor.formatFileSize(compressed.originalSize)} → ${ImageCompressor.formatFileSize(compressed.compressedSize)} (${compressed.compressionRatio.toFixed(1)}% reduction)`;
        
        toast.info(compressionMsg, {
          position: 'top-center',
          autoClose: 3000,
          closeButton: true,
          pauseOnHover: true,
        });

        // Upload compressed image
        setUploading(true);
        const formData = new FormData();
        formData.append('profileImage', compressed.file);

        const response = await fetch(
          `http://localhost:8080/api/profile-image/upload/${employeeId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data.resultCode === 100) {
          toast.success('Profile image uploaded successfully!', {
            position: 'top-center',
            autoClose: 3000,
            closeButton: true,
            pauseOnHover: true,
          });
          setHasProfileImage(true);
          onImageChange?.(true);
          handleEditorClose();
          await loadProfileImage();
        } else {
          toast.error(data.resultDesc || 'Failed to upload profile image', {
            position: 'top-center',
            autoClose: 5000,
            closeButton: true,
            pauseOnHover: true,
          });
        }
      }, 'image/jpeg');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Error uploading profile image', {
        position: 'top-center',
        autoClose: 5000,
        closeButton: true,
        pauseOnHover: true,
      });
    } finally {
      setUploading(false);
      setTimeout(() => setCompressionInfo(null), 5000);
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Are you sure you want to remove the profile image?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile-image/delete/${employeeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.resultCode === 100) {
        toast.success('Profile image removed successfully!', {
          position: 'top-center',
          autoClose: 3000,
          closeButton: true,
          pauseOnHover: true,
        });
        setProfileImage((prev) => {
          if (prev) {
            try {
              URL.revokeObjectURL(prev);
            } catch {
              // no-op
            }
          }
          return null;
        });
        setHasProfileImage(false);
        onImageChange?.(false);
      } else {
        toast.error(data.resultDesc || 'Failed to remove profile image', {
          position: 'top-center',
          autoClose: 5000,
          closeButton: true,
          pauseOnHover: true,
        });
      }
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast.error('Error removing profile image', {
        position: 'top-center',
        autoClose: 5000,
        closeButton: true,
        pauseOnHover: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const getDefaultAvatar = () => {
    const initial = firstName ? firstName.charAt(0).toUpperCase() : '?';
    const bgColor = gender === 'female' 
      ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
      : 'bg-gradient-to-br from-blue-600 to-indigo-700';
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
        <span className="text-white font-bold text-4xl" style={{ fontFamily: 'Montserrat, Open Sans, sans-serif' }}>
          {initial}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getDefaultAvatar()}
            </div>
          )}
        </div>
        
        {/* Upload/Remove buttons overlay */}
        <div className="absolute bottom-0 right-0 flex space-x-1">
          <label className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </label>
          
          {hasProfileImage && (
            <button
              onClick={handleImageDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              {deleting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {hasProfileImage ? 'Click to update' : 'Click to upload photo'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported: JPEG, PNG, GIF, WebP (Max 10MB)
        </p>
        
        {compressionInfo && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="text-blue-700 font-medium">📦 Compression Applied:</p>
            <p className="text-blue-600">
              Original: {ImageCompressor.formatFileSize(compressionInfo.originalSize)} → 
              Compressed: {ImageCompressor.formatFileSize(compressionInfo.compressedSize)}
            </p>
            <p className="text-green-600 font-medium">
              Size reduced by {compressionInfo.compressionRatio.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Advanced Image Editor Modal */}
      {showEditor && imageSrc && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Crop & Rotate Profile Photo
              </h3>
              <button
                onClick={handleEditorClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Canvas Area */}
            <div 
              ref={containerRef}
              className="relative flex justify-center items-center mb-6 bg-gray-800 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ height: `${CANVAS_SIZE}px` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="rounded-xl"
              />
              {/* Hidden image for loading */}
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Upload preview"
                onLoad={handleImageLoad}
                className="hidden"
              />
              
              {/* Drag indicator */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  Drag to pan
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Zoom Slider */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={handleZoomChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={scale >= 3}
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <span className="text-gray-400 text-sm w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              {/* Rotation and Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <RotateCw className="h-5 w-5" />
                  <span>Rotate 90°</span>
                  <span className="text-gray-400 text-sm">({rotation}°)</span>
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleEditorClose}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Confirm & Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm text-center">
                💡 Drag to position your face within the circle. Use zoom to adjust size. Rotate to correct orientation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageEditor;
