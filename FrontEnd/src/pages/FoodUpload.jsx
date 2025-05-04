// src/pages/FoodUpload.jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function FoodUpload() {
  const { token } = useAuth();
  const [food, setFood] = useState({
    name: "",
    description: "",
    price: "",
    image: null
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) =>
    setFood({ ...food, [e.target.name]: e.target.value });

  const handleImage = (e) =>
    setFood({ ...food, image: e.target.files[0] });

  const reset = () =>
    setFood({ name: "", description: "", price: "", image: null });

  const submit = async (e) => {
    e.preventDefault();
    if (!food.name || !food.price) return alert("Name & price required");
    setSaving(true);
    const fd = new FormData();
    Object.entries(food).forEach(([k, v]) => fd.append(k, v));
    await axios.post("http://localhost:5560/foods", fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    window.dispatchEvent(new Event("foods:invalidate"));
    setSaving(false);
    reset();
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 bg-white shadow p-6 rounded-lg"
    >
      <input
        name="name"
        value={food.name}
        onChange={handle}
        placeholder="Dish name"
        className="col-span-full md:col-span-1 p-2 border rounded"
        required
      />
      <input
        name="price"
        type="number"
        value={food.price}
        onChange={handle}
        placeholder="Price (Rs)"
        className="col-span-full md:col-span-1 p-2 border rounded"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="col-span-full md:col-span-1"
      />
      <textarea
        name="description"
        value={food.description}
        onChange={handle}
        placeholder="Short description"
        rows="3"
        className="col-span-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={saving}
        className="col-span-full md:col-span-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        {saving ? "Saving…" : "Add dish"}
      </button>
    </form>
  );
}
