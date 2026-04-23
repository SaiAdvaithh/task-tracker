import { useEffect, useState, useCallback } from "react";
// ✅ IMPORT ONLY WHAT YOU USE
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// ✅ Move constants OUTSIDE
const BASE_URL = process.env.REACT_APP_API_URL;
const USER_ID = "test123";
// ✅ CLEAN CODE: meaningful variable names, consistent formatting, no commented code, no eslint disables, and proper use of hooks.
function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [entries, setEntries] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // ✅ FETCH TASKS
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${USER_ID}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ✅ FETCH ENTRIES (fixed dependencies)
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/entries/${USER_ID}`);
      const data = await res.json();

      const formatted = {};
      // ✅ Format entries by task_id for easy access
      if (Array.isArray(data)) {
        data.forEach((entry) => {
          if (entry.date === selectedDate) {
            formatted[entry.task_id] = entry;
          }
        });
      }

      setEntries(formatted);
    } catch (err) {
      console.error(err);
    }
  }, [selectedDate]);

  // ✅ FETCH WEEKLY STATS
  const fetchWeeklyStats = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/weekly-stats`);
      const data = await res.json();
      if (Array.isArray(data)) setWeeklyData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // ✅ useEffect CLEAN (no eslint disable)
  useEffect(() => {
    fetchTasks();
    fetchEntries();
    fetchWeeklyStats();
  }, [fetchTasks, fetchEntries, fetchWeeklyStats]);

  // ✅ ADD TASK
  const addTask = async () => {
    if (!newTask.trim()) return;
    // ✅ Use template literals for cleaner code
    await fetch(
      `${BASE_URL}/add-task?name=${newTask}&user_id=${USER_ID}`,
      { method: "POST" }
    );
    // ✅ Clear input and refresh tasks
    setNewTask("");
    fetchTasks();
  };

  // ✅ HANDLE CHANGE
  const handleChange = (taskId, field, value) => {
    setEntries((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  // ✅ SAVE ENTRY
  const saveEntry = async (taskId) => {
    const entry = entries[taskId];
    if (!entry || !entry.status) return alert("Select status");

    await fetch(
      `${BASE_URL}/add-entry?task_id=${taskId}&status=${entry.status}&comment=${
        entry.comment || ""
      }&date=${selectedDate}`,
      { method: "POST" }
    );

    fetchEntries();
  };

  // ✅ GROUPING
  const newTasks = tasks.filter((t) => !entries[t.id]?.status);
  const doneTasks = tasks.filter((t) => entries[t.id]?.status === "Done");
  const pendingTasks = tasks.filter(
    (t) => entries[t.id]?.status === "Pending"
  );
  const notDoneTasks = tasks.filter(
    (t) => entries[t.id]?.status === "Not Done"
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #dbeafe, #e9d5ff)",
        padding: "30px"
      }}
    >
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <h1
          style={{
            textAlign: "center",
            fontSize: "32px",
            marginBottom: "25px"
          }}
        >
          🚀 Task Tracker
        </h1>

        {/* ADD TASK */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task..."
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }}
          />

          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Add
          </button>
        </div>

        {/* DATE */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        {/* CHART */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <h3>📊 Weekly Progress</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="done" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TASK SECTIONS */}
        {[
          { title: "🆕 New", data: newTasks },
          { title: "✅ Done", data: doneTasks },
          { title: "⏳ Pending", data: pendingTasks },
          { title: "❌ Not Done", data: notDoneTasks }
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: "20px" }}>
            <h2>{section.title}</h2>

            {section.data.length === 0 && <p>No tasks</p>}

            {section.data.map((task) => (
              <div
                key={task.id}
                style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  marginTop: "10px",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.08)"
                }}
              >
                <h4>{task.name}</h4>

                {!entries[task.id]?.status && (
                  <>
                    <select
                      value={entries[task.id]?.status || ""}
                      onChange={(e) =>
                        handleChange(task.id, "status", e.target.value)
                      }
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        marginTop: "5px"
                      }}
                    >
                      <option value="">Select</option>
                      <option>Done</option>
                      <option>Pending</option>
                      <option>Not Done</option>
                    </select>

                    <input
                      placeholder="Comment"
                      onChange={(e) =>
                        handleChange(task.id, "comment", e.target.value)
                      }
                      style={{
                        marginLeft: "10px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ddd"
                      }}
                    />

                    <button
                      onClick={() => saveEntry(task.id)}
                      style={{
                        marginLeft: "10px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "6px"
                      }}
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;