// src/pages/Delivery.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import MapButton from "./MapButton";

export default function Delivery() {
  const navigate = useNavigate();
  const { user, token: authCtxToken, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [busyIds, setBusyIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const getToken = () =>
    authCtxToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = getToken();

    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5004/api/user-order/pick-up",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ Load orders failed:", e);
        setError("Failed to load pending orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const onAccept = useCallback(
    async (ord) => {
      // flip UI immediately
      setBusyIds((s) => new Set(s).add(ord.orderId));
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === ord.orderId ? { ...o, deliveryStatus: "ON-THE-WAY" } : o
        )
      );

      try {
        // send only the needed details—no token in the body
        await axios.post("http://localhost:5003/api/drivers/accept", {
          orderId: ord.orderId,
          driverName: `${user.firstName} ${user.lastName}`,
          deliveryAddress: ord.deliveryAddress,
          restaurantAddress: ord.restaurentAddress,
        });

        // clear busy flag
        setBusyIds((s) => {
          const n = new Set(s);
          n.delete(ord.orderId);
          return n;
        });
      } catch (err) {
        console.error("❌ Accept error:", err);
        alert(
          err.response?.data?.message || "Server error – could not accept order"
        );
        // rollback UI
        setBusyIds((s) => {
          const n = new Set(s);
          n.delete(ord.orderId);
          return n;
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === ord.orderId ? { ...o, deliveryStatus: "PENDING" } : o
          )
        );
      }
    },
    [user]
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl mb-4">Please login to accept deliveries.</p>
        <Link to="/login" className="px-4 py-2 bg-black text-white rounded">
          Login
        </Link>
      </div>
    );
  }
  if (loading) return <p className="text-center py-20">Loading…</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="font-sans antialiased flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/public/FasterEatsLogo.png"
            alt="logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-semibold">FasterEats – Delivery</span>
        </Link>
        {user && (
          <button
            onClick={() => setShowProfile(true)}
            className="focus:outline-none"
          >
            <img
              src={user.profilePicture || "/public/avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Pending Deliveries
        </h1>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No pending orders.</p>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {orders.map((o) => {
              const processing =
                o.deliveryStatus === "ON-THE-WAY" || busyIds.has(o.orderId);
              return (
                <div
                  key={o.orderId}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {o.restaurentName}
                    </h2>
                    <span className="text-sm font-medium">
                      {o.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <p>
                    <strong>Order ID:</strong> {o.orderId}
                  </p>
                  <p>
                    <strong>Pickup Address:</strong> {o.restaurentAddress}
                  </p>
                  <p>
                    <strong>Delivery Address:</strong> {o.deliveryAddress}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹ {o.totalAmount.toLocaleString()}
                  </p>
                  <div className="mt-4 flex flex-row justify-between">
                    <div>
                    {processing ? (
                      <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-xs">
                        On&nbsp;the&nbsp;Way
                      </span>
                    ) : (
                      <button
                        onClick={() => onAccept(o)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Accept Delivery
                      </button>
                    )}
                    </div>
                    <div>

                    <MapButton
                      order={[o.restaurentAddress, o.deliveryAddress]}
                    />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-auto py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} FasterEats (Pvt) Ltd
      </footer>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
