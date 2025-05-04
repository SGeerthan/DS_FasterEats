import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import TermsCondition from "./TermsCondition.jsx";

const API_URL = "http://localhost:5559/users/register";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // pick up ?role=… (defaults to "taxpayer")
  const roleParam = new URLSearchParams(useLocation().search).get("role") || "taxpayer";

  const [form, setForm] = useState({
    firstName:       "",
    lastName:        "",
    email:           "",
    dateOfBirth:     "",
    role:            roleParam,
    password:        "",
    confirmPassword: "",
    restaurantName:  "",
    address:         "",
    phone:           "",
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [showTC,  setShowTC]  = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  // role flags
  const isAdmin      = form.role === "admin";
  const isRestaurant = form.role === "restaurantOwner";
  const isCourier    = form.role === "deliveryPerson";

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setShowTC(true);
  };

  const acceptTerms = async () => {
    setShowTC(false);
    setLoading(true);
    try {
      const { data } = await axios.post(API_URL, form);
      login(data.token, data.user, true);
      navigate(
        data.user.role === "restaurantOwner"
          ? "/restaurant"
          : data.user.role === "deliveryPerson"
          ? "/delivery"
          : data.user.role === "admin"
          ? "/AdminDashboard"       // or wherever your admin landing is
          : "/profile"
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // optional OAuth flows
  const googleLogin   = () => (window.location.href = "http://localhost:5559/auth/google");
  const facebookLogin = () => (window.location.href = "http://localhost:5559/auth/facebook");

  return (
    <div
      className="w-screen h-screen flex flex-col"
      style={{
        backgroundImage: "url('/backrd4.png')",
        backgroundSize:   "cover",
        backgroundPosition:"center",
      }}
    >
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white/90 p-10 rounded-lg shadow-xl w-[28rem] backdrop-blur-md">
          {error && <p className="text-red-600 text-center mb-3">{error}</p>}

          {/* OAuth buttons */}
          <div className="flex justify-between mb-4 gap-2">
            <button
              onClick={googleLogin}
              className="flex items-center justify-center flex-1 py-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50"
            >
              <FcGoogle className="w-5 h-5 mr-2" /> Google
            </button>
            <button
              onClick={facebookLogin}
              className="flex items-center justify-center flex-1 py-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50"
            >
              <FaFacebook className="w-5 h-5 mr-2 text-blue-600" /> Facebook
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Restaurant-owner fields */}
            {isRestaurant && (
              <>
                <input
                  name="restaurantName"
                  placeholder="Restaurant Name"
                  value={form.restaurantName}
                  onChange={onChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  name="address"
                  placeholder="Address (Google Maps)"
                  value={form.address}
                  onChange={onChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </>
            )}

            {/* First/Last name for courier, taxpayer or admin */}
            {(isCourier || form.role === "taxpayer" || isAdmin) && (
              <>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={onChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={onChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={onChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* Phone for restaurant & courier */}
            {(isRestaurant || isCourier) && (
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={onChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}

            {/* DOB for taxpayers */}
            {form.role === "taxpayer" && (
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={onChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}

            {/* Password */}
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPw(p => !p)}
              >
                {showPw ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showCpw ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={onChange}
                required
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowCpw(p => !p)}
              >
                {showCpw ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {loading ? "Registering…" : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Terms & Conditions modal */}
      {showTC && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <TermsCondition
            onAccept={acceptTerms}
            onCancel={() => setShowTC(false)}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
