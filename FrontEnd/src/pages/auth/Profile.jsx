import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";  // corrected path
import {
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineCamera,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5559/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(data);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changePic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profilePicture", file);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5559//users/upload-profile",
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfile((p) => ({ ...p, profilePicture: data.url }));
    } catch {
      setError("Upload failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Guard for loading or missing profile
  if (loading || !profile) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow">
          {loading ? 'Loading…' : 'No profile data.'}
        </div>
      </div>
    );
  }

  // Show error if exists
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white p-6 rounded shadow" onClick={(e) => e.stopPropagation()}>
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const isTaxpayer = profile.role === "taxpayer";
  const isRestaurant = profile.role === "restaurantOwner";
  const isCourier = profile.role === "deliveryPerson";
  const showRating = isRestaurant || isCourier;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <div className="relative w-24 h-24 mx-auto">
          <img
            src={profile.profilePicture || "/default-profile.png"}
            alt="avatar"
            className="w-full h-full rounded-full object-cover border"
          />
          <label className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full cursor-pointer shadow">
            <AiOutlineCamera />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={changePic}
            />
          </label>
        </div>

        <h3 className="text-2xl font-semibold text-center mt-4">
          {isRestaurant ? profile.restaurantName : `${profile.firstName} ${profile.lastName}`}
        </h3>

        {isRestaurant && profile.address && (
          <p className="text-center text-gray-500 mt-1">{profile.address}</p>
        )}

        <p className="text-center text-gray-600">{profile.email}</p>

        {isCourier && profile.phone && (
          <p className="text-center text-gray-600">{profile.phone}</p>
        )}

        {profile.registerNumber && (
          <p className="text-center text-sm text-gray-400">
            Reg #: {profile.registerNumber}
          </p>
        )}

        {isTaxpayer && profile.dateOfBirth && (
          <p className="text-center text-sm text-gray-400">
            DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}
          </p>
        )}

        {showRating && (
          <div className="flex justify-center mt-2">
            {[1, 2, 3, 4, 5].map((v) =>
              v <= Math.round(profile.rating || 0) ? (
                <AiFillStar key={v} className="text-yellow-500" />
              ) : (
                <AiOutlineStar key={v} className="text-gray-400" />
              )
            )}
            <span className="ml-2 text-sm text-gray-600">
              {profile.rating?.toFixed(1) || "0.0"} /5
            </span>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => navigate("/profile/edit")}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <AiOutlineEdit className="mr-2" /> Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            <AiOutlineLogout className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
