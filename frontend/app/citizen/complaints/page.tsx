"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Camera, MapPin, Send, Loader2, AlertCircle, CheckCircle2, Tag, Phone, Mail } from "lucide-react";

const COMPLAINT_CATEGORIES = [
  { value: 'air_quality', label: 'Air Quality Issue', icon: '🌫️', description: 'Poor AQI, smog, or breathing difficulties' },
  { value: 'industrial', label: 'Industrial Pollution', icon: '🏭', description: 'Factory emissions or chemical smell' },
  { value: 'vehicular', label: 'Vehicular Pollution', icon: '🚗', description: 'Traffic congestion or vehicle emissions' },
  { value: 'construction', label: 'Construction Dust', icon: '🏗️', description: 'Building dust or demolition' },
  { value: 'burning', label: 'Open Burning', icon: '🔥', description: 'Garbage, crop, or waste burning' },
  { value: 'other', label: 'Other', icon: '📋', description: 'General pollution complaint' }
];

export default function ComplaintsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'raise' | 'my-complaints'>('raise');

  const MOCK_MY_COMPLAINTS = [
    { id: 'CMP-2024-001', category: 'burning', date: '2024-01-10', status: 'Resolved', description: 'Burning garbage near park', location: 'Sector 4, Dwarka' },
    { id: 'CMP-2024-002', category: 'construction', date: '2024-01-11', status: 'In Progress', description: 'Uncovered construction material', location: 'Palam Colony' },
    { id: 'CMP-2024-003', category: 'vehicular', date: '2024-01-11', status: 'Pending', description: 'Heavy smoke from truck', location: 'Main Road, Najafgarh' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
      setError("Please fill all required fields and enable location");
      return;
    }

    // Prefill contact info from Clerk if not provided
    const finalPhone = phone || user?.phoneNumbers?.[0]?.phoneNumber || '';
    const finalEmail = email || user?.primaryEmailAddress?.emailAddress || '';

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', user?.id || '');
      formData.append('userName', user?.fullName || 'Anonymous');
      formData.append('description', description);
      formData.append('category', category);
      formData.append('phone', finalPhone);
      formData.append('email', finalEmail);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('address', location.address);

      const response = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitSuccess(data);
        // Clear form
        setImage(null);
        setImagePreview("");
        setDescription("");
        setCategory("other");
        setLocation(null);
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

  // If submission was successful, show success message
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Complaint Submitted Successfully!</h2>
          <p className="text-slate-600 mb-6">Your complaint has been registered and assigned to the appropriate authorities.</p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-left">
                <p className="text-slate-500 font-medium">Complaint ID</p>
                <p className="text-slate-900 font-semibold">{submitSuccess.complaintId}</p>
              </div>
              <div className="text-left">
                <p className="text-slate-500 font-medium">Category</p>
                <p className="text-slate-900 font-semibold capitalize">{submitSuccess.complaint?.category?.replace('_', ' ')}</p>
              </div>
              <div className="text-left">
                <p className="text-slate-500 font-medium">Priority</p>
                <p className="text-slate-900 font-semibold capitalize">{submitSuccess.complaint?.priority}</p>
              </div>
              <div className="text-left">
                <p className="text-slate-500 font-medium">Ward</p>
                <p className="text-slate-900 font-semibold">{submitSuccess.complaint?.wardName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSubmitSuccess(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Another Complaint
            </button>
            <button
              onClick={() => router.push('/citizen')}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Complaints & Reports
        </h1>
        <p className="text-slate-500 font-medium mt-1 mb-6">
          Report pollution sources and track your submitted complaints
        </p>
        
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('raise')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'raise' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Raise Complaint
          </button>
          <button
            onClick={() => setActiveTab('my-complaints')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'my-complaints' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Complaints
          </button>
        </div>
      </div>

      {activeTab === 'my-complaints' ? (
        <div className="space-y-4">
          {MOCK_MY_COMPLAINTS.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">{complaint.id}</span>
                    <span className="text-xs text-slate-400">• {complaint.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 capitalize">{complaint.category.replace('_', ' ')}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{complaint.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                <MapPin size={14} />
                {complaint.location}
              </div>
            </div>
          ))}
          
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">Showing recent complaints</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                <Tag className="inline w-4 h-4 mr-1" />
                Complaint Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      category === cat.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{cat.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
      )}
    </div>
  );
}