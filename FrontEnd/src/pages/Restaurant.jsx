/* ------------  src/pages/Restaurant.jsx ------------- */
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import FoodUpload from "./FoodUpload";
import ProfileModal from "../components/ProfileModal";

/* helper: pretty date */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function Restaurant() {
  const { token, user, loading } = useAuth();

  /* dishes, banner */
  const [foods, setFoods] = useState([]);
  const [banner, setBanner] = useState("/public/kit.jpg");

  /* ui state */
  const [activeTab, setTab] = useState("foodList");
  const [editing, setEditing] = useState(null);
  const [showProfile, setProfile] = useState(false);

  /* orders */
  const [orders, setOrders] = useState([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [selected, setSelected] = useState(null);

  const authH = token ? { Authorization: `Bearer ${token}` } : {};

  /* ── load dishes + banner ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      const [dRes, bRes] = await Promise.all([
        axios.get("http://localhost:8888/api/restaurant/foods/my", { headers: authH }),
        axios.get("http://localhost:8888/api/restaurant/restaurant-images/my", {
          headers: authH,
        }),
      ]);
      setFoods(dRes.data);
      if (bRes.data[0]?.url) setBanner(bRes.data[0].url);
    })();
  }, [token]);

  /* ── load orders once ── */
  useEffect(() => {
    if (
      activeTab !== "orders" ||
      ordersLoaded ||
      !user?.registerNumber
    )
      return;
    (async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8888/api/delivery/api/user-orders",
          {
            params: { regNo: user.registerNumber.toUpperCase() },
            headers: authH,
          }
        );
        setOrders(data);
        setOrdersLoaded(true);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [activeTab, ordersLoaded, user, token]);

  /* ── Accept / Decline ── */
  const patchStatus = async (id, accept) => {
    try {
      /* 1️⃣ update in order‑service (port 5003) */
      const { data: updated } = await axios.patch(
        `http://localhost:8888/api/delivery/api/user-orders/${id}/status`,
        accept
          ? { orderStatus: true, deliveryStatus: "OnTheWay" }
          : { orderStatus: false, deliveryStatus: "Declined" },
        { headers: authH }
      );

      /* 2️⃣ forward full document to delivery‑service (port 5004) */
      if (accept) {
        const { _id, __v, createdAt, updatedAt, ...clean } = updated; // strip mongo meta
        await axios.post(
          "http://localhost:8888/api/order/api/user-orders",
          clean,
          { headers: { "Content-Type": "application/json" } }
        );
      }

      /* 3️⃣ refresh local UI */
      setOrders((cur) => cur.map((o) => (o._id === id ? updated : o)));
      setSelected(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to update / forward order");
    }
  };

  /* ───────── delete dish ───────── */
  const deleteDish = async (id) => {
    await axios.delete(`http://localhost:8888/api/restaurant/foods/${id}`, { headers: authH });
    setFoods((cur) => cur.filter((d) => d._id !== id));
  };

  /* guards */
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "restaurantOwner") return <Navigate to="/" replace />;

  /* small row for dish table */
  const DishRow = ({ dish }) => (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-2 px-4">
        {dish.image && (
          <img
            src={dish.image}
            alt=""
            className="w-14 h-14 object-cover rounded"
          />
        )}
      </td>
      <td className="py-2 px-4">{dish.name}</td>
      <td className="py-2 px-4">{dish.price}</td>
      <td className="py-2 px-4 space-x-3 text-sm">
        <button
          onClick={() => setEditing(dish)}
          className="text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => deleteDish(dish._id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  /* ───────────────────────── view ───────────────────────── */
  return (
    <div className="min-h-screen flex flex-col">
      {/* banner */}
      <img src={banner} alt="" className="w-full h-56 object-cover" />

      <div className="flex flex-1">
        {/* ───── sidebar ───── */}
        <aside className="w-64 bg-white border-r px-5 py-6 flex flex-col">
          <img
            src="/public/FasterEatsLogo.png"
            alt=""
            className="w-16 mx-auto mb-8"
          />

          {[
            { id: "foodList", label: "Food List", icon: "/public/list1.png" },
            { id: "addDish", label: "Add Dish", icon: "/public/add1.png" },
            { id: "orders", label: "Orders", icon: "/public/orders1.png" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setSelected(null);
              }}
              className={`flex items-center gap-3 mb-3 px-3 py-2 rounded-lg ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <img src={icon} alt="" className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </aside>

        {/* ───── main panel ───── */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {/* top bar */}
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-semibold">Restaurant Page</h1>
            <button onClick={() => setProfile(true)}>
              <img
                src={user.profilePicture || "/public/avatar.png"}
                alt=""
                className="w-10 h-10 rounded-full ring-1 ring-gray-300"
              />
            </button>
          </div>

          {/* content area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {/* dishes tab */}
            {activeTab === "foodList" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">My Dishes</h2>
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Price (Rs)</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((d) => (
                      <DishRow key={d._id} dish={d} />
                    ))}
                    {!foods.length && (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-6 text-center text-gray-500"
                        >
                          No dishes yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* add dish tab */}
            {activeTab === "addDish" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Add New Menu Item</h2>
                <FoodUpload onSuccess={() => setTab("foodList")} />
              </div>
            )}

            {/* orders tab */}
            {activeTab === "orders" &&
              (selected ? (
                <OrderDetails
                  order={selected}
                  onBack={() => setSelected(null)}
                  onDecide={patchStatus}
                />
              ) : (
                <OrderList orders={orders} onSelect={setSelected} />
              ))}
          </div>
        </section>
      </div>

      {/* edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <FoodUpload
              initial={editing}
              onSuccess={() => setEditing(null)}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {showProfile && <ProfileModal onClose={() => setProfile(false)} />}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Orders LIST with collapsible rows
─────────────────────────────────────────────── */
function OrderList({ orders, onSelect }) {
  const [openId, setOpenId] = useState(null);

  if (!orders.length)
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No orders yet.
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Orders&nbsp;({orders.length})</h2>

      <table className="min-w-full text-left">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            <th className="py-3 px-4 w-10" />
            <th className="py-3 px-4">Order ID</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Items</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => {
            const expanded = openId === o._id;
            const names =
              Array.isArray(o.cart) && o.cart.length
                ? o.cart.map((i) => i.name).join(", ")
                : "—";

            return (
              <React.Fragment key={o._id}>
                {/* summary */}
                <tr
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => setOpenId(expanded ? null : o._id)}
                >
                  <td className="py-3 px-4">
                    <span className="material-symbols-outlined text-sm">
                      {expanded ? "expand_less" : "expand_more"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-blue-600 underline">
                    {o.orderId}
                  </td>
                  <td className="py-3 px-4">{fmtDate(o.createdAt)}</td>
                  <td className="py-3 px-4 truncate max-w-xs">{names}</td>
                </tr>

                {/* inline detail */}
                {expanded && (
                  <tr className="border-t bg-gray-50">
                    <td colSpan="4" className="p-4">
                      <OrderInline
                        order={o}
                        onClose={() => setOpenId(null)}
                        onSelect={() => onSelect(o)}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* small inline panel inside list */
function OrderInline({ order, onClose, onSelect }) {
  const items =
    Array.isArray(order.cart) && order.cart.length ? order.cart : [];

  return (
    <div>
      <div className="flex justify-between items-start mb-3">
        <p className="font-medium">
          {items.length} item{items.length !== 1 && "s"} — LKR{" "}
          {order.totalAmount.toLocaleString()}
        </p>

        <button
          onClick={onClose}
          title="Collapse"
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <ul className="text-sm divide-y mb-4">
        {items.map((i) => (
          <li key={i._id || i.name} className="py-1 flex justify-between">
            <span>
              {i.qty} × {i.name}
            </span>
            <span>Rs {(i.qty * i.price).toLocaleString()}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className="text-blue-600 hover:underline text-sm"
      >
        View full details / Accept ↗
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Full Order view + Accept / Decline
─────────────────────────────────────────────── */
function OrderDetails({ order, onBack, onDecide }) {
  /* decide‑state helpers */
  const accepted = order.orderStatus === true;
  const declined =
    order.orderStatus === false && order.deliveryStatus === "Declined";

  const items =
    Array.isArray(order.cart) && order.cart.length ? order.cart : [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <button
        onClick={onBack}
        className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to list
      </button>

      {/* header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold">Order #{order.orderId}</h2>
          <p className="text-sm text-gray-500">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded text-sm font-medium">
          LKR {order.totalAmount?.toLocaleString?.() ?? "—"}
        </div>
      </div>

      {/* status */}
      <div className="bg-blue-50 rounded flex items-center gap-3 px-4 py-3 mb-6">
        <span className="w-3 h-3 bg-blue-600 rounded-full" />
        <div>
          <p className="font-semibold">Order Status</p>
          <p className="uppercase text-xs text-blue-800 tracking-wider">
            {order.deliveryStatus ?? "—"}
          </p>
        </div>
      </div>

      {/* restaurant */}
      <div className="bg-green-50 rounded p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">storefront</span>
          Restaurant Details
        </h3>
        <p className="text-sm">
          <span className="font-medium">Name:</span>{" "}
          {order.restaurantName ?? "—"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Address:</span>{" "}
          {order.restaurantAddress ?? "—"}
        </p>
      </div>

      {/* items */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">
            receipt_long
          </span>
          Order Items
        </h3>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No items recorded.</p>
        ) : (
          <ul className="divide-y text-sm">
            {items.map((itm) => (
              <li
                key={itm._id || itm.name}
                className="py-2 flex justify-between"
              >
                <div>
                  <p>{itm.name}</p>
                  <p className="text-xs text-gray-500">Qty: {itm.qty}</p>
                </div>
                <span>Rs {(itm.price * itm.qty).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* actions */}
      <div className="flex gap-4">
        <button
          onClick={() => onDecide(order._id, true)}
          disabled={accepted || declined}
          className={`flex-1 py-2 rounded ${
            accepted
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {accepted ? "Accepted" : "Accept"}
        </button>
        <button
          onClick={() => onDecide(order._id, false)}
          disabled={accepted || declined}
          className={`flex-1 py-2 rounded ${
            declined
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {declined ? "Declined" : "Decline"}
        </button>
      </div>
    </div>
  );
}
