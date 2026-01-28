import TaskList from "../components/TaskList";
import { useEffect, useState } from "react";
import { onboardingAPI } from "../services/api";
import NotificationList from "../components/NotificationList";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [onboardings, setOnboardings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [updateNote, setUpdateNote] = useState("");
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [projectStatusDraft, setProjectStatusDraft] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const employeeId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "Employee";

  useEffect(() => {
    if (!employeeId || userRole?.toUpperCase() !== "EMPLOYEE") {
      navigate("/");
      return;
    }
    refreshAll();
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [employeeId, navigate, userRole]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOnboardings(),
        loadNotifications()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOnboardings = async () => {
    try {
      const res = await onboardingAPI.get(`/employee/${employeeId}`);
      setOnboardings(res.data || []);
    } catch (err) {
      console.error("Failed to load onboardings:", err);
      setOnboardings([]);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await onboardingAPI.get(`/notifications/${employeeId}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    }
  };

 
  const updateProjectStatus = async (onboardingId, status) => {
    try {
      const onboarding = onboardings.find(o => o._id === onboardingId);

  
      if (
        status === "completed" &&
        (!onboarding.documents || onboarding.documents.length === 0)
      ) {
        alert("Please upload documents before marking project as completed.");
        return;
      }

      await onboardingAPI.put(`/${onboardingId}/project-status`, {
        employeeId,
        projectStatus: status
      });

      loadOnboardings();
      loadNotifications();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update project status");
    }
  };

  
  const postUpdate = async (onboardingId) => {
    if (!updateNote.trim()) {
      alert("Please enter an update note");
      return;
    }

    try {
      await onboardingAPI.post("/update", {
        onboardingId,
        employeeId,
        note: updateNote
      });
      setUpdateNote("");
      setSelectedOnboarding(null);
      loadOnboardings();
      loadNotifications();
    } catch {
      alert("Failed to post update");
    }
  };


  const uploadDocuments = async (onboardingId, files) => {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      Array.from(files).forEach(f => formData.append("documents", f));

      await onboardingAPI.post(`/${onboardingId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Documents uploaded successfully");
      loadOnboardings();
      loadNotifications();
    } catch {
      alert("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
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
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
        <h2>Employee Dashboard</h2>
        <div>
          <span style={{ marginRight: 10 }}>Welcome, <strong>{userName}</strong></span>
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

      {/* NOTIFICATIONS @abhinav*/}
      <div style={{ background: "#e3f2fd", padding: 10, borderRadius: 5 }}>
        <strong>Notifications ({notifications.filter(n => !n.isRead).length})</strong>
        <NotificationList
          notifications={notifications.slice(0, 5)}
          onNotificationRead={loadNotifications}
        />
      </div>

      {/* ONBOARDINGS / EMPLOYEE WORKFLOW TABLE @abhinav*/}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0 }}>My Workflows</h3>
          <button
            type="button"
            onClick={() => { loadOnboardings(); loadNotifications(); }}
            style={{ padding: "8px 16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
          >
            Refresh
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
          <strong>Workflow</strong> = template name. <strong>Manager (Assigned by Admin)</strong> = manager linked when Admin assigned. <strong>Days Given</strong> = allotted time (days); <strong>Days Left</strong> = remaining. Use <strong>Status</strong> to update. Click <strong>Refresh</strong> after Admin assigns.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "5px", overflow: "hidden" }}>
            <thead>
              <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Workflow</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Manager (Assigned by Admin)</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Assigned By</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Days Given</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Days Left</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Documents</th>
                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ccc" }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {onboardings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "16px", textAlign: "center", color: "#666", border: "1px solid #e0e0e0" }}>
                    No workflows assigned yet.
                  </td>
                </tr>
              ) : (
                onboardings.map(o => {
                  const allotted = o.workflowTemplateId?.allottedTimeDays;
                  const daysGiven = allotted != null
                    ? allotted
                    : (o.deadline && o.startedAt
                        ? Math.ceil((new Date(o.deadline) - new Date(o.startedAt)) / (1000 * 60 * 60 * 24))
                        : null);
                  const daysLeft = o.timeRemainingDays != null ? o.timeRemainingDays : null;
                  return (
                  <tr key={o._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      <div style={{ fontWeight: "bold" }}>{o.workflowTemplateId?.name || "Assigned Project"}</div>
                      {o.workflowTemplateId?.description ? (
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{o.workflowTemplateId.description}</div>
                      ) : null}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      {o.managerId?.name || o.managerId?.email || "Not Assigned"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      {o.assignedBy?.name || o.assignedBy?.email || "N/A"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      {daysGiven != null ? `${daysGiven} days` : "N/A"}
                    </td>
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
                      <select
                        value={projectStatusDraft[o._id] ?? o.projectStatus ?? "pending"}
                        onChange={e => {
                          const value = e.target.value;
                          setProjectStatusDraft(prev => ({ ...prev, [o._id]: value }));
                          updateProjectStatus(o._id, value);
                        }}
                        style={{ padding: "8px 12px", minWidth: 140, borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
                      >
                        <option value="started">Started</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
                        Upload (required before “Completed”)
                      </div>
                      <input
                        type="file"
                        multiple
                        onChange={e => uploadDocuments(o._id, e.target.files)}
                        disabled={uploading}
                      />
                      {o.documents?.length > 0 ? (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, color: "#444", fontWeight: "bold" }}>
                            Uploaded: {o.documents.length}
                          </div>
                          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                            {o.documents.slice(0, 3).map((d, i) => (
                              <li key={i} style={{ fontSize: 12 }}>
                                <a href={`http://localhost:4002${d.url}`} target="_blank" rel="noreferrer">
                                  {d.originalName || d.fileName}
                                </a>
                              </li>
                            ))}
                            {o.documents.length > 3 ? (
                              <li style={{ fontSize: 12, color: "#666" }}>…and more</li>
                            ) : null}
                          </ul>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>No documents yet</div>
                      )}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #e0e0e0" }}>
                      <span style={{ fontWeight: "bold" }}>
                        {(o.completionReview?.status || "pending").toUpperCase()}
                      </span>
                      {o.completionReview?.remark ? (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                          Remark: {o.completionReview.remark}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {uploading && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Uploading…</div>
          )}
        </div>
      </div>

      {/* DETAILS CARDS (kept below for tasks + updates UI) @abhinav*/}
      {onboardings.map(o => (
        <div
          key={o._id}
          style={{
            border: "1px solid #ccc",
            padding: 20,
            marginTop: 20,
            borderRadius: 5,
            background: "#fff"
          }}
        >
          {/* PROJECT HEADER @abhinav*/}
          <h3>{o.workflowTemplateId?.name || "Assigned Project"}</h3>
          <p style={{ color: "#666" }}>{o.workflowTemplateId?.description}</p>

          {/* ASSIGNMENT INFO @abhinav*/}
          <div style={{ marginBottom: 15, fontSize: 13, color: "#444" }}>
            <div>
              <strong>Manager:</strong>{" "}
              {o.managerId?.name || o.managerId?.email || "Not Assigned"}
              {o.managerId?.email && o.managerId?.name ? (
                <span style={{ color: "#666" }}> ({o.managerId.email})</span>
              ) : null}
            </div>
            <div>
              <strong>Assigned By:</strong>{" "}
              {o.assignedBy?.name || o.assignedBy?.email || "N/A"}
              {o.assignedBy?.email && o.assignedBy?.name ? (
                <span style={{ color: "#666" }}> ({o.assignedBy.email})</span>
              ) : null}
            </div>
          </div>

          {/* STATUS DROPDOWN @abhinav*/}
          <div style={{ marginBottom: 15 }}>
            <strong>Workflow Status:</strong>{" "}
            <select
              value={projectStatusDraft[o._id] ?? o.projectStatus ?? "pending"}
              onChange={e => {
                const value = e.target.value;
                setProjectStatusDraft(prev => ({ ...prev, [o._id]: value }));
                updateProjectStatus(o._id, value);
              }}
              style={{ padding: "8px 12px", minWidth: 140, marginLeft: 10, borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
            >
              <option value="started">Started</option>
              <option value="ongoing">Ongoing</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* DOCUMENT UPLOAD (ONLY WHEN COMPLETED) @abhinav*/}
          <div style={{ marginBottom: 15 }}>
            <strong>Upload Documents:</strong>{" "}
            <span style={{ fontSize: 12, color: "#666" }}>
              (required before selecting “Completed”)
            </span>
            <div style={{ marginTop: 8 }}>
              <input
                type="file"
                multiple
                onChange={e => uploadDocuments(o._id, e.target.files)}
                disabled={uploading}
              />
              {uploading && <p>Uploading...</p>}
            </div>
          </div>

          {/* DOCUMENT LIST @abhinav*/}
          {o.documents?.length > 0 && (
            <div style={{ marginBottom: 15 }}>
              <strong>Uploaded Documents:</strong>
              <ul>
                {o.documents.map((d, i) => (
                  <li key={i}>
                    <a href={`http://localhost:4002${d.url}`} target="_blank" rel="noreferrer">
                      {d.originalName || d.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* COMPLETION REVIEW @abhinav*/}
          {o.completionReview && (
            <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 5 }}>
              <strong>Review Status:</strong>{" "}
              {o.completionReview.status?.toUpperCase()}
              {o.completionReview.remark && (
                <div>Remark: {o.completionReview.remark}</div>
              )}
            </div>
          )}

          {/* TASKS @abhinav*/}
          <div style={{ marginTop: 15 }}>
            <strong>Tasks:</strong>
            <TaskList tasks={o.tasks} />
          </div>

          {/* DAILY UPDATE @abhinav*/}
          <div style={{ marginTop: 15 }}>
            <strong>Daily Update:</strong>
            {selectedOnboarding === o._id ? (
              <>
                <textarea
                  value={updateNote}
                  onChange={e => setUpdateNote(e.target.value)}
                  style={{ width: "100%", minHeight: 80 }}
                />
                <button onClick={() => postUpdate(o._id)}>Submit</button>
              </>
            ) : (
              <button onClick={() => setSelectedOnboarding(o._id)}>
                Add Update
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}