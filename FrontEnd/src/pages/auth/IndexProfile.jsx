// pages/admin/IndexUser.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineEdit, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";

export default function IndexUser() {
  const [users, setUsers]       = useState([]);
  const [editing, setEditing]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [modalUser, setModalUser] = useState(null);       // selected user for popup
  const [rateLoading, setRateLoading] = useState(false);

  /* fetch users once */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5559/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* change role */
  const changeRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5559/api/auth/users/${id}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((u) => u.map((v) => (v._id === id ? { ...v, role } : v)));
      setEditing({});
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  /* delete user */
  const delUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5559/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((u) => u.filter((v) => v._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  /* rate user from modal */
  const rateUser = async (id, value) => {
    setRateLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5559/users/${id}/rate`,
        { rating: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // update list + modal
      setUsers((u) =>
        u.map((v) => (v._id === id ? { ...v, rating: Number(data.rating) } : v))
      );
      setModalUser((p) => ({ ...p, rating: Number(data.rating) }));
    } catch (err) {
      console.error("Rate error", err);
    } finally {
      setRateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {loading ? (
        <p>Loading users…</p>
      ) : (
        <div className="bg-white shadow rounded p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Name / Restaurant</th>
                <th className="p-3">Email</th>
                <th className="p-3 hidden md:table-cell">Reg #</th>
                <th className="p-3">Role</th>
                <th className="p-3 hidden md:table-cell">Rating</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => setModalUser(u)}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{u.restaurantName || `${u.firstName} ${u.lastName}`}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 hidden md:table-cell">{u.registerNumber || "–"}</td>
                  <td
                    className="p-3"
                    onClick={(e) => e.stopPropagation()} /* avoid opening modal when editing */
                  >
                    {editing[u._id] ? (
                      <select
                        value={editing[u._id]}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="taxpayer">Taxpayer</option>
                        <option value="restaurantOwner">Restaurant</option>
                        <option value="deliveryPerson">Courier</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="capitalize">{u.role}</span>
                    )}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    {u.rating?.toFixed(1) || "-"}
                  </td>
                  <td className="p-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditing({ [u._id]: u.role })}
                      className="bg-yellow-500 text-white p-2 rounded"
                    >
                      <AiOutlineEdit />
                    </button>
                    <button
                      onClick={() => delUser(u._id)}
                      className="bg-red-600 text-white p-2 rounded"
                    >
                      <MdOutlineDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------- Modal popup -------- */}
      {modalUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setModalUser(null)}
        >
          <div
            className="bg-white w-full max-w-md mx-2 rounded-lg shadow-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setModalUser(null)}
            >
              ✕
            </button>

            {/* avatar + basic info */}
            <div className="text-center">
              <img
                src={modalUser.profilePicture || "/default-profile.png"}
                alt="avatar"
                className="w-24 h-24 object-cover rounded-full mx-auto border"
              />
              <h3 className="mt-3 text-xl font-semibold">
                {modalUser.restaurantName || `${modalUser.firstName} ${modalUser.lastName}`}
              </h3>
              {modalUser.address && <p className="text-gray-500">{modalUser.address}</p>}
              <p className="text-gray-600">{modalUser.email}</p>
              {modalUser.phone && <p className="text-gray-600">{modalUser.phone}</p>}
              {modalUser.registerNumber && (
                <p className="text-sm text-gray-400">Reg #: {modalUser.registerNumber}</p>
              )}
            </div>

            {/* rating stars */}
            <div className="mt-4 flex justify-center items-center gap-1">
              {[1, 2, 3, 4, 5].map((v) =>
                v <= Math.round(modalUser.rating || 0) ? (
                  <AiFillStar key={v} className="text-yellow-500 cursor-pointer" onClick={() => rateUser(modalUser._id, v)} />
                ) : (
                  <AiOutlineStar key={v} className="text-gray-400 cursor-pointer" onClick={() => rateUser(modalUser._id, v)} />
                )
              )}
              {rateLoading && <span className="ml-2 text-xs text-gray-400">…saving</span>}
            </div>

            {modalUser.rating !== undefined && (
              <p className="mt-1 text-center text-sm text-gray-600">
                Average rating: {modalUser.rating?.toFixed(1) || "0"} /5
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
