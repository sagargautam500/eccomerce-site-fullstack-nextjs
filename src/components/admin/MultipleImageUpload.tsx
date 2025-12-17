// src/components/admin/MultipleImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function MultipleImageUpload({
  images,
  onChange,
  label = "Additional Images",
  maxImages = 10,
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    let successCount = 0;

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axiosInstance.post(
            "/api/admin/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const { url } = response.data;
          uploadedUrls.push(url);
          successCount++;
        } catch (error: any) {
          console.error(`Upload error for ${file.name}:`, error);
          const errorMessage =
            error.response?.data?.error || error.message || "Failed to upload";
          toast.error(`${file.name}: ${errorMessage}`);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast.success(`${successCount} image(s) uploaded successfully`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (index: number) => {
    const imageUrl = images[index];

    // If it's a Cloudinary URL, optionally delete it from server
    if (imageUrl.includes("cloudinary.com")) {
      try {
        await axiosInstance.delete(
          `/api/admin/delete-image?url=${encodeURIComponent(imageUrl)}`
        );
      } catch (error) {
        console.error("Delete error:", error);
        // Continue anyway to remove from UI
      }
    }

    onChange(images.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, url: string) => {
    const newImages = [...images];
    newImages[index] = url;
    onChange(newImages);
  };

  const addUrlField = () => {
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    onChange([...images, ""]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="space-y-3">
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                {img ? (
                  <div className="relative w-full aspect-square border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <input
                  type="text"
                  value={img}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder="Or paste URL"
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Upload/Add Buttons */}
        {images.length < maxImages && (
          <div className="flex gap-2">
            {/* Upload Button */}
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    Upload Images
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>

            {/* Add URL Field Button */}
            <button
              type="button"
              onClick={addUrlField}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="Add URL field"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Upload images or paste URLs. Maximum {maxImages} images. Each image
          should be less than 5MB.
        </p>
      </div>
    </div>
  );
}
