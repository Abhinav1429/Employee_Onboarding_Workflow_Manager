import WorkflowForm from "../components/WorkflowForm";
import { useEffect, useState } from "react";
import { onboardingAPI, authAPI, workflowAPI } from "../services/api";
import NotificationList from "../components/NotificationList";
import { useNavigate } from "react-router-dom";
import UserManagement from "../components/UserManagement";

export default function AdminDashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("workflows");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    // Check authentication
    if (!userId || !userRole || userRole.toUpperCase() !== "ADMIN") {
      navigate("/");
      return;
    }
    
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [navigate, userId]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkflows(),
        loadOnboardings(),
        loadEmployees(),
        loadManagers(),
        loadNotifications()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const res = await workflowAPI.get("/");
      setWorkflows(res.data || []);
    } catch (err) {
      console.error("Failed to load workflows:", err);
      setWorkflows([]);
    }
  };

  const loadOnboardings = async () => {
    try {
      const res = await onboardingAPI.get("/admin/all");
      setOnboardings(res.data || []);
    } catch (err) {
      console.error("Failed to load onboardings:", err);
      setOnboardings([]);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await authAPI.get("/users/role/EMPLOYEE");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployees([]);
    }
  };

  const loadManagers = async () => {
    try {
      const res = await authAPI.get("/users/role/MANAGER");
      setManagers(res.data || []);
    } catch (err) {
      console.error("Failed to load managers:", err);
      setManagers([]);
    }
  };

  const loadNotifications = async () => {
    if (userId) {
      try {
        const res = await onboardingAPI.get(`/notifications/${userId}`);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      }
    }
  };

  const [assigningWorkflow, setAssigningWorkflow] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedManager, setSelectedManager] = useState("");

  const assign = async (workflow) => {
    setAssigningWorkflow(workflow);
    setSelectedEmployee("");
    setSelectedManager("");
  };

  const confirmAssign = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }
    
    try {
      await onboardingAPI.post("/assign", { 
        employeeId: selectedEmployee, 
        workflowTemplate: assigningWorkflow, 
        assignedBy: userId,
        managerId: selectedManager || null
      });
      alert("Workflow assigned to employee successfully");
      setAssigningWorkflow(null);
      setSelectedEmployee("");
      setSelectedManager("");
      await Promise.all([loadOnboardings(), loadNotifications()]);
    } catch (err) {
      console.error(err);
      alert("Failed to assign workflow: " + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#2196F3";
      case "completed": return "#4CAF50";
      case "rejected": return "#F44336";
      default: return "#757575";
    }
  };

  const getProjectStatusColor = (projectStatus) => {
    switch (String(projectStatus || "").toLowerCase()) {
      case "started": return "#2196F3";
      case "pending": return "#FF9800";
      case "ongoing": return "#9C27B0";
      case "completed": return "#4CAF50";
      default: return "#757575";
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "20px",
          backgroundColor: "#e3f2fd",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          <p>Loading dashboard...</p>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Admin Dashboard</h2>
        <div>
          <span style={{ marginRight: "10px" }}>Welcome, {localStorage.getItem("userName") || "Admin"}</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <button 
          onClick={() => setActiveTab("workflows")} 
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: activeTab === "workflows" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "workflows" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Workflows
        </button>
        <button 
          onClick={() => setActiveTab("onboardings")} 
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: activeTab === "onboardings" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "onboardings" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          All Onboardings
        </button>
        <button 
          onClick={() => setActiveTab("managers")} 
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: activeTab === "managers" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "managers" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Managers
        </button>
        <button 
          onClick={() => setActiveTab("employees")} 
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: activeTab === "employees" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "employees" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Employees
        </button>
        <button 
          onClick={() => setActiveTab("user-management")} 
          style={{ 
            padding: "10px 20px", 
            marginRight: "10px",
            backgroundColor: activeTab === "user-management" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "user-management" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab("notifications")} 
          style={{ 
            padding: "10px 20px",
            backgroundColor: activeTab === "notifications" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "notifications" ? "white" : "black",
            border: "none",
            cursor: "pointer"
          }}
        >
          Notifications ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {activeTab === "workflows" && (
        <div>
          <WorkflowForm onWorkflowCreated={refreshAll} />
          <h3>Existing Workflows</h3>
          {workflows.length === 0 && <p>No workflows created yet</p>}
          {workflows.map(w => (
            <div key={w._id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 15, borderRadius: "5px" }}>
              <strong style={{ fontSize: "18px" }}>{w.name}</strong>
              <div style={{ marginTop: "5px", color: "#666" }}>{w.description}</div>
              <div style={{ marginTop: "10px" }}>
                <strong>Allotted time:</strong> {w.allottedTimeDays || 0} days
              </div>
              <div style={{ marginTop: "10px" }}>
                <strong>Steps:</strong> {w.steps?.length || 0}
                <ul style={{ marginTop: "5px" }}>
                  {w.steps?.map((s, i) => (
                    <li key={i}>{s.stepOrder}. {s.title} ({s.assignedRole})</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => assign(w)} 
                style={{ 
                  marginTop: "10px", 
                  padding: "8px 16px", 
                  backgroundColor: "#4CAF50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Assign to Employee
              </button>
              
              {assigningWorkflow && assigningWorkflow._id === w._id && (
                <div style={{ 
                  marginTop: "15px", 
                  padding: "15px", 
                  backgroundColor: "#f5f5f5", 
                  borderRadius: "5px",
                  border: "1px solid #ccc"
                }}>
                  <h4>Assign Workflow: {w.name}</h4>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      <strong>Select Employee:</strong>
                    </label>
                    <select 
                      value={selectedEmployee} 
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "8px", 
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                      }}
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name || emp.email} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      <strong>Select Manager (Optional):</strong>
                    </label>
                    <select 
                      value={selectedManager} 
                      onChange={(e) => setSelectedManager(e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: "8px", 
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                      }}
                    >
                      <option value="">-- No Manager --</option>
                      {managers.map(mgr => (
                        <option key={mgr._id} value={mgr._id}>
                          {mgr.name || mgr.email} ({mgr.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button 
                      onClick={confirmAssign}
                      style={{ 
                        padding: "8px 16px", 
                        backgroundColor: "#4CAF50", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "10px"
                      }}
                    >
                      Confirm Assignment
                    </button>
                    <button 
                      onClick={() => {
                        setAssigningWorkflow(null);
                        setSelectedEmployee("");
                        setSelectedManager("");
                      }}
                      style={{ 
                        padding: "8px 16px", 
                        backgroundColor: "#757575", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "onboardings" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
            <h3 style={{ margin: 0 }}>All Onboarding Instances</h3>
            <button
              onClick={() => { loadOnboardings(); loadNotifications(); }}
              style={{ padding: "8px 16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
            >
              Refresh
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
            <strong>Project Status</strong> is updated by employees from My Workflows. Click <strong>Refresh</strong> to see latest.
          </p>
          {onboardings.length === 0 && <p>No onboarding instances yet</p>}
          {onboardings.map(o => (
            <div key={o._id} style={{ 
              border: '1px solid #ddd', 
              padding: '20px', 
              marginBottom: '20px', 
              borderRadius: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              {/* Header Section */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                paddingBottom: "15px",
                borderBottom: "2px solid #f0f0f0",
                marginBottom: "15px"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
                    👤 {o.employeeId?.name || o.employeeId?.email || "Unknown Employee"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {o.employeeId?.email || "N/A"}
                  </div>
                  {o.managerId && (
                    <div style={{ marginTop: "8px", fontSize: "14px", color: "#555" }}>
                      <strong>Manager:</strong> {o.managerId?.name || o.managerId?.email || "Unknown"}
                      <span style={{ marginLeft: "8px", color: "#888", fontSize: "12px" }}>
                        ({o.managerId?.email || "N/A"})
                      </span>
                    </div>
                  )}
                </div>
                <span style={{ 
                  padding: "6px 14px", 
                  borderRadius: "20px", 
                  backgroundColor: getStatusColor(o.status),
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  {o.status?.toUpperCase() || "ACTIVE"}
                </span>
              </div>

              {/* Workflow Info */}
              <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "12px 15px", 
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                <div style={{ fontSize: "14px", color: "#333", marginBottom: "4px" }}>
                  <strong>📋 Workflow:</strong> {o.workflowTemplateId?.name || "Unknown Workflow"}
                </div>
                {o.workflowTemplateId?.description && (
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    {o.workflowTemplateId.description}
                  </div>
                )}
              </div>

              {/* Project Status & Progress */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "15px"
              }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "5px" }}>
                    <strong>Project Status</strong>
                  </div>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    backgroundColor: getProjectStatusColor(o.projectStatus),
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {(o.projectStatus || "pending").toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "5px" }}>
                    <strong>Progress</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ 
                      flex: 1, 
                      backgroundColor: "#e0e0e0", 
                      borderRadius: "10px",
                      height: "20px",
                      overflow: "hidden"
                    }}>
                      <div style={{ 
                        width: `${o.progress}%`, 
                        backgroundColor: "#4CAF50", 
                        height: "100%",
                        transition: "width 0.3s",
                        borderRadius: "10px"
                      }}></div>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "600", minWidth: "40px" }}>
                      {o.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>
                    Started
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    📅 {new Date(o.startedAt).toLocaleDateString()}
                  </div>
                </div>
                {o.deadline && (
                  <>
                    <div>
                      <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>
                        Deadline
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>
                        ⏰ {new Date(o.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>
                        Time Remaining
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        fontWeight: "600",
                        color: o.timeRemainingDays < 0 ? "#F44336" : o.timeRemainingDays < 3 ? "#FF9800" : "#4CAF50"
                      }}>
                        {o.timeRemainingDays !== null ? `${o.timeRemainingDays} days` : "N/A"}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Tasks Section */}
              <div style={{ marginBottom: "15px" }}>
                <div style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  marginBottom: "10px",
                  color: "#333"
                }}>
                  ✓ Tasks ({o.tasks?.length || 0})
                </div>
                {o.tasks && o.tasks.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {o.tasks.map((t, i) => (
                      <div key={i} style={{ 
                        padding: "10px 12px", 
                        backgroundColor: "#f8f9fa",
                        borderLeft: `4px solid ${t.status === "approved" ? "#4CAF50" : t.status === "rejected" ? "#F44336" : "#FF9800"}`,
                        borderRadius: "4px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>
                            {t.title}
                          </span>
                          <span style={{ 
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "3px",
                            backgroundColor: t.status === "approved" ? "#4CAF50" : t.status === "rejected" ? "#F44336" : "#FF9800",
                            color: "white",
                            fontWeight: "600"
                          }}>
                            {t.status?.toUpperCase()}
                          </span>
                        </div>
                        {t.managerComment && (
                          <div style={{ marginTop: "6px", fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                            💬 Manager: {t.managerComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999", fontSize: "13px" }}>No tasks</p>
                )}
              </div>

              {/* Daily Updates Section */}
              <div style={{ marginBottom: "15px" }}>
                <div style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  marginBottom: "10px",
                  color: "#333"
                }}>
                  📝 Daily Updates ({o.updates?.length || 0})
                </div>
                {o.updates && o.updates.length > 0 ? (
                  <div style={{ 
                    maxHeight: "200px", 
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}>
                    {o.updates.map((u, idx) => (
                      <div key={idx} style={{ 
                        padding: "10px 12px", 
                        backgroundColor: "#f8f9fa",
                        borderRadius: "6px",
                        borderLeft: `4px solid ${u.status === "approved" ? "#4CAF50" : u.status === "rejected" ? "#F44336" : "#FF9800"}`
                      }}>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px"
                        }}>
                          <span style={{ fontSize: "11px", color: "#888" }}>
                            {new Date(u.date).toLocaleString()}
                          </span>
                          <span style={{ 
                            padding: "2px 8px", 
                            borderRadius: "3px",
                            backgroundColor: u.status === "approved" ? "#4CAF50" : u.status === "rejected" ? "#F44336" : "#FF9800",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: "600"
                          }}>
                            {u.status?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#333" }}>{u.note}</div>
                        {u.managerComment && (
                          <div style={{ marginTop: "6px", fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                            💬 Manager: {u.managerComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999", fontSize: "13px" }}>No updates yet</p>
                )}
              </div>

              {/* Documents Section */}
              <div>
                <div style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  marginBottom: "10px",
                  color: "#333"
                }}>
                  📎 Uploaded Documents ({o.documents?.length || 0})
                </div>
                {o.documents && o.documents.length > 0 ? (
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "6px"
                  }}>
                    {o.documents.map((d, idx) => (
                      <div key={idx} style={{ 
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <a 
                          href={`http://localhost:4002${d.url}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            color: "#2196F3",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          📄 {d.originalName || d.fileName}
                        </a>
                        <span style={{ fontSize: "11px", color: "#888" }}>
                          {new Date(d.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#999", fontSize: "13px" }}>No documents uploaded yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "managers" && (
        <div>
          <h3>Managers</h3>
          {managers.length === 0 && <p>No managers found</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            {managers.map(mgr => (
              <div key={mgr._id} style={{ 
                border: '1px solid #ccc', 
                padding: 20, 
                borderRadius: "5px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ marginBottom: "10px", fontSize: "18px", fontWeight: "bold" }}>
                  {mgr.name || "N/A"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Email:</strong> {mgr.email}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Date of Joining:</strong> {mgr.dateOfJoining ? new Date(mgr.dateOfJoining).toLocaleDateString() : "N/A"}
                </div>
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e0e0e0" }}>
                  <strong>Role:</strong> <span style={{ 
                    padding: "3px 8px", 
                    borderRadius: "3px", 
                    backgroundColor: "#2196F3", 
                    color: "white",
                    fontSize: "12px"
                  }}>MANAGER</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "employees" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>All Employees</h3>
            <button
              onClick={() => { loadOnboardings(); loadEmployees(); }}
              style={{ padding: "8px 16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Refresh
            </button>
          </div>
          <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
            <strong>Project Assigned</strong> = workflow template name. <strong>Days Given</strong> = allotted time (days) from template. <strong>Status</strong> = employee’s workflow status (Started / Ongoing / Pending / Completed). Click <strong>Refresh</strong> to see latest.
          </p>
          {employees.length === 0 && <p>No employees found</p>}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "5px", overflow: "hidden" }}>
              <thead>
                <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Date of Joining</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Manager</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Project Assigned</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Days Given</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Days Left</th>
                  <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const eid = String(emp._id || emp.id || "");
                  const empOnboarding = onboardings.find(o =>
                    String(o.employeeId?._id || o.employeeId) === eid
                  );
                  const workflowName = empOnboarding?.workflowTemplateId?.name || "N/A";
                  const allotted = empOnboarding?.workflowTemplateId?.allottedTimeDays;
                  const daysGiven = allotted != null
                    ? allotted
                    : (empOnboarding?.deadline && empOnboarding?.startedAt
                        ? Math.ceil((new Date(empOnboarding.deadline) - new Date(empOnboarding.startedAt)) / (1000 * 60 * 60 * 24))
                        : null);
                  const daysLeft = empOnboarding?.timeRemainingDays != null ? empOnboarding.timeRemainingDays : null;
                  
                  return (
                    <tr key={emp._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>{emp.name || "N/A"}</td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>{emp.email}</td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                        {emp.managerId?.name || emp.managerId?.email || empOnboarding?.managerId?.name || empOnboarding?.managerId?.email || "Not Assigned"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>{workflowName}</td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>{daysGiven != null ? `${daysGiven} days` : "N/A"}</td>
                      <td style={{ 
                        padding: "12px", 
                        border: "1px solid #e0e0e0",
                        color: typeof daysLeft === "number" 
                          ? (daysLeft < 0 ? "#F44336" : daysLeft < 3 ? "#FF9800" : "#4CAF50")
                          : "#666",
                        fontWeight: typeof daysLeft === "number" ? "bold" : "normal"
                      }}>
                        {typeof daysLeft === "number" ? `${daysLeft} days` : "N/A"}
                      </td>
                      <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                        {empOnboarding ? (
                          <span style={{ 
                            padding: "5px 10px", 
                            borderRadius: "4px", 
                            backgroundColor: getProjectStatusColor(empOnboarding.projectStatus),
                            color: "white",
                            fontSize: "12px"
                          }}>
                            {(empOnboarding.projectStatus || "pending").toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ color: "#999" }}>No Project</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "user-management" && (
        <div>
          <h3>User Management</h3>
          <div style={{ marginBottom: "30px" }}>
            <h4>Add Manager</h4>
            <UserManagement 
              role="MANAGER" 
              onUserCreated={() => {
                loadManagers();
                loadEmployees();
              }} 
            />
          </div>
          <div>
            <h4>Add Employee</h4>
            <UserManagement 
              role="EMPLOYEE" 
              managers={managers}
              onUserCreated={() => {
                loadEmployees();
                loadManagers();
              }} 
            />
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div>
          <h3>Notifications</h3>
          <NotificationList notifications={notifications} onNotificationRead={loadNotifications} />
        </div>
      )}
    </div>
  );
}