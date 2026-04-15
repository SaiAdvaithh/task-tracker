import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState({});
  const [chartData, setChartData] = useState([]);
  const [newTask, setNewTask] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const BASE_URL = "https://task-tracker-sl0i.onrender.com";

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    const gUser = result.user;

    setUser({
      username: gUser.displayName,
      user_id: gUser.uid
    });
  };

  // FETCH TASKS
  const fetchTasks = useCallback(() => {
    if (!user) return;

    fetch(`${BASE_URL}/tasks/${user.user_id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTasks(data);
        else setTasks([]);
      });
  }, [user]);

  // FETCH ENTRIES
  const fetchEntries = useCallback(() => {
    if (!user) return;

    fetch(`${BASE_URL}/entries/${user.user_id}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        const formatted = {};
        data.forEach(entry => {
          if (entry.date === today) {
            formatted[entry.task_id] = entry;
          }
        });

        setEntries(formatted);
      });
  }, [user, today]);

  // FETCH WEEKLY STATS
  const fetchStats = () => {
    fetch(`${BASE_URL}/weekly-stats`)
      .then(res => res.json())
      .then(data => setChartData(data));
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchEntries();
      fetchStats();
    }
  }, [user, fetchTasks, fetchEntries]);

  // ADD TASK
  const addTask = () => {
    if (!newTask) return;

    fetch(`${BASE_URL}/add-task?name=${newTask}&user_id=${user.user_id}`, {
      method: "POST"
    }).then(() => {
      setNewTask("");
      fetchTasks();
      toast.success("Task added 🚀");
    });
  };

  // SAVE ENTRY
  const saveEntry = (taskId) => {
    const entry = entries[taskId];

    if (!entry || !entry.status) {
      toast.error("Select status!");
      return;
    }

    fetch(`${BASE_URL}/add-entry?task_id=${taskId}&status=${entry.status}&comment=${entry.comment || ""}&date=${today}`, {
      method: "POST"
    }).then(() => {
      toast.success("Saved ✅");
      fetchStats();
    });
  };

  const handleChange = (taskId, field, value) => {
    setEntries(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  // PIE DATA
  const done = Object.values(entries).filter(e => e.status === "Done").length;
  const pending = Object.values(entries).filter(e => e.status === "Pending").length;
  const notDone = Object.values(entries).filter(e => e.status === "Not Done").length;

  const pieData = [
    { name: "Done", value: done },
    { name: "Pending", value: pending },
    { name: "Not Done", value: notDone }
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  // LOGIN UI
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl mb-4">Login</h2>

          <button
            className="bg-red-500 text-white px-4 py-2 w-full"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold text-center mb-4">
        Welcome {user.username} 👋
      </h1>

      {/* ADD TASK */}
      <div className="max-w-3xl mx-auto mb-6 flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Add new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 rounded"
          onClick={addTask}
        >
          Add
        </button>
      </div>

      {/* TASKS */}
      <div className="grid gap-6 max-w-3xl mx-auto">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded shadow">
            <h3>{task.name}</h3>

            <select onChange={(e) => handleChange(task.id, "status", e.target.value)}>
              <option>Select</option>
              <option value="Done">✓ Done</option>
              <option value="Not Done">✗ Not Done</option>
              <option value="Pending">⏳ Pending</option>
            </select>

            <input
              placeholder="Comment"
              onChange={(e) => handleChange(task.id, "comment", e.target.value)}
            />

            <button onClick={() => saveEntry(task.id)}>
              Save
            </button>
          </div>
        ))}
      </div>

      {/* BAR CHART */}
      <div className="mt-10 bg-white p-4 rounded shadow max-w-3xl mx-auto">
        <h2>📊 Weekly Progress</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="done" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div className="mt-10 bg-white p-4 rounded shadow max-w-3xl mx-auto">
        <h2>🥧 Task Distribution</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;