// import React from "react";
// import { FaSun, FaMoon } from "react-icons/fa";
// import logo from '../assets/coding.png';

// export default function Navbar({ isDark, toggleTheme }) {
//   return (
//     <nav className={`px-6 py-3 flex justify-between items-center shadow-md ${
//       isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900 border-b"
//     }`}>
//       <h1 className="text-2xl font-bold"><img src={logo} className="h-8 w-8 mr-2 inline"/>CipherStudio</h1>
//       <div className="flex items-center gap-3">
//         <button
//           onClick={toggleTheme}
//           className={`p-2 rounded transition-colors ${
//             isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
//           }`}
//           title={isDark ? "Switch to light mode" : "Switch to dark mode"}
//         >
//           {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
//         </button>
//         <button
//           onClick={() => window.location.reload()}
//           className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
//         >
//           New Project
//         </button>
//       </div>
//     </nav>
//   );
// }

import React, { useState } from "react";
import { FaSun, FaMoon, FaUser, FaChevronDown } from "react-icons/fa";
import logo from '../assets/coding.png';
import AuthModal from './AuthModal';

export default function Navbar({ isDark, toggleTheme, user, setUser }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowDropdown(false);
  };

  return (
    <>
      <nav className={`px-6 py-3 flex justify-between items-center shadow-md ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900 border-b"
      }`}>
        <h1 className="text-2xl font-bold"><img src={logo} className="h-8 w-8 mr-2 inline"/>CipherStudio</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded transition-colors ${
              isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
            }`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
          >
            New Project
          </button>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  isDark ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {(user.firstName || user.email)?.[0]?.toUpperCase() || 'U'}
                <FaChevronDown size={12} />
              </button>
              {showDropdown && (
                <div className={`absolute right-0 mt-2 w-32 rounded-md shadow-lg ${
                  isDark ? "bg-gray-800 border border-gray-600" : "bg-white border border-gray-200"
                } z-50`}>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                      isDark ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                isDark ? "bg-green-600 hover:bg-green-500" : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              <FaUser size={14} />
              Login
            </button>
          )}
        </div>
      </nav>
      
      {showAuthModal && (
        <AuthModal 
          isDark={isDark} 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
