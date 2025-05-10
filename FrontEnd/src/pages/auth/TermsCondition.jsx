// import React from "react";

// const TermsCondition = ({ onAccept, onCancel, loading }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-[30rem]">
//         <h3 className="text-2xl font-bold mb-4 text-gray-800">
//           Terms and Conditions
//         </h3>
//         <div className="h-64 overflow-y-auto mb-4 text-gray-700 text-sm">
//           {/* Replace the text below with your actual Terms and Conditions */}
//           <p>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
//             condimentum tortor sem, in semper nisl bibendum eu. Nunc a facilisis
//             eros. Curabitur nec lacinia nisl. Vestibulum ante ipsum primis in
//             faucibus orci luctus et ultrices posuere cubilia curae; Integer nec dui
//             sit amet lorem tincidunt sodales ut non orci.
//           </p>
//           <p className="mt-2">
//             Duis vestibulum, sem sit amet cursus pharetra, enim elit euismod
//             arcu, vel tempus metus lacus sit amet risus. Integer dictum maximus
//             felis, in ornare sapien ultrices ut.
//           </p>
//         </div>
//         <div className="flex justify-end gap-4">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onAccept}
//             disabled={loading}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             {loading ? "Registering..." : "I Accept"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermsCondition;

import React from "react";

const TermsCondition = ({ onAccept, onCancel, loading }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[30rem]">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          FasterEats Terms & Conditions
        </h3>
        <div className="h-64 overflow-y-auto mb-4 text-gray-700 text-sm">
          <p>
            By creating an account with FasterEats, you agree to our terms of service and
            privacy policy. You must be at least 18 years old to use our platform.
          </p>
          <p className="mt-2">
            FasterEats connects customers with restaurants and delivery partners. We do not
            prepare food or deliver it ourselves. All orders are subject to availability and
            restaurant acceptance.
          </p>
          <p className="mt-2">
            Delivery times are estimates and may vary due to traffic, weather, and other
            conditions. By placing an order, you consent to share your delivery location
            with our drivers to complete the service.
          </p>
          <p className="mt-2">
            You are responsible for reviewing your order before placing it. Charges are final
            once the order is accepted by the restaurant. Refunds may only be issued in cases
            of confirmed errors or service issues.
          </p>
          <p className="mt-2">
            Your data will be securely processed in accordance with our Privacy Policy. We may
            use anonymized data for service improvement and analytics.
          </p>
          <p className="mt-2">
            Violation of these terms may result in suspension or termination of your account.
            For full details, please refer to our complete Terms of Service on the FasterEats website.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Registering..." : "I Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsCondition;
