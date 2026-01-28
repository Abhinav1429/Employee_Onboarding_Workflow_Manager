import { useState } from "react";
import { workflowAPI } from "../services/api";

export default function WorkflowForm(props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allottedTimeDays, setAllottedTimeDays] = useState(7);
  const [steps, setSteps] = useState([]);
  const [stepTitle, setStepTitle] = useState("");
  const [stepRole, setStepRole] = useState("employee");
  const [creating, setCreating] = useState(false);

  const addStep = () => {
    if (!stepTitle.trim()) {
      alert("Please enter a step title");
      return;
    }
    setSteps(prev => [...prev, { stepOrder: prev.length + 1, title: stepTitle, assignedRole: stepRole }]);
    setStepTitle("");
    setStepRole("employee");
  };

  const removeStep = (index) => {
    const newSteps = steps.filter((_, idx) => idx !== index).map((step, idx) => ({
      ...step,
      stepOrder: idx + 1
    }));
    setSteps(newSteps);
  };

  const createWorkflow = async () => {
    if (!name.trim()) {
      alert("Please provide workflow name");
      return;
    }
    if (steps.length === 0) {
      alert("Please add at least one step");
      return;
    }

    setCreating(true);
    try {
      const res = await workflowAPI.post("/", {
        name,
        description,
        allottedTimeDays: parseInt(allottedTimeDays),
        steps
      });
      alert("Workflow created successfully!");
      setName("");
      setDescription("");
      setAllottedTimeDays(7);
      setSteps([]);
      if (props.onWorkflowCreated) {
        props.onWorkflowCreated();
      }
    } catch (err) {
      console.error("Workflow creation error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Unknown error";
      alert(`Failed to create workflow: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#fff", 
      borderRadius: "5px", 
      border: "1px solid #ccc",
      marginBottom: "20px"
    }}>
      <h3 style={{ marginTop: 0 }}>Create Workflow</h3>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Workflow Name: *
        </label>
        <input 
          placeholder="Enter workflow name" 
          value={name} 
          onChange={e => setName(e.target.value)}
          disabled={creating}
          style={{ 
            width: "100%", 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            fontSize: "16px",
            opacity: creating ? 0.6 : 1
          }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Description:
        </label>
        <textarea 
          placeholder="Enter workflow description" 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          disabled={creating}
          style={{ 
            width: "100%", 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            fontSize: "16px",
            minHeight: "80px",
            fontFamily: "inherit",
            opacity: creating ? 0.6 : 1
          }}
        />
      </div>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Allotted time (days): *
        </label>
        <input 
          type="number" 
          value={allottedTimeDays} 
          onChange={e => setAllottedTimeDays(Number(e.target.value))}
          min="1"
          disabled={creating}
          style={{ 
            width: "100%", 
            padding: "10px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            fontSize: "16px",
            opacity: creating ? 0.6 : 1
          }}
        />
      </div>

      <h4>Steps</h4>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
        <input 
          placeholder="Step title" 
          value={stepTitle} 
          onChange={e => setStepTitle(e.target.value)}
          disabled={creating}
          style={{ flex: "1", minWidth: "200px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", opacity: creating ? 0.6 : 1 }}
          onKeyPress={(e) => {
            if (e.key === "Enter" && stepTitle.trim()) {
              e.preventDefault();
              addStep();
            }
          }}
        />
        <select 
          value={stepRole} 
          onChange={e => setStepRole(e.target.value)}
          disabled={creating}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", opacity: creating ? 0.6 : 1 }}
        >
          <option value="employee">employee</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>
        <button 
          onClick={addStep}
          disabled={!stepTitle.trim() || creating}
          style={{ 
            padding: "8px 16px", 
            backgroundColor: (!stepTitle.trim() || creating) ? "#ccc" : "#2196F3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: (!stepTitle.trim() || creating) ? "not-allowed" : "pointer"
          }}
        >
          Add Step
        </button>
      </div>

      {steps.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <strong>Added Steps:</strong>
          <ul style={{ marginTop: "5px" }}>
            {steps.map((s, i) => (
              <li key={i} style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{s.stepOrder}. {s.title} ({s.assignedRole})</span>
                <button 
                  onClick={() => removeStep(i)}
                  disabled={creating}
                  style={{ 
                    marginLeft: "10px", 
                    padding: "2px 8px", 
                    backgroundColor: creating ? "#ccc" : "#F44336", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "3px",
                    cursor: creating ? "not-allowed" : "pointer",
                    fontSize: "12px"
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={createWorkflow}
        disabled={!name || steps.length === 0 || creating}
        style={{ 
          padding: "10px 20px", 
          backgroundColor: (name && steps.length > 0 && !creating) ? "#4CAF50" : "#ccc", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: (name && steps.length > 0 && !creating) ? "pointer" : "not-allowed",
          fontSize: "16px",
          fontWeight: "bold"
        }}
      >
        {creating ? "Creating..." : "Create Workflow"}
      </button>
    </div>
  );
}