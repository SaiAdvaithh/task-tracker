import { useEffect, useState, useCallback  } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [entries, setEntries] = useState({});

  const BASE_URL = process.env.REACT_APP_API_URL;
  console.log(BASE_URL);
  const USER_ID = "test123";

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${USER_ID}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tasks fetch failed:", err);
    }
  };

  // FETCH ENTRIES
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/entries/${USER_ID}`);
      const data = await res.json();

      const formatted = {};

      if (Array.isArray(data)) {
        data.forEach(entry => {
          if (entry.date === selectedDate) {
            formatted[entry.task_id] = entry;
          }
        });
      }

      setEntries(formatted);
    } catch (err) {
      console.error("Entries fetch failed:", err);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // ADD TASK
  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      await fetch(`${BASE_URL}/add-task?name=${newTask}&user_id=${USER_ID}`, {
        method: "POST"
      });

      setNewTask("");
      fetchTasks();
    } catch (err) {
      console.error("Add task failed:", err);
    }
  };

  // HANDLE CHANGE
  const handleChange = (taskId, field, value) => {
    setEntries(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  // SAVE ENTRY
  const saveEntry = async (taskId) => {
    const entry = entries[taskId];

    if (!entry || !entry.status) {
      alert("Select status");
      return;
    }

    try {
      await fetch(
        `${BASE_URL}/add-entry?task_id=${taskId}&status=${entry.status}&comment=${entry.comment || ""}&date=${selectedDate}`,
        { method: "POST" }
      );

      await fetchEntries(); // ✅ refresh data after save
      alert("Saved");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // GROUPING
  const newTasks = tasks.filter(task => !entries[task.id]?.status);
  const doneTasks = tasks.filter(task => entries[task.id]?.status === "Done");
  const pendingTasks = tasks.filter(task => entries[task.id]?.status === "Pending");
  const notDoneTasks = tasks.filter(task => entries[task.id]?.status === "Not Done");

  return (
    <div style={{minHeight: "100vh",background: "linear-gradient(to right, #dbeafe, #e9d5ff)",padding: "30px"}}>
      <h1 style={{fontSize: "28px", fontWeight: "bold", marginBottom: "20px", textAlign: "center"}}> Task Tracker</h1>

      {/* ADD TASK */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        justifyContent: "center"
      }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter task"
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "60%"
          }}
        />

        <button
          onClick={addTask}
          disabled={!newTask.trim()}
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Add
        </button>
      </div>

      {/* DATE SELECTOR */}
      <div style={{
        marginBottom: "20px",
        textAlign: "center"
      }}>
        <strong>Date: </strong>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      {/* 🆕 NEW TASKS */}
      <h2 style={{ marginTop: "20px", color: "#374151" }}>🆕 New</h2>
      {newTasks.length === 0 && <p>No new tasks</p>}

      {newTasks.map(task => (
        <div key={task.id} style={{
          marginBottom: "15px",
          padding: "15px",
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}>
          <h3>{task.name}</h3>

          <select
            value={entries[task.id]?.status || ""}
            onChange={(e) =>
              handleChange(task.id, "status", e.target.value)
            }
          >
            <option value="">Select</option>
            <option>Done</option>
            <option>Pending</option>
            <option>Not Done</option>
          </select>

          <input
            value={entries[task.id]?.comment || ""}
            placeholder="Comment"
            onChange={(e) =>
              handleChange(task.id, "comment", e.target.value)
            }
          />

          <button
            onClick={() => saveEntry(task.id)}
            disabled={!entries[task.id]?.status}
            style={{
              marginTop: "10px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Save
          </button>
        </div>
      ))}

      {/* ✅ DONE */}
      <h2 style={{ marginTop: "20px", color: "#374151" }}>🆕 Done</h2>
      {doneTasks.length === 0 && <p>No completed tasks</p>}

      {doneTasks.map(task => (
        <div key={task.id} style={{ marginBottom: "10px" }}>
          <h3>{task.name}</h3>
        </div>
      ))}

      {/* ⏳ PENDING */}
      <h2 style={{ marginTop: "20px", color: "#374151" }}>🆕 Pending</h2>
      {pendingTasks.length === 0 && <p>No pending tasks</p>}

      {pendingTasks.map(task => (
        <div key={task.id} style={{ marginBottom: "10px" }}>
          <h3>{task.name}</h3>
        </div>
      ))}

      {/* ❌ NOT DONE */}
      <h2>❌ Not Done</h2>
      {notDoneTasks.length === 0 && <p>No failed tasks</p>}

      {notDoneTasks.map(task => (
        <div key={task.id} style={{ marginBottom: "10px" }}>
          <h3>{task.name}</h3>
        </div>
      ))}
    </div>
  );
}

export default App;