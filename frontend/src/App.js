import { useEffect, useState, useCallback  } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [entries, setEntries] = useState({});

  const BASE_URL = "https://task-tracker-sl0i.onrender.com";
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
    <div style={{ padding: "20px" }}>
      <h1>Task Tracker</h1>

      {/* ADD TASK */}
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTask}>Add Task</button>

      {/* DATE SELECTOR */}
      <div style={{ marginBottom: "10px" }}>
        <strong>Date:</strong>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* 🆕 NEW TASKS */}
      <h2>🆕 New</h2>
      {newTasks.length === 0 && <p>No new tasks</p>}

      {newTasks.map(task => (
        <div key={task.id} style={{ marginBottom: "10px" }}>
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

          <button onClick={() => saveEntry(task.id)}>Save</button>
        </div>
      ))}

      {/* ✅ DONE */}
      <h2>✅ Done</h2>
      {doneTasks.length === 0 && <p>No completed tasks</p>}

      {doneTasks.map(task => (
        <div key={task.id} style={{ marginBottom: "10px" }}>
          <h3>{task.name}</h3>
        </div>
      ))}

      {/* ⏳ PENDING */}
      <h2>⏳ Pending</h2>
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