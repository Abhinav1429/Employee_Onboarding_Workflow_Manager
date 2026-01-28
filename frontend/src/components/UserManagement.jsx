import { useState } from "react";
import { authAPI } from "../services/api";

export default function UserManagement({ role, onUserCreated, managers = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const userData = {
        name,
        email,
        password,
        role: role.toUpperCase(),
        dateOfJoining: new Date(),
        ...(role === "EMPLOYEE" && selectedManager && { managerId: selectedManager }),
        ...(role === "EMPLOYEE" && managers.length === 1 && managers[0]._id && !selectedManager && { managerId: managers[0]._id })
      };

      await authAPI.post("/register", userData);
      alert(`${role} created successfully!`);
      setName("");
      setEmail("");
      setPassword("");
      setSelectedManager("");
      setShowForm(false);
      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "10px"
        }}
      >
        {showForm ? "Cancel" : `Add New ${role}`}
      </button>

      {showForm && (
        <div style={{
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginTop: "10px"
        }}>
          <h4>Create New {role}</h4>
          {error && (
            <div style={{
              padding: "10px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
              marginBottom: "10px"
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Name: *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Email: *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Password: *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc"
                }}
              />
            </div>

            {role === "EMPLOYEE" && managers.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Assign Manager:
                  {managers.length === 1 && (
                    <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                      (Auto-assigned to you)
                    </span>
                  )}
                </label>
                {managers.length === 1 ? (
                  <input
                    type="text"
                    value={managers[0].name || managers[0].email || "You"}
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f5f5f5"
                    }}
                  />
                ) : (
                  <select
                    value={selectedManager}
                    onChange={(e) => setSelectedManager(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc"
                    }}
                  >
                    <option value="">-- Select Manager --</option>
                    {managers.map(mgr => (
                      <option key={mgr._id} value={mgr._id}>
                        {mgr.name || mgr.email} ({mgr.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: "10px 20px",
                  backgroundColor: creating ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: creating ? "not-allowed" : "pointer",
                  marginRight: "10px"
                }}
              >
                {creating ? "Creating..." : `Create ${role}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                  setSelectedManager("");
                  setError("");
                }}
                disabled={creating}
                style={{
                  padding: "10px 20px",
                  backgroundColor: creating ? "#ccc" : "#757575",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: creating ? "not-allowed" : "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

