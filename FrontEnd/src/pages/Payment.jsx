import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // make sure you installed uuid
const payhere = window.payhere;


export default function Payment() {
  const { user, isAuthenticated } = useAuth();
  const { state } = useLocation(); // expects { cart, total, ownerId, restaurantName }
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null); // {name, address}
  const [payMethod, setPayMethod] = useState("card"); // 'card' | 'cash'

  // unauth screens
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPwd] = useState(false);
  const [showRegisterModal, setShowReg] = useState(false);
  const [addrLink, setAddrLink] = useState("");

  // fetch restaurant info once
  useEffect(() => {
    if (!state?.ownerId) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5559/users/${state.ownerId}`
        );
        setRestaurant({
          name: data.restaurantName || data.name || "Restaurant",
          address: data.address || "—",
        });
      } catch {
        setRestaurant({
          name: state.restaurantName || "Restaurant",
          address: "Address unavailable",
        });
      }
    })();
  }, [state]);

  // pricing
  const deliveryFee = 99;
  const serviceFee = 125;
  const subTotal = state?.total || 0;
  const grandTotal = subTotal + deliveryFee + serviceFee;

  async function placeOrder() {
    const payload = {
      user: user._id,
      orderId: uuidv4().slice(0, 8).toUpperCase(),
      paymentMethod: payMethod,
      restaurentName: restaurant?.name || "Unknown",
      deliveryAddress: addrLink || "No address provided",
      restaurentAddress: restaurant?.address || "No address provided",
      totalAmount: grandTotal,
    };

    try {
      const { data } = await axios.post(
        "http://localhost:5004/api/user-orders/",
        payload,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      alert(
        `Order placed successfully!${
          data?.coupon ? "\nCoupon: " + data.coupon.code : ""
        }`
      );
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    }
  }


  async function startCardPayment() {
    const paymentDetails = {
      items: state?.cart?.map((item) => item.name).join(", ") || "Product",
      order_id: `ORDER-${Date.now()}`,
      amount: grandTotal.toString(),
      currency: "LKR",
      first_name: user?.firstName || "Unknown",
      last_name: user?.lastName || "User",
      email: user?.email || "email@example.com",
      phone: user?.phone || "0000000000",
      address: user?.addressLine || "No address provided",
      city: "Colombo",
      country: "Sri Lanka",
    };

    try {
      const response = await fetch("http://localhost:5025/payment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
      });

      if (response.ok) {
        const { hash, merchant_id } = await response.json();

        const payment = {
          sandbox: true,
          merchant_id: merchant_id,
          return_url: "http://localhost:5173/success",
          cancel_url: "http://localhost:5173/cancel",
          notify_url: "http://localhost:5173/notify",
          order_id: paymentDetails.order_id,
          items: paymentDetails.items,
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          first_name: paymentDetails.first_name,
          last_name: paymentDetails.last_name,
          email: paymentDetails.email,
          phone: paymentDetails.phone,
          address: paymentDetails.address,
          city: paymentDetails.city,
          country: paymentDetails.country,
          hash: hash,
        };

        payhere.onCompleted = async function () {
          await placeOrder();
        };

        payhere.onDismissed = function () {
          alert("Payment dismissed");
        };

        payhere.onError = function (error) {
          console.error("Payment Error:", error);
          alert("Payment failed. Please try again.");
        };

        console.log("Starting PayHere Payment", payment);
        payhere.startPayment(payment);

      } else {
        console.error("Failed to generate hash for payment.");
        alert("Payment initialization failed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  }

  async function handlePlaceOrder() {
    if (!state) {
      alert("Cart is empty or invalid state!");
      return;
    }

    if (payMethod === "card") {
      await startCardPayment();
    } else {
      await placeOrder();
    }
  }

  if (isAuthenticated) {
   
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-grow max-w-screen-xl mx-auto w-full grid lg:grid-cols-3 gap-6 px-4 py-8">
          {/* LEFT: delivery + payment */}
          <section className="lg:col-span-2 space-y-8">
            <Block title="Delivery details">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-1">home_pin</span>
                <div className="flex-1">
                  <p className="font-medium mb-2">Home</p>
                  <textarea
                    placeholder="Enter the valid Google-Maps link"
                    value={addrLink}
                    onChange={(e) => setAddrLink(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>
            </Block>

            <Block title="Delivery options">
              <div className="border px-4 py-3 rounded flex items-center justify-between">
                <span>Standard</span>
                <span className="text-sm text-gray-500">Currently closed</span>
              </div>
            </Block>

            <Block title="Payment">
              <div className="space-y-4">
                <Radio
                  id="card"
                  checked={payMethod === "card"}
                  onChange={() => setPayMethod("card")}
                  label="Debit / Credit Card"
                />
                <Radio
                  id="cash"
                  checked={payMethod === "cash"}
                  onChange={() => setPayMethod("cash")}
                  label="Cash on Delivery"
                />
              </div>
            </Block>

            <button
              className="w-full bg-black text-white py-3 rounded"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </section>

          {/* RIGHT: summary */}
          <aside className="space-y-6">
            <div className="border rounded px-4 py-5 space-y-2 bg-white">
              <h3 className="font-semibold">{restaurant?.name}</h3>
              <p className="text-sm text-gray-600">{restaurant?.address}</p>
            </div>

            <Block title={`Cart summary (${state.cart.length} items)`}>
              <ul className="text-sm divide-y">
                {state.cart.map((itm) => (
                  <li key={itm._id} className="py-2 flex justify-between">
                    <span>
                      {itm.qty} × {itm.name}
                    </span>
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
              <p className="text-xs text-gray-500 mt-2">
                By placing your order, you agree to take full responsibility for
                it once it’s delivered.
              </p>
            </Block>
          </aside>
        </div>

        <Footer />
      </div>
    );
  }

  // NOT LOGGED-IN VIEW
  const handleContinue = async () => {
    try {
      const { data } = await axios.get("http://localhost:5559/users/", {
        headers: { Authorization: `Bearer dummy-token-check` },
      });
      const existing = data.find((u) => u.email === email);
      existing ? setShowPwd(true) : setShowReg(true);
    } catch (err) {
      console.error(err);
    }
  };
  const handlePasswordSubmit = () => {
    setShowPwd(false);
    alert("Login Successful! Redirecting to Payment...");
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
            onClick={() => alert("Google Sign-in coming soon")}
            className="flex items-center justify-center w-full border border-gray-300 py-3 rounded"
          >
            <img src="/google-icon.png" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
        </div>
      </div>
      <Footer />

      {showPasswordModal && (
        <Modal>
          <h3 className="text-xl font-semibold mb-4">Enter your password</h3>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Login
          </button>
        </Modal>
      )}

      {showRegisterModal && (
        <Modal>
          <h3 className="text-xl font-semibold mb-4">
            You need to register first
          </h3>
          <div className="flex justify-end">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register Now
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

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
      © 2025 FasterEats – All rights reserved
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">{children}</div>
    </div>
  );
}
