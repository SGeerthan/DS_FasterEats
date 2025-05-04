import React, { useState } from "react";

export default function StudyPostCard({ profileImage, heading, progressItems }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? progressItems : progressItems.slice(0, 3);

  const statusColor = (s) =>
    ({ complete: "text-green-600", pending: "text-yellow-600", ongoing: "text-blue-600" }[s.toLowerCase()] ??
    "text-gray-600");

  return (
    <article className="w-full max-w-xl mx-auto p-5 bg-white border border-gray-300 rounded-xl shadow-sm">
      {/* header */}
      <header className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img src={profileImage} alt="profile" className="w-12 h-12 rounded-full border border-gray-300 object-cover" />
          <h2 className="text-lg font-semibold">{heading}</h2>
        </div>
        <button type="button" className="text-xl leading-none text-gray-500 hover:text-gray-800">&#8942;</button>
      </header>

      {/* progress */}
      <section className="space-y-2">
        {visible.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 basis-1/3">
              <span className="text-lg">•</span>
              <span>{item.title}</span>
            </div>

            <a href={item.link} target="_blank" rel="noopener noreferrer"
               className="basis-1/3 text-blue-600 underline text-center hover:no-underline">
              Material
            </a>

            <span className={`basis-1/3 text-right font-medium ${statusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        ))}
      </section>

      {/* more */}
      {!showAll && progressItems.length > 3 && (
        <button onClick={() => setShowAll(true)} className="mt-4 flex items-center gap-1 text-sm text-gray-600 hover:underline">
          More <span className="text-lg">• • •</span>
        </button>
      )}
    </article>
  );
}
