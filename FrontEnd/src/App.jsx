import React from "react";
import { Routes, Route } from "react-router-dom";

/* ───── Common Pages ───── */
import Home from "./pages/Home.jsx";

/* ───── Auth Pages ───── */
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import IndexProfile from "./pages/auth/IndexProfile.jsx";
import Profile from "./pages/auth/Profile.jsx";
import AuthSuccess from "./pages/auth/AuthSuccess.jsx";
import EditProfile from "./pages/auth/EditProfile.jsx";
import ForgetPassword from "./pages/auth/ForgetPassword.jsx";

/* ───── App Pages ───── */
import FasterEats from "./pages/FasterEats.jsx";
import Delivery from "./pages/Delivery.jsx";
import Restaurant from "./pages/Restaurant.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Payment from "./pages/Payment.jsx";
import ListFoods from "./pages/ListFoods.jsx";
import MyOrders from "./pages/MyOrders.jsx";

/* ───── Demo Post ───── */
import postData from "./data/post.json";
import StudyPostCard from "./components/StudyPostCard.jsx";

export default function App() {
  return (
    <Routes>
      {/* ─── Public Routes ─── */}
      <Route path="/" element={<FasterEats />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/restaurant" element={<Restaurant />} />
      <Route path="/ListFoods" element={<ListFoods />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/MyOrders" element={<MyOrders />} />

      {/* ─── Authentication ─── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profileIndex" element={<IndexProfile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />

      {/* ─── Study Demo ─── */}
      <Route
        path="/study-post"
        element={
          <StudyPostCard
            profileImage={postData.profileImage}
            heading={postData.heading}
            progressItems={postData.progressItems}
          />
        }
      />

      {/* ─── Fallback 404 ─── */}
      <Route
        path="*"
        element={
          <h1 className="p-10 text-center text-2xl">404 – Page Not Found</h1>
        }
      />
    </Routes>
  );
}
