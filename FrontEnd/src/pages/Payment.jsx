// src/pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

/* ─────────────────────────────────────────────────────────── */

export default function Payment() {
  const { user, token, isAuthenticated } = useAuth();
  const { state } = useLocation();          // { cart, total, ownerId, restaurantName }
  const navigate = useNavigate();

  /* restaurant info */
  const [restaurant, setRestaurant] = useState(null); // { name, address, regNo }
  const [payMethod, setPayMethod] = useState("card");

  /* unauth form states */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [addrLink, setAddrLink] = useState("");

  /* fetch restaurant details once */
  useEffect(() => {
    if (!state?.ownerId) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8888/api/auth/users/${state.ownerId}`
        );
        setRestaurant({
          name: data.restaurantName || data.name || "Restaurant",
          address: data.address || "—",
          regNo: data.registerNumber || "UNKNOWN",
        });
      } catch {
        setRestaurant({
          name: state.restaurantName || "Restaurant",
          address: "Address unavailable",
          regNo: "UNKNOWN",
        });
      }
    })();
  }, [state]);

  /* pricing */
  const deliveryFee = 99;
  const serviceFee = 125;
  const subTotal = state?.total || 0;
  const grandTotal = subTotal + deliveryFee + serviceFee;

  /* ─────────── LOGGED‑IN FLOW ─────────── */
  if (isAuthenticated) {
    const placeOrder = async () => {
      if (!state) return alert("Cart is empty or invalid!");

      /* 1️⃣ build order object */
      const orderId = uuidv4().slice(0, 8).toUpperCase();
      const orderPayload = {
        user: user._id,
        orderId,
        paymentMethod: payMethod,
        restaurantName: restaurant?.name || "Unknown",
        restaurantAddress: restaurant?.address || "Unknown",
        restaurantRegisterNumber: restaurant?.regNo || "UNKNOWN",
        deliveryAddress: addrLink.trim() || "No address provided",
        totalAmount: grandTotal,
        cart: state.cart.map(({ name, qty, price }) => ({
          name, qty, price
        })),   // clean summary
      };

      /* 2️⃣ save order in DB */
      try {
        await axios.post(
          "http://localhost:8888/api/delivery/api/user-orders",
          orderPayload,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
      } catch (err) {
        console.error(err);
        return alert("Failed to save order. Please try again.");
      }

      /* 3️⃣ handle payment */
      if (payMethod === "card") {
        const payReq = {
          items: "Food Order",
          order_id: orderId,
          amount: grandTotal.toString(),
          currency: "LKR",
          first_name: user.firstName || "Unknown",
          last_name: user.lastName || "User",
          email: user.email || "email@example.com",
          phone: user.phone || "0000000000",
          address: addrLink.trim() || "No address provided",
          city: "Colombo",
          country: "Sri Lanka",
          restaurantRegNo: restaurant?.regNo || "UNKNOWN",
        };

        try {
          const resp = await fetch("http://localhost:8888/api/payment/payment/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payReq),
          });
          if (!resp.ok) throw new Error("Hash server error");
          const { hash, merchant_id } = await resp.json();

          window.payhere.startPayment({
            sandbox: true,
            merchant_id,
            return_url: "http://localhost:8888/api/payment/payment/success",
            cancel_url: "http://localhost:8888/api/payment/payment/cancel",
            notify_url: "http://sample.com/notify",
            order_id: payReq.order_id,
            items: payReq.items,
            amount: payReq.amount,
            currency: payReq.currency,
            first_name: payReq.first_name,
            last_name: payReq.last_name,
            email: payReq.email,
            phone: payReq.phone,
            address: payReq.address,
            city: payReq.city,
            country: payReq.country,
            custom_1: payReq.restaurantRegNo, // register number to PayHere
            hash,
          });
        } catch (err) {
          console.error(err);
          alert("Payment initiation failed");
        }
      } else {
        alert("Order placed successfully!");
        navigate("/");
      }
    };

    /* ─────────── logged‑in JSX ─────────── */
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-grow max-w-screen-xl mx-auto w-full grid lg:grid-cols-3 gap-6 px-4 py-8">
          {/* LEFT column */}
          <section className="lg:col-span-2 space-y-8">
            <Block title="Delivery details">
              <textarea
                placeholder="Enter Google‑Maps link"
                value={addrLink}
                onChange={(e) => setAddrLink(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
              />
            </Block>

            <Block title="Payment">
              <Radio id="card" checked={payMethod === "card"} onChange={() => setPayMethod("card")} label="Debit / Credit Card" />
              <Radio id="cash" checked={payMethod === "cash"} onChange={() => setPayMethod("cash")} label="Cash on Delivery" />
            </Block>

            <button className="w-full bg-black text-white py-3 rounded" onClick={placeOrder}>
              Place Order
            </button>
          </section>

          {/* RIGHT column */}
          <aside className="space-y-6">
            <div className="border rounded px-4 py-5 space-y-2 bg-white">
              <h3 className="font-semibold">{restaurant?.name}</h3>
              <p className="text-sm text-gray-600">{restaurant?.address}</p>
              <p className="text-xs text-gray-500">Reg No: {restaurant?.regNo}</p>
            </div>

            <Block title={`Cart summary (${state.cart.length} items)`}>
              <ul className="text-sm divide-y">
                {state.cart.map((itm) => (
                  <li key={itm._id} className="py-2 flex justify-between">
                    <span>{itm.qty} × {itm.name}</span>
                    <span>Rs {(itm.price * itm.qty).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Order total">
              <SummaryRow label="Subtotal" value={subTotal} />
              <SummaryRow label="Delivery Fee" value={deliveryFee} />
              <SummaryRow label="Service Fee" value={serviceFee} />
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>LKR {grandTotal.toLocaleString()}</span>
              </div>
            </Block>
          </aside>
        </div>

        <Footer />
      </div>
    );
  }

  /* ─────────── NOT LOGGED‑IN FLOW ─────────── */

  const handleContinue = async () => {
    try {
      const { data } = await axios.get("http://localhost:8888/api/auth/users/", {
        headers: { Authorization: "Bearer dummy-token-check" },
      });
      data.find((u) => u.email === email) ? setShowPwd(true) : setShowReg(true);
    } catch (err) { console.error(err); }
  };

  const submitPassword = () => {
    setShowPwd(false);
    alert("Login Successful! Redirecting to payment…");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            What's your phone number or email?
          </h2>
          <input
            type="email"
            placeholder="Enter phone number or email"
            className="w-full p-3 border border-gray-300 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleContinue}
            className="w-full bg-black text-white py-3 rounded mb-6"
          >
            Continue
          </button>
          <Divider />
          <button
            onClick={() => alert("Google Sign‑in coming soon")}
            className="flex items-center justify-center w-full border border-gray-300 py-3 rounded"
          >
            <img src="/google-icon.png" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
        </div>
      </div>

      <Footer />

      {showPwd && (
        <Modal>
          <h3 className="text-xl font-semibold mb-4">Enter your password</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={submitPassword}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Login
          </button>
        </Modal>
      )}

      {showReg && (
        <Modal>
          <h3 className="text-xl font-semibold mb-4">
            You need to register first
          </h3>
          <div className="flex justify-end">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register Now
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ───────── helper components ───────── */

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <Link to="/" className="flex items-center gap-2">
        <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
        <span className="text-xl font-semibold">FasterEats</span>
      </Link>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">
      © 2025 FasterEats – All rights reserved
    </footer>
  );
}

function Block({ title, children }) {
  return (
    <div className="bg-white border rounded p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>LKR {value.toLocaleString()}</span>
    </div>
  );
}

function Radio({ id, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="radio" name="pay" id={id} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex-grow h-px bg-gray-300" />
      <span className="text-gray-500 text-sm">or</span>
      <div className="flex-grow h-px bg-gray-300" />
    </div>
  );
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">{children}</div>
    </div>
  );
}
