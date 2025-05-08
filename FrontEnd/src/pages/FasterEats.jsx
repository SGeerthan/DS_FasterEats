// src/pages/FasterEats.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import {
  AiOutlineEdit,
  AiOutlineLogout,
  AiOutlineCamera,
  AiFillStar,
  AiOutlineStar,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";

/* ------------------------------------------------------------------ */
/*  dummy data – replace with API calls when you wire the backend     */
/* ------------------------------------------------------------------ */
const categories = [
  { name: "Biryani", img: "/public/briyani.png" },
  { name: "Pizza",  img: "/public/pizza.png"   },
  { name: "Cake",   img: "/public/cake.png"    },
  { name: "Idli",   img: "/public/idli.png"    },
  { name: "Chinese",img: "/public/noodles.png" },
  { name: "Dosa",   img: "/public/dosa.png"    },
  { name: "Pasta",  img: "/public/pasta (2).png" },
  { name: "Momo",   img: "/public/momo.png"    },
  { name: "Rolls",  img: "/public/rolls.png"   },
  { name: "Kebab",  img: "/public/kebab.png"   },
];

const restaurants = [
  {
    name: "Lord of the Drinks",
    cuisines: "Continental • North Indian",
    price: "Rs 2500 for two",
    distance: "4.7 km",
    img: "/public/res1.jpeg",
    discount: "40 % OFF",
  },
  {
    name: "Enoki",
    cuisines: "Chinese • Sushi",
    price: "Rs 1200 for two",
    distance: "1.4 km",
    img: "/public/res2.jpg",
    discount: "20 % OFF",
  },
  {
    name: "Message In A Bottle",
    cuisines: "Chinese • North Indian",
    price: "Rs 1600 for two",
    distance: "1.4 km",
    img: "/public/res4.jpg",
    discount: "30 % OFF",
  },
  {
    name: "Mamagoto",
    cuisines: "Chinese • Asian",
    price: "Rs 1800 for two",
    distance: "2.2 km",
    img: "/public/res3.jpeg",
    discount: "25 % OFF",
  },
];

