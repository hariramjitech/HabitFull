import React, { useState } from "react";  
import { useNavigate, Link } from "react-router-dom"; 

const Login = ({ setAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/users`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      const user = users.find((u) => u.email === email && u.password === password);

      if (user) {
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          gold: user.gold,
          habits: user.habits || [],
        };

        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("authenticated", "true");

        setAuthenticated(true);
        navigate("/profile");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 text-white rounded-md transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <p className="text-center text-gray-500 mt-4">
          New user? <Link to="/signup" className="text-blue-500 hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;