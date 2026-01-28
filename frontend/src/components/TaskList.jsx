export default function TaskList({ tasks }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "#4CAF50";
      case "rejected": return "#F44336";
      case "pending": return "#FF9800";
      default: return "#757575";
    }
  };

  if (!tasks || tasks.length === 0) {
    return <p style={{ color: "#999", marginTop: "10px" }}>No tasks</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
      {tasks.map((t, i) => (
        <li 
          key={i} 
          style={{ 
            padding: "10px", 
            marginBottom: "8px", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "4px",
            border: "1px solid #e0e0e0"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{t.stepOrder}. {t.title}</strong>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "3px" }}>
                Assigned to: {t.assignedToRole}
              </div>
            </div>
            <span style={{ 
              padding: "5px 10px", 
              borderRadius: "4px", 
              backgroundColor: getStatusColor(t.status),
              color: "white",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              {t.status?.toUpperCase() || "PENDING"}
            </span>
          </div>
          {t.managerComment && (
            <div style={{ 
              marginTop: "8px", 
              padding: "8px", 
              backgroundColor: "#fff3cd", 
              borderRadius: "4px",
              fontSize: "12px",
              borderLeft: "3px solid #ffc107"
            }}>
              <strong>Manager Comment:</strong> {t.managerComment}
              {t.reviewedAt && (
                <div style={{ fontSize: "11px", color: "#666", marginTop: "3px" }}>
                  Reviewed on {new Date(t.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}