export default function FasterEats() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);

  

  // fetch profile when sidebar opens
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

  const goSearch = () => {
    if (keyword.trim()) {
      navigate(`/ListFoods?search=${encodeURIComponent(keyword)}`);
    }
  };
  const showAllFoods = () => navigate("/ListFoods");

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

  return (
    <div className="font-sans antialiased">
      {/* ---------------- Header ---------------- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">FasterEats</span>
        </Link>
        {user ? (
          <button onClick={() => setShowSidebar(true)} className="focus:outline-none">
            <img src={user.profilePicture || "/public/avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
          </button>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="flex items-center px-5 py-2 font-medium rounded-full hover:bg-gray-100 transition">
              <AiOutlineLogin className="mr-2" /> Sign in
            </Link>
            <Link to="/register" className="flex items-center px-5 py-2 font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition">
              <AiOutlineUserAdd className="mr-2" /> Sign up
            </Link>
          </div>
        )}
      </header>

      {/* ---------------- Sidebar ---------------- */}
      {showSidebar && user && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowSidebar(false)} />
          <aside className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg z-50 overflow-y-auto p-6">
            <button onClick={() => setShowSidebar(false)} className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black">×</button>
            {loadingProfile && <div>Loading…</div>}
            {errorProfile && <div className="text-red-600">{errorProfile}</div>}
            {profile && (
              <>
                <div className="relative w-24 h-24 mx-auto">
                  <img src={profile.profilePicture || "/public/avatar.png"} alt="avatar" className="w-full h-full rounded-full object-cover border" />
                  <label className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full cursor-pointer shadow">
                    <AiOutlineCamera />
                    <input type="file" className="hidden" accept="image/*" onChange={changePic} />
                  </label>
                </div>
                <h3 className="text-2xl font-semibold text-center mt-4">{profile.restaurantName || `${profile.firstName} ${profile.lastName}`}</h3>
                <p className="text-center text-gray-600">{profile.email}</p>
                {profile.address && <p className="text-center text-gray-500 mt-1">{profile.address}</p>}
                {profile.phone && <p className="text-center text-gray-500 mt-1">{profile.phone}</p>}
                {profile.registerNumber && <p className="text-center text-gray-400 text-sm mt-1">Reg #: {profile.registerNumber}</p>}
                {profile.dateOfBirth && <p className="text-center text-gray-400 text-sm mt-1">DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}</p>}
                {(profile.role === "restaurantOwner" || profile.role === "deliveryPerson") && (
                  <div className="flex justify-center mt-2 space-x-1">
                    {[1,2,3,4,5].map(v => v <= Math.round(profile.rating||0) ? (<AiFillStar key={v} className="text-yellow-500"/>) : (<AiOutlineStar key={v} className="text-gray-400"/>))}
                    <span className="ml-2 text-sm text-gray-600">{(profile.rating||0).toFixed(1)} /5</span>
                  </div>
                )}
                <div className="flex justify-center gap-4 mt-6">
                  <button onClick={()=>{navigate("/profile/edit");setShowSidebar(false)}} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    <AiOutlineEdit className="mr-2" /> Edit Profile
                  </button>
                  <button onClick={handleLogout} className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                    <AiOutlineLogout className="mr-2" /> Logout
                  </button>
                </div>
                <nav className="mt-8 space-y-3 text-[15px]">
                  <Link to="/profile" onClick={()=>setShowSidebar(false)} className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded px-2">
                    <AiOutlineUser className="text-xl"/> Manage Account
                  </Link>
                  <Link to="/MyOrders" onClick={()=>setShowSidebar(false)} className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded px-2">
                    <AiOutlineShoppingCart className="text-xl"/> My Orders
                  </Link>
                </nav>
              </>
            )}
          </aside>
        </>
      )}

      {/* ---------------- Hero ---------------- */}
      <section className="relative bg-orange-500 text-white overflow-hidden">
  {/* Right image fixed to top-right */}
  <img
    src="/public/kkk.webp"
    alt="Groceries"
    className="hidden md:block absolute top-0 right-0 w-82 h-auto z-0 pointer-events-none"
  />

  <div className="max-w-8xl mx-auto flex flex-col md:flex-row items-start px-4 py-16 md:py-10 relative z-10 gap-10">

    {/* Left image */}
    <div className="flex-shrink-0 md:ml-[80px]">
      <img
        src="/public/RIDER.png"
        alt="Delivery Rider"
        className="w-[300px] md:w-[380px] h-auto"
      />
    </div>

    {/* Content */}
    <div className="text-left w-full md:w-3/5 md:ml-[-30px]">
      <h1 className="text-3xl md:text-5xl font-bold leading-tight">
        <div className="mb-2">Order food & groceries.</div>
        <div className="mb-6">Discover best restaurants.</div>
        <div className="text-black/70 text-2xl md:text-4xl font-semibold mb-6">FasterEats it!</div>
      </h1>

      {/* Search Bar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
        <select
          className="flex-1 md:max-w-xs px-4 py-3 rounded-lg text-gray-700 text-base"
          defaultValue="Colombo"
        >
          {["Colombo", "Kandy", "Galle", "Jaffna", "Matara"].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Search for restaurant, item"
          className="flex-1 px-4 py-3 rounded-lg text-gray-700 text-base"
        />
        <button
          onClick={goSearch}
          className="px-6 py-3 bg-white text-orange-600 text-base font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Search
        </button>
        <button
          onClick={showAllFoods}
          className="px-6 py-3 bg-black/30 hover:bg-black/40 text-white text-base font-semibold rounded-lg transition"
        >
          Show All Foods
        </button>
      </div>
    </div>
  </div>
</section>





      {/* ---------------- Categories ---------------- */}
      <section className="max-w-screen-xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-semibold mb-6">What’s on your mind?</h2>
      <div className="flex overflow-x-auto gap-10 pb-4">
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => navigate(`/ListFoods?search=${encodeURIComponent(c.name)}`)}
            className="flex-shrink-0 text-center w-28 focus:outline-none"
          >
            <img
              src={c.img}
              alt={c.name}
              className="w-28 h-28 object-cover rounded-full"
            />
            <p className="mt-2 font-medium">{c.name}</p>
          </button>
        ))}
      </div>
    </section>

      {/* ---------------- Partner / Courier signup ---------------- */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <Link to="/register?role=restaurantOwner" className="relative h-64 rounded-2xl overflow-hidden group">
            <img src="/public/kitchen.jpg" alt="Add your restaurant" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"/>
            <div className="relative z-10 flex flex-col justify-end h-full p-6">
              <h3 className="text-center text-3xl font-bold text-white mb-3">Your restaurant, delivered</h3>
              <span className="mx-auto px-4 py-2 bg-white text-black text-sm font-semibold rounded-full group-hover:bg-orange-500 group-hover:text-white transition">Add your restaurant</span>
            </div>
          </Link>
          <Link to="/register?role=deliveryPerson" className="relative h-64 rounded-2xl overflow-hidden group">
            <img src="/public/delivery.jpeg" alt="Sign up to deliver" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"/>
            <div className="relative z-10 flex flex-col justify-end h-full p-6">
              <h3 className="text-center text-3xl font-bold text-white mb-3">Deliver with FasterEats</h3>
              <span className="mx-auto px-4 py-2 bg-white text-black text-sm font-semibold rounded-full group-hover:bg-orange-500 group-hover:text-white transition">Sign up to deliver</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ---------------- Restaurants with offers ---------------- */}
      <section className="max-w-screen-xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">Discover best restaurants with offers</h2>
        <div className="flex overflow-x-auto gap-6 pb-4">
          {restaurants.map(r=>(
            <div key={r.name} className="relative flex-shrink-0 w-80 rounded-2xl shadow hover:shadow-lg transition">
              <img src={r.img} alt={r.name} className="w-full h-48 object-cover rounded-t-2xl"/>
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">{r.discount}</span>
              <div className="p-4 space-y-1">
                <h3 className="font-semibold">{r.name}</h3>
                <p className="text-sm text-gray-600">{r.cuisines}</p>
                <div className="flex justify-between text-sm text-gray-600"><span>{r.price}</span><span>{r.distance}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="bg-gray-100 mt-24">
        <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8"/>
              <span className="text-lg font-semibold">FasterEats</span>
            </div>
            <p className="text-gray-500">© 2025 FasterEats (Pvt) Ltd</p>
          </div>
          {/* remaining footer columns unchanged */}
        </div>
      </footer>
    </div>
  );
}
