import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function FoodUpload({ initial = null, onSuccess, onClose }) {
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [food, setFood] = useState({
    name: "",
    category: "Appetizer",
    price: "",
    description: "",
    image: null,
    available: true
  });

  /* pre‑fill when editing */
  useEffect(() => {
    if (initial) {
      setFood({
        name: initial.name,
        category: initial.category || "Appetizer",
        price: initial.price,
        description: initial.description || "",
        image: null,
        available: initial.available ?? true
      });
    }
  }, [initial]);

  const handle    = (e) => setFood({ ...food, [e.target.name]: e.target.value });
  const handleImg = (e) => setFood({ ...food, image: e.target.files[0] });

  const submit = async (e) => {
    e.preventDefault();
    if (!food.name || !food.price) return alert("Name & price required");

    setSaving(true);
    const fd = new FormData();
    Object.entries(food).forEach(([k, v]) => fd.append(k, v));

    const url    = initial ? `http://localhost:8888/api/restaurant/foods/${initial._id}` : "http://localhost:5560/foods";
    const method = initial ? "put" : "post";

    await axios[method](url, fd, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    });
    window.dispatchEvent(new Event("foods:invalidate"));
    setSaving(false);
    onSuccess && onSuccess();
    onClose   && onClose();
  };

  return (
    <form onSubmit={submit}
          className="bg-white rounded-lg shadow p-6 grid gap-4 md:grid-cols-2">
      <input name="name" value={food.name} onChange={handle}
             placeholder="Dish name" className="p-3 border rounded" required />
      <select name="category" value={food.category} onChange={handle}
              className="p-3 border rounded">
        {["Appetizer", "Main course", "Dessert", "Beverage"].map(c =>
          <option key={c}>{c}</option>)}
      </select>

      <input name="price" type="number" value={food.price} onChange={handle}
             placeholder="Price" className="p-3 border rounded" required />
      <input type="file" accept="image/*" onChange={handleImg}
             className="p-3 border rounded" />

      <textarea name="description" rows="3" value={food.description}
                onChange={handle} placeholder="Description"
                className="md:col-span-2 p-3 border rounded" />

      <label className="md:col-span-2 flex items-center gap-2">
        <input type="checkbox" checked={food.available}
               onChange={e => setFood({ ...food, available: e.target.checked })}
               className="h-4 w-4 accent-blue-600" />
        Available
      </label>

      <div className="md:col-span-2 flex justify-end gap-2">
        {onClose && (
          <button type="button" onClick={onClose}
                  className="px-6 py-3 bg-gray-200 rounded">Cancel</button>
        )}
        <button type="submit" disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded">
          {saving ? "Saving…" : initial ? "Update" : "Add Item"}
        </button>
      </div>
    </form>
  );
}
