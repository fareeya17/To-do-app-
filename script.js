const KEY = "todo-tasks";
const todayStr = new Date().toDateString();

let filter = "all";
let tasks = JSON.parse(localStorage.getItem(KEY)) || [
  { id: 1, text: "Finish my website project", priority: "high", done: false, date: todayStr },
  { id: 2, text: "Read a book for 30 minutes", priority: "medium", done: false, date: todayStr },
  { id: 3, text: "Go for a morning walk", priority: "low", done: false, date: todayStr }
];

const list = document.getElementById("taskList");
const input = document.getElementById("taskInput");
const prioritySel = document.getElementById("priority");
const dateInput = document.getElementById("dueDate");

function toInputValue(d) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
dateInput.value = toInputValue(new Date());

// Show today's date in the header
document.getElementById("date").textContent =
  new Date().toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function whenLabel(date) {
  const day = 86400000;
  if (date === todayStr) return "Today";
  if (date === new Date(Date.now() + day).toDateString()) return "Tomorrow";
  if (date === new Date(Date.now() - day).toDateString()) return "Yesterday";
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function visibleTasks() {
  return tasks.filter(t => {
    if (filter === "today") return t.date === todayStr;
    if (filter === "important") return t.priority === "high";
    if (filter === "completed") return t.done;
    return true;
  });
}

function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressText").textContent =
    total ? `${done} of ${total} tasks done 🎯` : "No tasks yet";
  document.getElementById("progressFill").style.width = percent + "%";
}

function render() {
  updateProgress();
  const items = visibleTasks();

  if (items.length === 0) {
    list.innerHTML = '<li class="empty">No tasks here yet ✨</li>';
    return;
  }

  list.innerHTML = items.map(t => `
    <li class="task ${t.priority} ${t.done ? "done" : ""}" data-id="${t.id}">
      <input type="checkbox" class="check" ${t.done ? "checked" : ""}>
      <div class="info">
        <div class="title">${escapeHTML(t.text)}</div>
        <div class="meta">
          <span class="badge ${t.priority}">${t.priority}</span>
          <span class="when">📅 ${whenLabel(t.date)}</span>
        </div>
      </div>
      <button class="edit">✏️</button>
      <button class="del">🗑️</button>
    </li>
  `).join("");
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  let due = todayStr;
  if (dateInput.value) {
    const [y, m, d] = dateInput.value.split("-").map(Number);
    due = new Date(y, m - 1, d).toDateString();
  }

  tasks.unshift({
    id: Date.now(),
    text,
    priority: prioritySel.value,
    done: false,
    date: due
  });

  input.value = "";
  prioritySel.value = "none";
  dateInput.value = toInputValue(new Date());
  save();
  render();
}

// Add button + Enter key
document.getElementById("addBtn").addEventListener("click", addTask);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// Complete / delete (one listener for all tasks)
list.addEventListener("click", e => {
  const li = e.target.closest(".task");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains("check")) {
    const task = tasks.find(t => t.id === id);
    task.done = !task.done;
  } else if (e.target.classList.contains("del")) {
    tasks = tasks.filter(t => t.id !== id);
  } else if (e.target.classList.contains("edit")) {
    const task = tasks.find(t => t.id === id);
    const newText = prompt("Edit task:", task.text);
    if (newText === null || !newText.trim()) return;
    task.text = newText.trim();
  } else {
    return;
  }
  save();
  render();
});

// Filters: top chips and bottom nav stay in sync
document.querySelectorAll(".chip, .nav").forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".chip, .nav").forEach(b =>
      b.classList.toggle("active", b.dataset.filter === filter)
    );
    render();
  });
});
const themeBtn = document.getElementById("themeBtn");

function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeBtn.textContent = dark ? "☀️" : "🌙";
}

applyTheme(localStorage.getItem("todo-theme") === "dark");

themeBtn.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  localStorage.setItem("todo-theme", dark ? "dark" : "light");
  applyTheme(dark);
});
function setGreeting() {
  const h = new Date().getHours();
  let text = "Good Morning";
  let icon = "☀️";

  if (h >= 12 && h < 17) {
    text = "Good Afternoon";
    icon = "🌤️";
  } else if (h >= 17 && h < 21) {
    text = "Good Evening";
    icon = "🌇";
  } else if (h >= 21 || h < 5) {
    text = "Good Night";
    icon = "🌙";
  }

  document.getElementById("greeting").textContent = text;
  document.getElementById("greetIcon").textContent = icon;
}

setGreeting();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
render();