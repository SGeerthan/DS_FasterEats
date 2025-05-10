/* src/pages/Orders.jsx */
import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineUnorderedList,
  AiOutlineCheckCircle,
  AiOutlineUser,
  AiOutlinePhone,
  AiOutlineMessage,
  AiOutlineEnvironment,
  AiFillStar,                    // ★ new (rating icon)
} from "react-icons/ai";

/* ─────────────────── status‑pill colours ─────────────────── */
const statusStyles = {
  Picked:          "bg-yellow-100 text-yellow-800",
  OnTheWay:        "bg-blue-100  text-blue-800",
  AcceptDelivery:  "bg-purple-100 text-purple-800",
  DeliveredFromRestaurant: "bg-orange-100 text-orange-800",
  Delivered:       "bg-green-100 text-green-800",
  Declined:        "bg-red-100   text-red-800",
};

/* order of progress steps */
const STEP_ORDER = [
  "Picked",
  "OnTheWay",
  "AcceptDelivery",
  "DeliveredFromRestaurant",
  "Delivered",
];

/* ─────────────────── tiny collapsible search ─────────────────── */
function SearchBox({ query, setQuery }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => ref.current?.focus(), 0);
      }
      if (e.key === "Escape" && open && !query) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, query]);

  return (
    <div className="relative flex items-center justify-end">
      {!open && !query && (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-orange-500"
          aria-label="Open search"
        >
          <AiOutlineSearch className="w-5 h-5" />
        </button>
      )}

      {(open || query) && (
        <>
          <input
            ref={ref}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => !query && setOpen(false)}
            placeholder="Search…"
            className="w-60 sm:w-72 pl-4 pr-10 py-2 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-500 text-sm"
          />
          <AiOutlineSearch className="absolute right-3 w-4 h-4 text-orange-500 pointer-events-none" />
        </>
      )}

      {query && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear"
          className="absolute right-8 p-1 text-gray-400 hover:text-gray-600"
        >
          <AiOutlineClose className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ─────────────────── side‑nav button ─────────────────── */
function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded ${
        active ? "bg-orange-500 text-white" : "hover:bg-gray-100"
      }`}
    >
      <Icon /> {label}
    </button>
  );
}

/* ═══════════════════════════ Main Page ═══════════════════════════ */
export default function Orders() {
  const { user, isAuthenticated } = useAuth();

  /* which tab?  */
  const [active, setActive] = useState("orders"); // orders | accept | profile

  /* customer‑side orders */
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  /* driver “my deliveries” */
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  /* profile  */
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  /* search (only for My Orders) */
  const [query, setQuery] = useState("");

  const authHdr = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    return { Authorization: `Bearer ${token}` };
  };

  /* ── load MY ORDERS on mount ── */
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5003/api/user-orders",
          { params: { user: user._id }, headers: authHdr() }
        );
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, [isAuthenticated, user]);

  /* ── load MY DELIVERIES (Accept tab) ── */
  useEffect(() => {
    if (active !== "accept" || !isAuthenticated) return;
    setLoadingDeliveries(true);
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8888/api/delivery/api/user-orders",
          { headers: authHdr() }
        );

        /* show orders taken by this driver (or if driver id not set) */
        const mine = Array.isArray(data)
          ? data.filter(
              (o) =>
                ["AcceptDelivery","OnTheWay","DeliveredFromRestaurant","Delivered"].includes(o.deliveryStatus) &&
                (!o.deliveryPersonId || o.deliveryPersonId === user._id)
            )
          : [];

        setMyDeliveries(mine);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDeliveries(false);
      }
    })();
  }, [active, isAuthenticated, user]);

  /* ── load PROFILE once ── */
  useEffect(() => {
    if (active !== "profile") return;
    setLoadingProfile(true);
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8888/api/auth/users/profile",
          { headers: authHdr() }
        );
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [active]);

  /* search filter */
  const filteredOrders = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.toLowerCase();
    return orders.filter(
      (o) =>
        (o.restaurantName && o.restaurantName.toLowerCase().includes(q)) ||
        (o.cart ?? []).some((i) => i.name.toLowerCase().includes(q))
    );
  }, [orders, query]);

  /* unauth guard */
  if (!isAuthenticated)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Please log in.
      </div>
    );

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      {/* header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/FasterEatsLogo.png" alt="" className="w-8 h-8" />
          <span className="text-xl font-semibold">FasterEats</span>
        </Link>
        {user && (
          <img
            src={user.profilePicture || "/public/avatar.png"}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </header>

      <div className="flex flex-1">
        {/* sidebar */}
        <aside className="fixed top-[64px] bottom-0 left-0 w-52 bg-white border-r hidden md:flex flex-col p-4 gap-3">
          <NavBtn
            icon={AiOutlineUnorderedList}
            label="My Orders"
            active={active === "orders"}
            onClick={() => setActive("orders")}
          />
          <NavBtn
            icon={AiOutlineCheckCircle}
            label="My Deliveries"
            active={active === "accept"}
            onClick={() => setActive("accept")}
          />
          <NavBtn
            icon={AiOutlineUser}
            label="Profile"
            active={active === "profile"}
            onClick={() => setActive("profile")}
          />
        </aside>

        {/* main area */}
        <div className="flex-1 md:ml-52 lg:pr-[20%]">
          {/* ───── My Orders tab ───── */}
          {active === "orders" && (
            <>
              <div className="max-w-4xl mx-auto px-6 mt-8 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold">Your Orders</h1>
                <SearchBox query={query} setQuery={setQuery} />
              </div>

              <main className="px-6 pb-20 max-w-4xl mx-auto">
                {loadingOrders ? (
                  <div className="loader" />
                ) : filteredOrders.length === 0 ? (
                  <p className="text-center text-gray-500">No orders found.</p>
                ) : (
                  <div className="grid gap-6">
                    {filteredOrders.map((o) => (
                      <OrderCard key={o._id} order={o} />
                    ))}
                  </div>
                )}
              </main>
            </>
          )}

          {/* ───── My Deliveries tab ───── */}
          {active === "accept" && (
            <main className="px-6 pb-20 max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">My Deliveries</h1>

              {loadingDeliveries ? (
                <div className="loader" />
              ) : myDeliveries.length === 0 ? (
                <p className="text-center text-gray-500">
                  You have no accepted deliveries.
                </p>
              ) : (
                <div className="grid gap-6">
                  {myDeliveries.map((o) => (
                    <DeliveryCard key={o._id} order={o} />
                  ))}
                </div>
              )}
            </main>
          )}

          {/* ───── Profile tab ───── */}
          {active === "profile" && (
            <div className="flex items-center justify-center py-16 px-4">
              {loadingProfile ? (
                <div className="loader" />
              ) : profile ? (
                <ProfileCard p={profile} />
              ) : (
                <p className="text-gray-500">Profile unavailable.</p>
              )}
            </div>
          )}
        </div>

        {/* banner */}
        <aside className="hidden lg:block fixed inset-y-16 right-0 w-[20%] pointer-events-none">
          <img
            src="/public/verticalbenner3.png"
            alt=""
            className="h-full w-full object-contain"
          />
        </aside>
      </div>

      {/* footer */}
      <footer className="bg-gray-100">
        <div className="mx-auto px-6 py-14 lg:pl-[16%]">
          <div className="flex items-center gap-2 mb-4">
            <img src="/public/FasterEatsLogo.png" alt="" className="w-8 h-8" />
            <span className="text-lg font-semibold">FasterEats</span>
          </div>
          <p className="text-gray-500">© 2025 FasterEats (Pvt) Ltd</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════ individual cards ═══════════════════════ */
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const status = order.deliveryStatus || "Pending";
  const badge  = statusStyles[status] || "bg-gray-200 text-gray-800";
  const payment = order.paymentMethod || "unknown";
  const items = (order.cart ?? []).map((i) => i.name).join(", ") || "—";

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
      onClick={() => setOpen((p) => !p)}
    >
      {/* summary */}
      <div className="flex justify-between items-start px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{order.restaurantName}</h2>
          <p className="text-xs text-gray-500 truncate">{items}</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-1 rounded font-medium ${badge}`}>
              {status.toUpperCase()}
            </span>
            <span
              className={`text-[11px] px-2 py-[2px] rounded ${
                payment.toLowerCase() === "cash"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {payment.toUpperCase()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((p) => !p);
            }}
            className="text-gray-500 mt-1"
          >
            {open ? <AiOutlineUp /> : <AiOutlineDown />}
          </button>
        </div>
      </div>

      {/* details */}
      {open && (
        <>
          <div className="px-6 py-4 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Order ID:</strong> {order.orderId}
            </p>
            <p>
              <strong>Placed On:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Total:</strong> LKR {order.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t text-sm">
            <p className="font-medium mb-1">Delivery Address</p>
            <p>{order.deliveryAddress}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------- driver delivery card -------------- */
function DeliveryCard({ order }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const status    = order.deliveryStatus || "AcceptDelivery";
  const statusIdx = STEP_ORDER.indexOf(status);
  const badge     = statusStyles[status] || "bg-gray-200 text-gray-800";

  const payment   = order.paymentMethod || "unknown";
  const items     = (order.cart ?? []).map((i) => i.name).join(", ") || "—";

  const phone     = order.deliveryPersonPhone || order.deliveryPersonContact || "";
  const msgHref   = phone ? `sms:${phone}` : "#";
  const callHref  = phone ? `tel:${phone}` : "#";

  /* auth header */
  const authHdr = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    return { Authorization: `Bearer ${token}` };
  };

  const submitRating = async () => {
    if (!rating || submitting || !order.deliveryPersonId) return;
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:8888/api/auth/users/${order.deliveryPersonId}/rate`,
        { rating },
        { headers: authHdr() }
      );
      setRating(0);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
      onClick={() => setOpen((p) => !p)}
    >
      {/* ───── summary row ───── */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">{order.restaurantName}</h2>
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {items}
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs px-2 py-1 rounded font-medium ${badge}`}>
                {status.toUpperCase()}
              </span>
              <span
                className={`text-[11px] px-2 py-[2px] rounded ${
                  payment.toLowerCase() === "cash"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {payment.toUpperCase()}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((p) => !p);
              }}
              className="text-gray-500 mt-1"
            >
              {open ? <AiOutlineUp /> : <AiOutlineDown />}
            </button>
          </div>
        </div>

        {/* ───── progress bar ───── */}
        <div className="mt-3 flex items-center">
          {STEP_ORDER.map((step, idx) => {
            const reached = idx <= statusIdx;
            return (
              <React.Fragment key={step}>
                {/* node + label */}
                <div className="flex flex-col items-center flex-none w-20">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        reached ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    />
                    {idx === statusIdx && (
                      <img
                        src="/public/deli.png"
                        alt=""
                        className="absolute -top-6 w-6 h-6 object-contain
                                   filter brightness-0 invert sepia
                                   mix-blend-multiply"
                        style={{
                          filter:
                            "invert(48%) sepia(87%) saturate(2474%) hue-rotate(2deg) brightness(104%)",
                        }}
                      />
                    )}
                  </div>
                  <span className="mt-1 text-[10px] truncate">
                    {step.length > 10 ? step.slice(0, 10) + "…" : step}
                  </span>
                </div>

                {/* connector */}
                {idx < STEP_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] ${
                      reached ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ───── expanded details ───── */}
      {open && (
        <>
          <div className="px-6 py-4 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Order ID:</strong> {order.orderId}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(order.updatedAt || order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Total:</strong> LKR {order.totalAmount.toLocaleString()}
            </p>
            <p>
              <strong>Delivery Person:</strong>{" "}
              {order.deliveryPersonName || "—"}
            </p>
            {phone && (
              <p>
                <strong>Phone:</strong>{" "}
                <a
                  href={callHref}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline"
                >
                  {phone}
                </a>
              </p>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t text-sm space-y-1">
            <p className="font-medium mb-1">Addresses</p>
            <p>
              <strong>Pickup:</strong> {order.restaurantAddress}
            </p>
            <p>
              <strong>Delivery:</strong> {order.deliveryAddress}
            </p>

            {/* rating UI (only if a delivery person exists) */}
            {order.deliveryPersonId && (
              <div className="pt-4">
                <div className="flex justify-center sm:justify-start gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRating(i + 1);
                      }}
                    >
                      <AiFillStar
                        className={`w-6 h-6 ${
                          rating >= i + 1 ? "text-orange-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <button
                  disabled={!rating || submitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    submitRating();
                  }}
                  className="w-full text-xs bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded disabled:opacity-40"
                >
                  Give rating
                </button>
              </div>
            )}

            {/* action icons */}
            <div className="flex justify-end gap-4 pt-4 text-xl">
              {phone && (
                <>
                  <a
                    href={callHref}
                    onClick={(e) => e.stopPropagation()}
                    title="Call"
                  >
                    <AiOutlinePhone className="text-green-600 hover:scale-110 transition-transform" />
                  </a>
                  <a
                    href={msgHref}
                    onClick={(e) => e.stopPropagation()}
                    title="Message"
                  >
                    <AiOutlineMessage className="text-blue-600 hover:scale-110 transition-transform" />
                  </a>
                </>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  order.deliveryAddress
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open in Maps"
              >
                <AiOutlineEnvironment className="text-red-600 hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------- simple profile card -------------- */
function ProfileCard({ p }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
      <img
        src={p.profilePicture || "/public/avatar.png"}
        alt=""
        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
      />
      <h3 className="text-2xl font-bold mb-1">
        {p.restaurantName || `${p.firstName} ${p.lastName}`}
      </h3>
      <p className="text-gray-600 mb-2">{p.email}</p>
      {p.address && <p className="text-gray-500 mb-1">{p.address}</p>}
      {p.phone && <p className="text-gray-500">{p.phone}</p>}
    </div>
  );
}
