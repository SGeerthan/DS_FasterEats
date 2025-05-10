// src/pages/DishModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";

export default function DishModal({ token, initial, onClose, afterSave }) {
  const [dish, setDish] = useState(
    initial || { name: "", description: "", price: "", image: null }
  );
  const [saving, setSaving] = useState(false);

  const handle = (e) => setDish({ ...dish, [e.target.name]: e.target.value });
  const handleImg = (e) => setDish({ ...dish, image: e.target.files[0] });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(dish).forEach(([k, v]) => fd.append(k, v));

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    };

    if (initial && initial._id) {
      await axios.put(`http://localhost:5560/foods/${initial._id}`, fd, { headers });
    } else {
      await axios.post("http://localhost:5560/foods", fd, { headers });
    }

    setSaving(false);
    afterSave();
    window.dispatchEvent(new Event("foods:invalidate"));
  };

  /* --------- NEW: safer heading check --------- */
  const isEdit = initial && initial._id;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg space-y-4 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
        >
          <AiOutlineClose size={20} />
        </button>

        <h3 className="text-xl font-semibold">
          {isEdit ? "Edit dish" : "Add new dish"}
        </h3>

        <input
          name="name"
          value={dish.name}
          onChange={handle}
          placeholder="Dish name"
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="price"
          type="number"
          value={dish.price}
          onChange={handle}
          placeholder="Price (Rs)"
          required
          className="w-full p-2 border rounded"
        />
        <input type="file" accept="image/*" onChange={handleImg} className="w-full" />
        <textarea
          name="description"
          rows="3"
          value={dish.description}
          onChange={handle}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          {saving ? "Saving…" : isEdit ? "Update" : "Add"}
        </button>
      </form>
    </div>
  );
}
