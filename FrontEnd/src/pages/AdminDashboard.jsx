// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // all users fetched once
  const [allUsers, setAllUsers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("AdminDashboard");
  const [editing,    setEditing]   = useState(null);  // { _id, ...fields }
  const [editMsg,    setEditMsg]   = useState("");
  const [deleting,   setDeleting]  = useState(null); // id
  const [delErr,     setDelErr]    = useState("");

  // fetch every user
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get("http://localhost:8888/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAllUsers(res.data))
    .catch(() => setError("Failed to load users"))
    .finally(() => setLoading(false));
  }, [token]);

  // handy filters
  const taxpayers       = allUsers.filter(u => u.role === "taxpayer");
  const restaurants     = allUsers.filter(u => u.role === "restaurantOwner");
  const deliveryPersons = allUsers.filter(u => u.role === "deliveryPerson");
  const staff           = allUsers.filter(u => u.role === "admin");

  // helpers to open edit with pre-filled
  function openEdit(u) {
    setEditMsg("");
    setEditing({
      _id: u._id,
      firstName:     u.firstName       || "",
      lastName:      u.lastName        || "",
      email:         u.email           || "",
      dateOfBirth:   u.dateOfBirth
                       ? u.dateOfBirth.substr(0,10)
                       : "",
      restaurantName:u.restaurantName  || "",
      address:       u.address         || "",
      phone:         u.phone           || ""
    });
  }

  // save edits (admin-only PUT /users/:id)
  function saveEdit() {
    axios.put(
      `http://localhost:8888/api/auth/users/${editing._id}`,
      editing,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setEditMsg("Update successful!");
      // refresh
      return axios.get("http://localhost:8888/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
    })
    .then(res => {
      setAllUsers(res.data);
      setTimeout(() => setEditing(null), 1000);
    })
    .catch(() => setEditMsg("Update failed"));
  }

  // delete
  function confirmDelete() {
    axios.delete(
      `http://localhost:8888/api/auth/users/${deleting}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setAllUsers(u => u.filter(x => x._id !== deleting));
      setDeleting(null);
    })
    .catch(() => setDelErr("Delete failed"));
  }

  // dynamic columns & rows per tab
  let columns = [], rows = [];
  switch (activeTab) {
    case "Users":
      columns = [
        { key: "firstName",    label: "First Name" },
        { key: "lastName",     label: "Last Name"  },
        { key: "email",        label: "Email"      },
        { key: "dateOfBirth",  label: "DOB"        },
      ];
      rows = taxpayers;
      break;
    case "Restaurants":
      columns = [
        { key: "restaurantName", label: "Restaurant Name" },
        { key: "address",        label: "Address"         },
        { key: "email",          label: "Email"           },
        { key: "phone",          label: "Phone"           },
      ];
      rows = restaurants;
      break;
    case "Delivery Persons":
      columns = [
        { key: "firstName", label: "First Name" },
        { key: "lastName",  label: "Last Name"  },
        { key: "email",     label: "Email"      },
        { key: "phone",     label: "Phone"      },
      ];
      rows = deliveryPersons;
      break;
    case "Staff":
      columns = [
        { key: "firstName", label: "First Name" },
        { key: "lastName",  label: "Last Name"  },
        { key: "email",     label: "Email"      },
      ];
      rows = staff;
      break;
    case "Income":
      // placeholder
      break;
    default:
      // AdminDashboard: no table
  }

  return (
    <div className="font-sans antialiased flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8"/>
          <span className="text-xl font-semibold">FasterEats</span>
        </Link>
        {user && (
          <button onClick={()=>setShowProfile(true)} className="focus:outline-none">
            <img src={user.profilePicture||"/public/avatar.png"}
                 alt="avatar"
                 className="w-10 h-10 rounded-full object-cover"/>
          </button>
        )}
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Nav */}
        <aside className="w-64 bg-white border-r">
          <nav className="flex flex-col p-6 space-y-2">
            {["Users","Restaurants","Delivery Persons","Staff","Income"]
              .map(tab => (
                <button
                  key={tab}
                  onClick={()=>{ setActiveTab(tab); setEditing(null); setDeleting(null); }}
                  className={
                    "text-left px-4 py-2 rounded " +
                    (activeTab===tab ? "bg-gray-200 font-medium" : "hover:bg-gray-100")
                  }
                >
                  {tab}
                </button>
              ))
            }
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">{activeTab}</h1>

          {/* AdminDashboard */}
          {activeTab==="AdminDashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Registered Users",          val: taxpayers.length      },
                { label: "Registered Restaurants",    val: restaurants.length    },
                { label: "Registered Delivery Persons", val: deliveryPersons.length},
                // { label: "Staff Accounts",            val: staff.length          },
              ].map(({label,val},i)=>(
                <div key={i} className="bg-white rounded shadow p-4 text-center">
                  <div className="text-4xl font-bold">{String(val).padStart(2,"0")}</div>
                  <div className="text-gray-600">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Income Placeholder */}
          {activeTab==="Income" && (
            <div className="text-gray-600">Income panel coming soon…</div>
          )}

          {/* Tables */}
          {["Users","Restaurants","Delivery Persons","Staff"]
            .includes(activeTab) && (
            <div className="overflow-x-auto">
              {loading && <p>Loading…</p>}
              {error   && <p className="text-red-600">{error}</p>}
              {!loading && !error && (
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-50">
                      {columns.map(c=>(
                        <th key={c.key} className="px-4 py-2 text-left">{c.label}</th>
                      ))}
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(u=>(
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        {columns.map(c=>(
                          <td key={c.key} className="px-4 py-2">
                            {c.key==="dateOfBirth" && u[c.key]
                              ? new Date(u[c.key]).toLocaleDateString()
                              : u[c.key] ?? "-"}
                          </td>
                        ))}
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={()=>openEdit(u)}
                            className="text-blue-600 hover:underline text-sm"
                          >Edit</button>
                          <button
                            onClick={()=>{ setDeleting(u._id); setDelErr(""); }}
                            className="text-red-600 hover:underline text-sm"
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={columns.length+1}
                            className="py-4 text-center text-gray-500">
                          No entries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-4 text-gray-500 text-sm">
          © 2025 FasterEats (Pvt) Ltd
        </div>
      </footer>

      {/* Profile Modal */}
      {showProfile && <ProfileModal onClose={()=>setShowProfile(false)} />}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl mb-4">Edit {activeTab.slice(0,-1)}</h2>
            <div className="space-y-3">
              {/* dynamically render inputs */}
              {columns.map(({key,label}) => (
                <input
                  key={key}
                  type={key==="dateOfBirth"?"date":"text"}
                  className="w-full border p-2 rounded"
                  value={editing[key]||""}
                  onChange={e=>setEditing({...editing,[key]:e.target.value})}
                  placeholder={label}
                />
              ))}
            </div>
            {editMsg && <p className="mt-2 text-green-600">{editMsg}</p>}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={()=>setEditing(null)}
                className="px-4 py-2 border rounded"
              >Cancel</button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
            <p className="mb-4">Delete this {activeTab.slice(0,-1)}?</p>
            {delErr && <p className="text-red-600 mb-2">{delErr}</p>}
            <div className="flex justify-center space-x-4">
              <button
                onClick={()=>setDeleting(null)}
                className="px-4 py-2 border rounded"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
