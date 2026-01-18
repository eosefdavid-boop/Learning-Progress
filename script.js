document.addEventListener("DOMContentLoaded", () => {

  // ===== DAILY GOAL =====
  function saveGoal() {
    const goal = document.getElementById("goalInput").value;
    if (!goal) return;

    localStorage.setItem("studyGoal", goal);
    document.getElementById("goalDisplay").innerText = "🎯 " + goal;
  }
  window.saveGoal = saveGoal;

  document.getElementById("goalDisplay").innerText =
    "🎯 " + (localStorage.getItem("studyGoal") || "No goal set");

  // ===== CUSTOM TIMER (REPLACEMENT) =====
let defaultMinutes = Number(localStorage.getItem("timerMinutes")) || 25;
let time = defaultMinutes * 60;
let interval = null;

// Load saved value into input
document.getElementById("timerMinutes").value = defaultMinutes;
updateTimer();

function saveTimer() {
  const mins = Number(document.getElementById("timerMinutes").value);
  if (mins < 1) return;

  localStorage.setItem("timerMinutes", mins);
  defaultMinutes = mins;
  resetTimer();
}
window.saveTimer = saveTimer;

function startTimer() {
  if (interval) return;

  interval = setInterval(() => {
    if (time <= 0) {
      clearInterval(interval);
      interval = null;
      alert("Session complete! Great focus 👏");
      logSession();
      addProgress();
      resetTimer();
      return;
    }
    time--;
    updateTimer();
  }, 1000);
}
window.startTimer = startTimer;

function resetTimer() {
  clearInterval(interval);
  interval = null;
  time = defaultMinutes * 60;
  updateTimer();
}
window.resetTimer = resetTimer;

function updateTimer() {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  document.getElementById("timer").innerText =
    `${min}:${sec.toString().padStart(2, "0")}`;
}


  // ===== PROGRESS =====
  let progress = Number(localStorage.getItem("progress")) || 0;

  function addProgress() {
    progress = Math.min(progress + 5, 100);
    localStorage.setItem("progress", progress);
    updateProgress();
  }
  window.addProgress = addProgress;

  function updateProgress() {
    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressText").innerText = progress + "%";
  }
  updateProgress();

  // ===== STUDY LOG =====
 function saveLog() {
  const text = document.getElementById("studyLog").value;
  if (!text) return;

  let logs = JSON.parse(localStorage.getItem("studyLogs")) || [];
  logs.push(text);
  localStorage.setItem("studyLogs", JSON.stringify(logs));

  renderLogs();
  document.getElementById("studyLog").value = "";

  updateStreak();
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem("studyLogs")) || [];
  const list = document.getElementById("logList");
  list.innerHTML = "";

  logs.forEach(log => {
    const li = document.createElement("li");
    li.innerText = "🧠 " + log;
    list.appendChild(li);
  });
}

renderLogs();

  // ===== STUDY TIPS =====
  function showTip() {
    const tips = [
  "Set a clear goal before each study session (Example: Finish 10 math problems or understand photosynthesis).",
  "Use the Pomodoro Technique: Study for 25 minutes, then take a 5-minute break.",
  "Active recall beats rereading. Test yourself instead of just reading notes.",
  "Teach what you learn to someone else. It reinforces understanding.",
  "Study a little every day. 1–2 hours daily is better than 8 hours the night before an exam.",
  "Create a simple study schedule to avoid wasting time deciding what to study.",
  "Review before sleeping. A 10–15 minute review before bed improves memory.",
  "Study with light background noise if it helps you focus.",
  "Sleep at least 7–8 hours. A well-rested brain learns better.",
  "Drink water while studying. Hydration improves concentration."
];

    const tip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById("studyTip").innerText = tip;
  }
  window.showTip = showTip;

  // ===== STREAK =====
  function updateStreak() {
    const today = new Date().toDateString();
    const last = localStorage.getItem("lastStudyDay");
    let streak = Number(localStorage.getItem("streak")) || 0;

    if (last !== today) {
      streak++;
      localStorage.setItem("streak", streak);
      localStorage.setItem("lastStudyDay", today);
    }

    document.getElementById("streakText").innerText = `🔥 ${streak} days`;
  }

  document.getElementById("streakText").innerText =
    `🔥 ${localStorage.getItem("streak") || 0} days`;

  // ===== ANALYTICS (SAFE OFFLINE) =====
  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  let chart = null;

  function logSession() {
    const day = new Date().toLocaleDateString();
    sessions.push(day);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    updateChart();
  }

  function updateChart() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js not available offline — skipping chart");
      return;
    }

    const counts = {};
    sessions.forEach(d => counts[d] = (counts[d] || 0) + 1);

    const canvas = document.getElementById("studyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: "Study Sessions",
          data: Object.values(counts)
        }]
      }
    });
  }

  updateChart();

});
