import React, { useState } from 'react';

function MapButton({ order }) {
  const [showModal, setShowModal] = useState(false);

  // Destructure addresses from order prop
  const [restaurantAddress, deliveryAddress] = order || [];

  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Generate Google Maps links
  const restaurantMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantAddress)}`;
  const deliveryMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`;

  return (
    <div>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Map
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Address Details</h2>
            <p>
              <strong>Restaurant Address: </strong>
              <a
                href={restaurantMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {restaurantAddress}
              </a>
            </p>
            <p>
              <strong>Delivery Address: </strong>
              <a
                href={deliveryMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {deliveryAddress}
              </a>
            </p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapButton;
