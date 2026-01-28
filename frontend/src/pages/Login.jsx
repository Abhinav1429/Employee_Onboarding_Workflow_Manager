import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/login",
        { email, password }
      );

      // Save token & role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      // Save user info
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name || "");
      localStorage.setItem("managerId", res.data.user.managerId || "");

      // Redirect based on role (handle both uppercase and lowercase)
      const role = res.data.user.role?.toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "MANAGER") {
        navigate("/manager");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      alert("Invalid login");
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <div style={{ 
        backgroundColor: "white", 
        padding: "40px", 
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Employee Onboarding System</h2>
        <h3 style={{ textAlign: "center", marginBottom: "30px", color: "#666", fontWeight: "normal" }}>Login</h3>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "16px"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "16px"
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}