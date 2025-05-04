// src/pages/profile/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import {
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlineLogin,
  AiOutlineUserAdd,
} from "react-icons/ai";

export default function EditProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Redirect based on role
  const handleClose = () => {
    if (user.role === "taxpayer") navigate("/");
    else if (user.role === "restaurantOwner") navigate("/restaurant");
    else if (user.role === "deliveryPerson") navigate("/delivery");
    else navigate("/");
  };

  // Fetch existing profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5559/users/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          dateOfBirth: data.dateOfBirth?.split("T")[0] || "",
          password: "",
          confirmPassword: "",
        });
        setPreviewImage(data.profilePicture || "/default-profile.png");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, profilePicture: "Only JPG or PNG files allowed" }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profilePicture: "File must be <2MB" }));
      return;
    }
    setPreviewImage(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, profilePicture: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    if (formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        "http://localhost:5559/users/update",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          password: formData.password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">FasterEats</span>
        </Link>
        <div className="flex gap-4">
          {user ? (
            <Link to="/profile" className="focus:outline-none">
              <img
                src={user.profilePicture || "/public/avatar.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <p className="text-blue-100">Update your account information</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-200"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>
          <div className="p-6">
            
            <form onSubmit={handleSubmit}>
              {/* Personal Info Section */}
              <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  <AiOutlineUser className="mr-2 text-blue-500" /> Personal Information
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0 relative group">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md">
                      <AiOutlineCamera size={18} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                      />
                    </label>
                    {errors.profilePicture && (
                      <p className="text-red-500 text-xs mt-2">{errors.profilePicture}</p>
                    )}
                  </div>
                  <div className="flex-grow space-y-4">
                    {/* First Name  */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    {/* Last Name  */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <div className="relative">
                        <AiOutlineCalendar className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Basic Settings Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">...</div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-24">...</footer>
    </div>
  );
}
