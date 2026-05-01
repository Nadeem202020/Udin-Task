import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* App Name */}
        <Link to="/" className="text-2xl font-bold hover:text-blue-200">
          🎮 Sokoban Platform
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* User Info and Role Badge */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{user.username}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    user.role === "admin"
                      ? "bg-red-500"
                      : user.role === "player"
                        ? "bg-green-500"
                        : "bg-gray-500"
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login and Register Links */}
              <Link
                to="/login"
                className="px-4 py-2 hover:bg-blue-500 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
