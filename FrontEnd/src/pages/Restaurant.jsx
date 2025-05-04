// src/pages/Restaurant.jsx
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Banner from "./RestaurantBanner";
import DishModal from "./DishModal";
import ProfileModal from "../components/ProfileModal";
import { FaPlus } from "react-icons/fa";

/* row component */
function Row({ dish, onEdit, onDelete }) {
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-2 px-4">
        {dish.image && (
          <img src={dish.image} alt="" className="w-14 h-14 object-cover rounded" />
        )}
      </td>
      <td className="py-2 px-4">{dish.name}</td>
      <td className="py-2 px-4">{dish.price}</td>
      <td className="py-2 px-4 space-x-4">
        <button
          onClick={() => onEdit(dish)}
          className="text-blue-600 hover:underline text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(dish._id)}
          className="text-red-600 hover:underline text-sm"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Restaurant() {
  const { token, user, loading } = useAuth();

  const [foods, setFoods]       = useState([]);
  const [banners, setBanners]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const authH = token ? { Authorization: `Bearer ${token}` } : {};

  /* fetch only my dishes */
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const [dishRes, bannerRes] = await Promise.all([
        axios.get("http://localhost:5560/foods/my", { headers: authH }),           // ← changed
        axios.get("http://localhost:5560/restaurant-images/my", { headers: authH })
      ]);
      setFoods(dishRes.data);
      setBanners(bannerRes.data);
    };

    load();
    const refresh = () => load();
    window.addEventListener("foods:invalidate", refresh);
    return () => window.removeEventListener("foods:invalidate", refresh);
  }, [token]);

  /* upload banner */
  const uploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    await axios.post("http://localhost:5560/restaurant-images", fd, {
      headers: { ...authH, "Content-Type": "multipart/form-data" }
    });
    setUploading(false);
    window.dispatchEvent(new Event("foods:invalidate"));
  };

  /* delete dish */
  const deleteDish = async (id) => {
    await axios.delete(`http://localhost:5560/foods/${id}`, { headers: authH });
    setFoods((cur) => cur.filter((d) => d._id !== id));
  };

  /* guards */
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "restaurantOwner") return <Navigate to="/" replace />;

  return (
    <div className="font-sans antialiased">
      {/* header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">
            FasterEats – Restaurant Owner
          </span>
        </Link>

        <button onClick={() => setShowProfile(true)} className="focus:outline-none">
          <img
            src={user.profilePicture || "/public/avatar.png"}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </button>
      </header>

      {/* banner */}
      <section className="relative">
        <Banner imgs={banners} />
        <label className="absolute top-3 right-6 bg-white/80 px-3 py-1 rounded shadow text-sm cursor-pointer">
          {uploading ? "Uploading…" : "Upload Image"}
          <input type="file" hidden accept="image/*" onChange={uploadBanner} />
        </label>
      </section>

      {/* add dish */}
      <section className="max-w-screen-lg mx-auto py-10 px-6">
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          <FaPlus /> Add new dish
        </button>
      </section>

      {/* dish table */}
      <section className="max-w-screen-lg mx-auto pb-20 px-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg text-left">
            <thead className="bg-gray-50 text-sm uppercase">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Price (Rs)</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((d) => (
                <Row key={d._id} dish={d} onEdit={setModal} onDelete={deleteDish} />
              ))}
              {!foods.length && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-500">
                    No dishes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
        © 2025 FasterEats – Restaurant Dashboard
      </footer>

      {/* modals */}
      {modal !== null && (
        <DishModal
          token={token}
          initial={modal}
          onClose={() => setModal(null)}
          afterSave={() => window.dispatchEvent(new Event("foods:invalidate"))}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
