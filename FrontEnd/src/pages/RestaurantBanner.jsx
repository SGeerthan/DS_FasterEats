import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Banner({ imgs }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!imgs.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % imgs.length), 5000);
    return () => clearInterval(id);
  }, [imgs]);

  if (!imgs.length)
    return (
      <div className="h-80 flex items-center justify-center bg-gray-100 text-gray-400">
        No banner images yet
      </div>
    );

  return (
    <div className="relative h-80 max-w-screen-xl mx-auto overflow-hidden">
      <img
        src={imgs[idx].url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />
      <button
        onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={() => setIdx((idx + 1) % imgs.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
