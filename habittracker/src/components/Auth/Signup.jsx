import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const checkResponse = await fetch("http://localhost:3001/users");
      if (!checkResponse.ok) throw new Error("Failed to fetch users");

      const users = await checkResponse.json();

      if (users.some((u) => u.email === email)) {
        setError("User already exists. Please log in.");
        return;
      }

      const newUser = { name, email, password };

      const createResponse = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!createResponse.ok) throw new Error("Failed to create account");

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError("Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">Sign Up</h2>
      <form 
        onSubmit={handleSignup} 
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className={`w-full p-3 text-white rounded-lg ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-500">Log in here</Link>
      </p>
    </div>
  );
};

export default Signup;