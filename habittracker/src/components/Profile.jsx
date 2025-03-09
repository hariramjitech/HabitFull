import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ setAuthenticated }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("authenticated");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full text-center border-t-4 border-blue-500">
        <div className="mb-6">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
            alt="Profile Avatar"
            className="w-28 h-28 mx-auto rounded-full border-4 border-blue-500 shadow-md"
          />
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-1">{user.name}</h2>
        <p className="text-gray-500 text-sm mb-4">{user.email}</p>

        <div className="bg-yellow-400 text-black py-2 px-6 rounded-lg mb-4 shadow-sm">
          <span className="font-medium">Gold:</span> {user.gold} 🏅
        </div>

        <button
          className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;