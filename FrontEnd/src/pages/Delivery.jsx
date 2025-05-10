import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import {
  AiOutlineSearch,
  AiOutlineClose,
  AiOutlineUnorderedList,
  AiOutlineCar,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


// fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ── badge colours ───────────────────────────────────────────────────────────────
const statusStyles = {
  Picked: "bg-yellow-100 text-yellow-800",
  OnTheWay: "bg-blue-100  text-blue-800",
  AcceptDelivery: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Declined: "bg-red-100   text-red-800",
};

/* ── tiny collapsible search box ─────────────────────────────────────────────── */
function SearchBox({ query, setQuery }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const key = (e) => {
      if (e.key === "/" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => ref.current?.focus(), 0);
      }
      if (e.key === "Escape" && open && !query) setOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
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

/* ── reusable nav button ────────────────────────────────────────────────────── */
function NavBtn({ icon: Icon, label, active, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm ${
        active
          ? "bg-orange-600 text-white"
          : disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-gray-100"
      }`}
    >
      <Icon /> {label}
    </button>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function Delivery() {
  const { user, token, isAuthenticated } = useAuth();

  /* tabs: all | mine */
  const [tab, setTab] = useState("all");

  /* deliveries */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* UI helpers */
  const [showProfile, setShowProfile] = useState(false);
  const [query, setQuery] = useState("");
  const [busyIds, setBusyIds] = useState(new Set());

  const jwt =
    token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  /* fetch all orders once */
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8888/api/delivery/api/user-orders",
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ Load error:", e);
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, jwt]);

  /* derived lists */
  const allOrders = orders.filter((o) => o.deliveryStatus === "OnTheWay");
  const myJobs = orders.filter(
    (o) =>
      o.deliveryStatus === "AcceptDelivery" &&
      o.deliveryPersonId === user?._id
  );
  const disableAll = myJobs.length > 0;

  /* accept delivery handler */
  const acceptDelivery = useCallback(
    async (ord) => {
      if (!user) return;
      setBusyIds((s) => new Set(s).add(ord._id));
      // optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o._id === ord._id
            ? {
                ...o,
                deliveryStatus: "AcceptDelivery",
                deliveryPersonId: user._id,
                deliveryPersonName: `${user.firstName} ${user.lastName}`,
                deliveryPersonPhone: user.phone || user.contact || "",
              }
            : o
        )
      );
      setTab("mine");

      try {
        await axios.patch(
          `http://localhost:8888/api/delivery/api/user-orders/${ord._id}/status`,
          {
            deliveryStatus: "AcceptDelivery",
            deliveryPersonId: user._id,
            deliveryPersonName: `${user.firstName} ${user.lastName}`,
            deliveryPersonPhone: user.phone || user.contact || "",
          },
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
      } catch (e) {
        alert(e.response?.data?.message || "Server error – could not accept");
        // rollback
        setOrders((prev) =>
          prev.map((o) =>
            o._id === ord._id ? { ...o, deliveryStatus: "OnTheWay" } : o
          )
        );
        setTab("all");
      } finally {
        setBusyIds((s) => {
          const n = new Set(s);
          n.delete(ord._id);
          return n;
        });
      }
    },
    [jwt, user]
  );

  /* filtered by query */
  const filtered = useMemo(() => {
    const base = tab === "all" ? allOrders : myJobs;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (o) =>
        o.restaurantName.toLowerCase().includes(q) ||
        (o.cart || []).some((i) => i.name.toLowerCase().includes(q))
    );
  }, [allOrders, myJobs, tab, query]);

  /* guards */
  if (!isAuthenticated)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Please log in.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader" />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="font-sans antialiased flex min-h-screen">
      {/* side nav */}
      <aside className="hidden md:flex flex-col fixed inset-y-16 left-0 w-48 bg-white border-r p-4 gap-2">
        <NavBtn
          icon={AiOutlineUnorderedList}
          label="All Orders"
          active={tab === "all"}
          disabled={disableAll}
          onClick={() => setTab("all")}
        />
        <NavBtn
          icon={AiOutlineCar}
          label="My Delivery"
          active={tab === "mine"}
          onClick={() => setTab("mine")}
        />
      </aside>

      {/* main */}
      <div className="flex-1 md:ml-48 flex flex-col min-h-screen">
        {/* header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/public/FasterEatsLogo.png"
              alt="logo"
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold">FasterEats Driver</span>
          </Link>
          <SearchBox query={query} setQuery={setQuery} />
          {user && (
            <button onClick={() => setShowProfile(true)}>
              <img
                src={user.profilePicture || "/public/avatar.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
          )}
        </header>

        {/* content */}
        <main className="flex-1 p-6 bg-gray-50">
          {tab === "all" && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Open Delivery Jobs
              </h1>
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500">
                  No jobs available.
                </p>
              ) : (
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {filtered.map((o) => (
                    <DeliveryCard
                      key={o._id}
                      order={o}
                      busy={busyIds.has(o._id)}
                      onAccept={acceptDelivery}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "mine" && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-center">
                Current Delivery
              </h1>
              {myJobs.length === 0 ? (
                <p className="text-center text-gray-500">
                  You haven’t accepted a delivery yet.
                </p>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  <DeliveryCard order={myJobs[0]} hideAccept />
                  {/* ← Leaflet map/tracker */}
                  <DeliveryTracker />
                </div>
              )}
            </>
          )}
        </main>

        {/* footer */}
        <footer className="bg-gray-100 py-6 text-right pr-6 text-sm text-gray-600">
          © {new Date().getFullYear()} FasterEats (Pvt) Ltd
        </footer>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

/* ── delivery card ────────────────────────────────────────────────────────── */
function DeliveryCard({ order, busy, onAccept, hideAccept = false }) {
  const [open, setOpen] = useState(false);
  const status = order.deliveryStatus || "OnTheWay";
  const payment = order.paymentMethod || "unknown";
  const badge = statusStyles[status] || "bg-gray-200 text-gray-800";
  const items = (order.cart || []).map((i) => i.name).join(", ") || "—";
  const canAccept =
    !hideAccept && status === "OnTheWay" && !order.deliveryPersonId && !busy;

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
      onClick={() => setOpen((p) => !p)}
    >
      {/* header */}
      <div className="flex justify-between items-start px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{order.restaurantName}</h2>
          <p className="text-xs text-gray-500 truncate max-w-xs">{items}</p>
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
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <AiOutlineUp /> : <AiOutlineDown />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="px-6 py-4 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Order ID:</strong> {order.orderId}
            </p>
            <p>
              <strong>Updated:</strong>{" "}
              {new Date(order.updatedAt || order.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Total:</strong> LKR {order.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t text-sm space-y-1">
            <p className="font-medium mb-1">Addresses</p>
            <p>
              <strong>Pickup:</strong> {order.restaurantAddress}
            </p>
            <p>
              <strong>Delivery:</strong> {order.deliveryAddress}
            </p>
            {canAccept && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(order);
                }}
                disabled={busy}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded disabled:opacity-60"
              >
                {busy ? "Assigning…" : "Accept Delivery"}
              </button>
            )}
            {status === "AcceptDelivery" && (
              <p className="mt-4 text-xs text-green-700">
                You have accepted this delivery.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── THE LEAFLET TRACKER ───────────────────────────────────────────────────── */
function DeliveryTracker() {
  const restaurant = {
    name: "Colombo Spice Restaurant",
    address: "123 Galle Road, Colombo 03, Sri Lanka",
    location: { lat: 6.9157, lng: 79.8562 },
    orderId: "ORD123456",
    amount: "2500 LKR",
    foodItem: "Chicken Biryani",
  };
  const customer = {
    address: "45 Flower Road, Colombo 07, Sri Lanka",
    location: { lat: 6.9128, lng: 79.8687 },
    orderId: "ORD123456",
    amount: "2500 LKR",
  };
  const openStreetMapDirectionsLink = `https://www.openstreetmap.org/directions?engine=graphhopper_motorcycle&route=${restaurant.location.lat}%2C${restaurant.location.lng}%3B${customer.location.lat}%2C${customer.location.lng}`;

  return (
    <div className="p-6 space-y-6">
      {/* Details */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Delivery Details
        </h2>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-blue-600">Restaurant</h3>
          <p>
            <span className="font-medium">Name:</span> {restaurant.name}
          </p>
          <p>
            <span className="font-medium">Address:</span> {restaurant.address}
          </p>
          <p>
            <span className="font-medium">Order ID:</span> {restaurant.orderId}
          </p>
          <p>
            <span className="font-medium">Amount:</span> {restaurant.amount}
          </p>
          <p>
            <span className="font-medium">Food Item:</span> {restaurant.foodItem}
          </p>
        </div>
        <div className="space-y-2 mt-6">
          <h3 className="text-xl font-semibold text-green-600">Customer</h3>
          <p>
            <span className="font-medium">Address:</span> {customer.address}
          </p>
          <p>
            <span className="font-medium">Order ID:</span> {customer.orderId}
          </p>
          <p>
            <span className="font-medium">Amount:</span> {customer.amount}
          </p>
        </div>
        <div className="mt-6">
          <a
            href={openStreetMapDirectionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Navigate from Restaurant to Customer
          </a>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Map</h2>
        <MapContainer
          center={[6.9157, 79.8562]}
          zoom={14}
          style={{ height: "400px", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={restaurant.location}>
            <Popup>
              <strong>{restaurant.name}</strong>
              <br />
              {restaurant.address}
            </Popup>
          </Marker>
          <Marker position={customer.location}>
            <Popup>
              <strong>Customer</strong>
              <br />
              {customer.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
