import React from "react";

export default function Footer({ isDark }) {
  return (
    <footer className={`text-center py-3 text-sm ${
      isDark ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-600 border-t"
    }`}>
      © 2025 CipherSchool + raj | CipherStudio
    </footer>
  );
}
