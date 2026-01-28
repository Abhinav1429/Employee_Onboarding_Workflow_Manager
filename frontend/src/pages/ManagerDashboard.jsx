import { useEffect, useState } from "react";
import { onboardingAPI, authAPI } from "../services/api";
import NotificationList from "../components/NotificationList";
import { useNavigate } from "react-router-dom";
import UserManagement from "../components/UserManagement";

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [onboardings, setOnboardings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const managerId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Manager";
  const userRole = localStorage.getItem("role");

  // Auth Guard @abhinav
  useEffect(() => {
    if (!managerId || userRole?.toUpperCase() !== "MANAGER") {
      navigate("/");
      return;
    }
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [managerId, navigate]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadEmployeesAndOnboardings(),
        loadNotifications()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Tasks @abhinav
  const loadTasks = async () => {
    try {
      const res = await onboardingAPI.get(`/manager-tasks?managerId=${managerId}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    }
  };

  // Load Employees + Onboardings @abhinav
  const loadEmployeesAndOnboardings = async () => {
    try {
      const obRes = await onboardingAPI.get(`/manager/employees?managerId=${managerId}`);
      setOnboardings(obRes.data || []);

      const empRes = await authAPI.get("/users/role/EMPLOYEE");
      const myEmployees = (empRes.data || []).filter(
        e => String(e.managerId?._id || e.managerId) === String(managerId)
      );
      setEmployees(myEmployees);
    } catch (err) {
      console.error("Failed to load employees/onboardings:", err);
      setEmployees([]);
      setOnboardings([]);
    }
  };

  // Load Notifications @abhinav
  const loadNotifications = async () => {
    try {
      const res = await onboardingAPI.get(`/notifications/${managerId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    }
  };

  // Helpers @abhinav
  const getOnboardingForEmployee = (empId) =>
    onboardings.find(o => String(o.employeeId) === String(empId));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  //  UI @abhinav

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
      {/* HEADER @abhinav*/}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Manager Dashboard</h2>
        <div>
          Welcome, <strong>{userName}</strong>{" "}
          <button 
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* TABS @abhinav*/}
      <div style={{ margin: "20px 0", borderBottom: "1px solid #ccc" }}>
        <button 
          onClick={() => setActiveTab("tasks")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "tasks" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "tasks" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0"
          }}
        >
          Tasks to Review ({tasks.length})
        </button>
        <button 
          onClick={() => setActiveTab("employees")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "employees" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "employees" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0"
          }}
        >
          My Employees ({employees.length})
        </button>
        <button 
          onClick={() => setActiveTab("notifications")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "notifications" ? "#2196F3" : "#f0f0f0",
            color: activeTab === "notifications" ? "white" : "black",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0"
          }}
        >
          Notifications ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* = TASKS TAB @abhinav */}
      {activeTab === "tasks" && (
        <div>
          <h3>Tasks to Review</h3>
          {tasks.length === 0 ? (
            <p>No pending tasks.</p>
          ) : (
            tasks.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                }}
              >
                <strong>{t.title}</strong>
                <div>Employee ID: {t.employeeId}</div>
                <div>Status: {t.status}</div>
                <div>Progress: {t.progress}%</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EMPLOYEES TAB @abhinav */}
      {activeTab === "employees" && (
        <div>
          <h3>My Employees</h3>

          <UserManagement
            role="EMPLOYEE"
            managers={[{ _id: managerId, name: userName }]}
            onUserCreated={refreshAll}
          />

          {employees.length === 0 ? (
            <p>No employees assigned yet.</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "15px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
                    <th style={thLeft}>Name</th>
                    <th style={thLeft}>Email</th>
                    <th style={thCenter}>Days Given</th>
                    <th style={thCenter}>Days Left</th>
                    <th style={thCenter}>Project Status</th>
                    <th style={thCenter}>Overall Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => {
                    const ob = getOnboardingForEmployee(emp._id);
                    return (
                      <tr
                        key={emp._id}
                        style={{
                          backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff",
                          borderBottom: "1px solid #e0e0e0"
                        }}
                      >
                        <td style={tdLeft}>{emp.name}</td>
                        <td style={tdLeft}>{emp.email}</td>

                        <td style={tdCenter}>
                          {ob?.daysGiven != null ? `${ob.daysGiven} days` : "—"}
                        </td>

                        <td
                          style={{
                            ...tdCenter,
                            fontWeight: "600",
                            color:
                              typeof ob?.daysLeft === "number"
                                ? ob.daysLeft < 0
                                  ? "#F44336"
                                  : ob.daysLeft < 3
                                  ? "#FF9800"
                                  : "#4CAF50"
                                : "#555"
                          }}
                        >
                          {typeof ob?.daysLeft === "number"
                            ? `${ob.daysLeft} days`
                            : "—"}
                        </td>

                        <td style={tdCenter}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor:
                                ob?.projectStatus === "completed"
                                  ? "#4CAF50"
                                  : ob?.projectStatus === "active"
                                  ? "#2196F3"
                                  : "#FF9800",
                              color: "white"
                            }}
                          >
                            {(ob?.projectStatus || "pending").toUpperCase()}
                          </span>
                        </td>

                        <td style={tdCenter}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor:
                                ob?.status === "active"
                                  ? "#2196F3"
                                  : "#9E9E9E",
                              color: "white"
                            }}
                          >
                            {ob?.status === "active"
                              ? "IN PROGRESS"
                              : "NO PROJECT"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/*  NOTIFICATIONS TAB @abhinav */}
      {activeTab === "notifications" && (
        <NotificationList
          notifications={notifications}
          onNotificationRead={loadNotifications}
        />
      )}
    </div>
  );
}

/*TABLE STYLES @abhinav */

const thLeft = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "600"
};

const thCenter = {
  padding: "12px",
  textAlign: "center",
  fontWeight: "600"
};

const tdLeft = {
  padding: "12px",
  textAlign: "left"
};

const tdCenter = {
  padding: "12px",
  textAlign: "center"
};
