import { onboardingAPI } from "../services/api";

export default function NotificationList({ notifications, onNotificationRead }) {
  const markAsRead = async (notificationId) => {
    try {
      await onboardingAPI.put(`/notifications/${notificationId}/read`);
      console.log("Notification marked as read:", notificationId);
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div style={{ 
        color: "#666", 
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        marginTop: "10px"
      }}>
        <p style={{ margin: 0 }}>No notifications</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {notifications.map((n) => (
          <li 
            key={n._id} 
            style={{ 
              padding: "12px", 
              marginBottom: "8px", 
              backgroundColor: n.isRead ? "#f5f5f5" : "#fff3cd",
              borderRadius: "4px",
              border: n.isRead ? "1px solid #e0e0e0" : "1px solid #ffc107",
              cursor: !n.isRead ? "pointer" : "default",
              transition: "all 0.2s ease"
            }}
            onClick={() => !n.isRead && markAsRead(n._id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0,
                  fontWeight: n.isRead ? "normal" : "bold",
                  color: "#333"
                }}>
                  {n.message}
                </p>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.isRead && (
                <span style={{ 
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#2196F3",
                  borderRadius: "50%",
                  marginLeft: "10px",
                  flexShrink: 0,
                  marginTop: "4px"
                }} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}