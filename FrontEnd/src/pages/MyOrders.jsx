// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineCamera,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlinePhone,
} from "react-icons/ai";

export default function Orders() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar/profile state
  const [showSidebar, setShowSidebar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);

  // Fetch profile when sidebar opens
  useEffect(() => {
    if (!showSidebar || !user) return;
    setLoadingProfile(true);
    (async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5559/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(data);
      } catch (err) {
        console.error(err);
        setErrorProfile("Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [showSidebar, user]);

  const changePic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profilePicture", file);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5559/users/upload-profile",
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
      setErrorProfile("Upload failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy order data
  const dummyOrder = {
    _id: "dummy-62AC31EE",
    restaurentName: "avaniya",
    paymentMethod: "cash",
    orderId: "62AC31EE",
    deliveryAddress: "dematagoda",
    totalAmount: 1134,
    createdAt: new Date("2025-04-29T16:55:16"),
    driverName: "thano",
    driverPhone: "0755444984",
    status: "OnTheWay",
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5004/api/user-orders/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Prepend dummy order
        setOrders([dummyOrder, ...(Array.isArray(data) ? data : [])]);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold mb-4">
          Please login to view your orders.
        </p>
        <Link to="/login" className="px-4 py-2 bg-black text-white rounded">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/public/FasterEatsLogo.png"
            alt="logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-semibold">FasterEats</span>
        </Link>
        {user ? (
          <button
            onClick={() => setShowSidebar(true)}
            className="focus:outline-none"
          >
            <img
              src={user.profilePicture || "/public/avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="flex items-center px-5 py-2 font-medium rounded-full hover:bg-gray-100 transition"
            >
              <AiOutlineLogin className="mr-2" /> Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center px-5 py-2 font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition"
            >
              <AiOutlineUserAdd className="mr-2" /> Sign up
            </Link>
          </div>
        )}
      </header>

      {/* Sidebar */}
      {showSidebar && user && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowSidebar(false)}
          />
          <aside className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg z-50 overflow-y-auto p-6">
            <button
              onClick={() => setShowSidebar(false)}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
            >
              ×
            </button>
            {loadingProfile && <div>Loading…</div>}
            {errorProfile && (
              <div className="text-red-600">{errorProfile}</div>
            )}
            {profile && (
              <>
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={profile.profilePicture || "/public/avatar.png"}
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
                  {profile.restaurantName ||
                    `${profile.firstName} ${profile.lastName}`}
                </h3>
                <p className="text-center text-gray-600">{profile.email}</p>
                {profile.address && (
                  <p className="text-center text-gray-500 mt-1">
                    {profile.address}
                  </p>
                )}
                {profile.phone && (
                  <p className="text-center text-gray-500 mt-1">
                    {profile.phone}
                  </p>
                )}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      navigate("/profile/edit");
                      setShowSidebar(false);
                    }}
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
                <nav className="mt-8 space-y-3 text-[15px]">
                  <Link
                    to="/profile"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded px-2"
                  >
                    <AiOutlineUser className="text-xl" /> Manage Account
                  </Link>
                  <Link
                    to="/MyOrders"
                    onClick={() => setShowSidebar(false)}
                    className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded px-2"
                  >
                    <AiOutlineShoppingCart className="text-xl" /> My Orders
                  </Link>
                </nav>
              </>
            )}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Orders</h1>
        <div className="grid gap-6 max-w-4xl mx-auto">
          {orders.map((order) => {
            const isOnTheWay = order.status === "OnTheWay";
            return (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {order.restaurentName}
                  </h2>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      order.paymentMethod === "cash"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {order.paymentMethod.toUpperCase()}
                  </span>
                </div>

                <div className="text-gray-700 text-sm space-y-1">
                  <p>
                    <strong>Order ID:</strong> {order.orderId}
                  </p>
                  <p>
                    <strong>Delivery Address:</strong> {order.deliveryAddress}
                  </p>
                  <p>
                    <strong>Total:</strong> LKR{" "}
                    {order.totalAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Placed On:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  {isOnTheWay && (
                    <>
                      <p>
                        <strong>Delivery Person:</strong> {order.driverName}
                      </p>
                      <p>
                        <strong>Delivery Person #:</strong>{" "}
                        {order.driverPhone}
                      </p>
                    </>
                  )}
                </div>

                {isOnTheWay && (
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      <AiOutlinePhone className="mr-2" />
                      Call
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-24">
        <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/public/FasterEatsLogo.png"
                alt="logo"
                className="w-8 h-8"
              />
              <span className="text-lg font-semibold">FasterEats</span>
            </div>
            <p className="text-gray-500">© 2025 FasterEats (Pvt) Ltd</p>
          </div>
          {/* ...other footer columns... */}
        </div>
      </footer>
    </div>
  );
}
