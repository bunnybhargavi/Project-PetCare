import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import Navbar from "../Layout/Navbar";

// Helper function to fetch image as blob with authentication
const fetchImageAsBlob = async (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http') && !relativePath.includes('localhost:8080')) {
    return relativePath;
  }

  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const BASE_URL = API_URL.replace('/api', '');
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('No JWT token found');
      return null;
    }

    let imageUrl;
    if (relativePath.startsWith('/uploads/profiles/')) {
      imageUrl = `${BASE_URL}${relativePath}`;
    } else if (relativePath.startsWith('/uploads/')) {
      imageUrl = `${BASE_URL}${relativePath}`;
    } else {
      imageUrl = `${BASE_URL}/uploads/profiles/${relativePath.replace(/^\/+/, '')}`;
    }

    console.log('Fetching image with auth:', imageUrl);

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('Image fetched successfully as blob');
      return blobUrl;
    } else {
      console.error('Failed to fetch image:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    return null;
  }
};

const getImageUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const BASE_URL = API_URL.replace('/api', '');

  if (relativePath.startsWith('/uploads/profiles/')) {
    return `${BASE_URL}${relativePath}`;
  } else if (relativePath.startsWith('/uploads/')) {
    return `${BASE_URL}${relativePath}`;
  } else {
    return `${BASE_URL}/uploads/profiles/${relativePath.replace(/^\/+/, '')}`;
  }
};

const pastelGradients = {
  OWNER: "from-[#FDF2F8] via-[#E0F2FE] to-[#EEF2FF]",
  VET: "from-[#E0F7FA] via-[#E8F5E9] to-[#FFF3E0]",
};

