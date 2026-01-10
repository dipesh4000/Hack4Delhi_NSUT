"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Camera, MapPin, Send, Loader2, AlertCircle } from "lucide-react";
import CitizenLayout from "@/components/citizen/CitizenLayout";

export default function ComplaintsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setIsGettingLocation(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': 'WardAir-Hack4Delhi/1.0' } }
          );
          
          const data = await response.json();
          const address = data.display_name || "Unknown Location";
          
          setLocation({ lat: latitude, lng: longitude, address });
        } catch (err) {
          setError("Failed to get address");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable location services.");
        setIsGettingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image || !description.trim() || !location) {
      setError("Please fill all fields and enable location");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', user?.id || '');
      formData.append('userName', user?.fullName || 'Anonymous');
      formData.append('description', description);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('address', location.address);

      const response = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        router.push('/citizen?complaint=success');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit complaint');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Raise a Complaint
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Report pollution sources in your area to help improve air quality
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Upload Image *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {setImage(null); setImagePreview("");}}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Click to upload an image of the pollution source</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Describe the Problem *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you see that's contributing to air pollution..."
                className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">{description.length}/500 characters</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Location *
              </label>
              {location ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-green-800 font-medium">Location Captured</p>
                      <p className="text-green-700 text-sm mt-1">{location.address}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center gap-3 text-slate-600 hover:text-blue-600"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin size={20} />
                      Enable Location Access
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !image || !description.trim() || !location}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Complaint
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </CitizenLayout>
  );
}