const tagColors = {
  OWNER: "bg-indigo-100 text-indigo-800",
  VET: "bg-emerald-100 text-emerald-800",
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    address: "",
    clinicName: "",
    specialization: "",
    clinicAddress: "",
  });

  const gradient = pastelGradients[user?.role] || pastelGradients.OWNER;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.uploadProfilePhoto(file);
      console.log("Upload response:", response);

      const updatedUser = await authService.getProfile();
      console.log("Updated user data:", updatedUser);

      const rawPhotoUrl = updatedUser.profilePhoto || updatedUser.photoUrl || updatedUser.photo_url
        || updatedUser.ownerProfilePhoto || updatedUser.vetProfilePhoto
        || response.profilePhoto || response.photoUrl || response.photo_url;

      console.log("Raw photo URL from backend:", rawPhotoUrl);

      const fullPhotoUrl = await fetchImageAsBlob(rawPhotoUrl);
      console.log("Constructed full photo URL:", fullPhotoUrl);

      setPhotoUrl(fullPhotoUrl);

      const updatedUserData = {
        ...user,
        ...updatedUser,
        profilePhoto: fullPhotoUrl,
        photoUrl: fullPhotoUrl,
        photo_url: fullPhotoUrl,
        ownerProfilePhoto: user?.role === 'OWNER' ? fullPhotoUrl : user?.ownerProfilePhoto,
        vetProfilePhoto: user?.role === 'VET' ? fullPhotoUrl : user?.vetProfilePhoto
      };
      updateUser(updatedUserData);
      console.log("Updated user data:", updatedUserData);

      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        const updatedLocalUser = {
          ...currentUser,
          ...updatedUser,
          profilePhoto: fullPhotoUrl,
          photoUrl: fullPhotoUrl,
          photo_url: fullPhotoUrl,
          ownerProfilePhoto: currentUser?.role === 'OWNER' ? fullPhotoUrl : currentUser?.ownerProfilePhoto,
          vetProfilePhoto: currentUser?.role === 'VET' ? fullPhotoUrl : currentUser?.vetProfilePhoto
        };
        sessionStorage.setItem('user', JSON.stringify(updatedLocalUser));
        console.log("Updated localStorage user:", updatedLocalUser);
      }

      setMessage({
        type: "success",
        text: "Profile photo updated successfully!"
      });

      e.target.value = null;
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to upload photo",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        clinicName: user.clinicName || "",
        specialization: user.specialization || "",
        clinicAddress: user.clinicAddress || "",
      });

      const rawPhotoUrl = user?.profilePhoto || user?.photoUrl || user?.photo_url
        || user?.ownerProfilePhoto || user?.vetProfilePhoto;

      if (rawPhotoUrl) {
        try {
          const blobUrl = await fetchImageAsBlob(rawPhotoUrl);
          setPhotoUrl(blobUrl);
          console.log("Setting photo URL from user:", blobUrl);
        } catch (err) {
          console.error("Error fetching photo:", err);
          const fallbackUrl = getImageUrl(rawPhotoUrl);
          setPhotoUrl(fallbackUrl);
        }
      } else {
        try {
          const profile = await authService.getProfile();
          console.log("Fetched profile:", profile);

          if (profile) {
            const photoUrlFromProfile = profile.profilePhoto || profile.photoUrl || profile.photo_url
              || profile.ownerProfilePhoto || profile.vetProfilePhoto;

            if (photoUrlFromProfile) {
              try {
                const blobUrl = await fetchImageAsBlob(photoUrlFromProfile);
                setPhotoUrl(blobUrl);
              } catch (err) {
                console.error("Error fetching photo:", err);
                const fallbackUrl = getImageUrl(photoUrlFromProfile);
                setPhotoUrl(fallbackUrl);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    };

    loadProfileData();
  }, [user?.userId, user?.profilePhoto, user?.photoUrl, user?.photo_url]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updated = await authService.updateProfile(profileData);
      updateUser(updated);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProfileData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      clinicName: user?.clinicName || "",
      specialization: user?.specialization || "",
      clinicAddress: user?.clinicAddress || "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F9FAFB] to-[#F1F5F9]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className={`relative overflow-hidden rounded-3xl border border-gray-100 shadow-lg p-8 mb-8 bg-gradient-to-r ${gradient}`}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/40 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/30 rounded-full blur-2xl" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {photoUrl ? (
                <>
                  <img
                    key={photoUrl}
                    src={photoUrl}
                    alt="Profile"
                    className="w-28 h-28 rounded-2xl object-cover shadow-lg"
                    onError={(e) => {
                      console.error("Error loading image:", photoUrl);

                      const originalPath = user?.profilePhoto || user?.photoUrl || user?.photo_url
                        || user?.ownerProfilePhoto || user?.vetProfilePhoto;

                      if (originalPath) {
                        console.log("Retrying image fetch with authentication for:", originalPath);

                        fetchImageAsBlob(originalPath).then(blobUrl => {
                          if (blobUrl) {
                            console.log("Successfully fetched image as blob, updating src");
                            e.target.src = blobUrl;
                          } else {
                            throw new Error("Failed to fetch blob");
                          }
                        }).catch((err) => {
                          console.error("Failed to fetch image as blob:", err);
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        });
                      } else {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", photoUrl);
                    }}
                  />
                  <div className="w-28 h-28 rounded-2xl bg-white shadow-lg hidden items-center justify-center text-4xl font-semibold text-slate-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl font-semibold text-slate-700">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <label className="absolute -bottom-2 -right-2 bg-white border border-slate-200 rounded-full p-2 shadow-md cursor-pointer hover:bg-slate-50 transition">
                <svg
                  className="w-4 h-4 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={loading}
                />
              </label>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {user?.name}
                </h1>

                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${tagColors[user?.role] || tagColors.OWNER
                    }`}
                >
                  {user?.role === "VET" ? "Veterinarian" : "Pet Owner"}
                </span>
              </div>

              <p className="text-slate-600 text-sm">{user?.email}</p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="px-3 py-2 bg-white/70 border border-white/60 rounded-xl shadow-sm text-sm text-slate-700">
                  📞 {user?.phone || "Add phone"}
                </div>

                {user?.role === "VET" && (
                  <div className="px-3 py-2 bg-white/70 border border-white/60 rounded-xl shadow-sm text-sm text-slate-700">
                    🏥 {user?.clinicName || "Add clinic"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setEditing((prev) => !prev)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 transition"
              >
                {editing ? "Cancel" : "Edit Profile"}
              </button>

              <button
                onClick={async () => {
                  const refreshed = await authService.getProfile();
                  updateUser(refreshed);
                  resetForm();
                  setMessage({ type: "success", text: "Profile refreshed" });
                }}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 text-sm font-semibold shadow-sm hover:border-slate-300 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-2xl border text-sm font-medium ${message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Basic Information
                </h3>
                <p className="text-sm text-slate-500">
                  Keep your contact details up to date.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                    placeholder="10-digit number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                  placeholder="Street, City, State"
                />
              </div>

              {user?.role === "VET" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Clinic Details
                    </h3>
                    <p className="text-sm text-slate-500">
                      Show your clinic info to pet owners.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Clinic Name
                      </label>
                      <input
                        type="text"
                        name="clinicName"
                        value={profileData.clinicName}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                        placeholder="Happy Paws Clinic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleChange}
                        disabled={!editing}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                        placeholder="Surgery, Dental, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Clinic Address
                    </label>
                    <textarea
                      name="clinicAddress"
                      value={profileData.clinicAddress}
                      onChange={handleChange}
                      disabled={!editing}
                      rows="2"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 disabled:bg-slate-50"
                      placeholder="Clinic full address"
                    />
                  </div>
                </div>
              )}

              {editing && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setEditing(false);
                    }}
                    className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Account Details
              </h4>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-right">{user?.email}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-medium text-right">
                    {user?.userId}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Role</span>
                  <span className="font-medium text-right">
                    {user?.role === "VET" ? "Veterinarian" : "Pet Owner"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Tips
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Keep your phone number updated for reminders.</li>
                <li>Add your address to personalize pet services.</li>
                {user?.role === "VET" && (
                  <li>Show clinic info so owners can find you easily.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;