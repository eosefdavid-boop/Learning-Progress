/* ========================= STATE ========================= */
let focusMinutes = Number(localStorage.getItem("focusMinutes")) || 25;
let breakMinutes = Number(localStorage.getItem("breakMinutes")) || 5;
let totalStudyMinutes = Number(localStorage.getItem("totalStudyMinutes")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;
let lastStudyDate = localStorage.getItem("lastStudyDate") || null;
let logs = JSON.parse(localStorage.getItem("studyLogs")) || [];
let chart;
let timerInterval;
let isFocus = true;
let remainingSeconds = focusMinutes * 60;

/* SETTINGS */
let settings = JSON.parse(localStorage.getItem("settings")) || {
  theme: "light",
  accent: "#991b1b",
  font: "medium",
  defaultFocus: focusMinutes,
  defaultBreak: breakMinutes,
  autoStart: false,
  sound: true,
  profileName: "",
  motivationQuote: "Stay consistent!"
};

/* FILE ORGANIZER */
let sectors = JSON.parse(localStorage.getItem("sectors")) || [];

/* ========================= ON LOAD ========================= */
document.addEventListener("DOMContentLoaded", () => {
  applySettings();
  loadGoal();
  loadLogs();
  updateProgress();
  updateStreak();
  showTip();
  initChart();

  document.getElementById("focusMinutes").value = focusMinutes;
  document.getElementById("breakMinutes").value = breakMinutes;

  // Load settings modal inputs
  document.getElementById("themeSelect").value = settings.theme;
  document.getElementById("accentSelect").value = settings.accent;
  document.getElementById("fontSelect").value = settings.font;
  document.getElementById("defaultFocus").value = settings.defaultFocus;
  document.getElementById("defaultBreak").value = settings.defaultBreak;
  document.getElementById("autoStart").checked = settings.autoStart;
  document.getElementById("soundToggle").checked = settings.sound;
  document.getElementById("profileName").value = settings.profileName;
  document.getElementById("motivationQuote").value = settings.motivationQuote;

  // Render file sectors
  renderSectors();
});

/* ========================= GOAL ========================= */
function saveGoal() {
  const goal = document.getElementById("goalInput").value;
  localStorage.setItem("dailyGoal", goal);
  document.getElementById("goalDisplay").textContent = goal;
}

function loadGoal() {
  const goal = localStorage.getItem("dailyGoal");
  if (goal) document.getElementById("goalDisplay").textContent = goal;
}

/* ========================= TIMER ========================= */
function saveTimer() {
  focusMinutes = Number(document.getElementById("focusMinutes").value);
  breakMinutes = Number(document.getElementById("breakMinutes").value);

  localStorage.setItem("focusMinutes", focusMinutes);
  localStorage.setItem("breakMinutes", breakMinutes);

  resetTimer();
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      playBeep();

      if (isFocus) {
        completeFocusSession();
        remainingSeconds = breakMinutes * 60;
        isFocus = false;
        document.getElementById("timerStatus").textContent = "Break time";
      } else {
        remainingSeconds = focusMinutes * 60;
        isFocus = true;
        document.getElementById("timerStatus").textContent = "Focus time";
      }

      if (settings.autoStart) startTimer();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isFocus = true;
  remainingSeconds = focusMinutes * 60;
  updateTimerDisplay();
  document.getElementById("timerStatus").textContent = "";
}

function updateTimerDisplay() {
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  document.getElementById("timerDisplay").textContent =
    `${min}:${sec.toString().padStart(2, "0")}`;
}

function completeFocusSession() {
  totalStudyMinutes += focusMinutes;
  localStorage.setItem("totalStudyMinutes", totalStudyMinutes);
  updateProgress();
  updateStreak();
  updateChart();
}

function playBeep() {
  if (!settings.sound) return;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}

/* ========================= PROGRESS ========================= */
function updateProgress() {
  const percent = Math.min((totalStudyMinutes / 300) * 100, 100);
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").textContent =
    `${totalStudyMinutes} minutes studied`;
}

/* ========================= LOG ========================= */
function saveLog() {
  const text = document.getElementById("studyLog").value;
  if (!text.trim()) return;

  logs.push({
    text,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("studyLogs", JSON.stringify(logs));
  document.getElementById("studyLog").value = "";
  loadLogs();
}

function loadLogs() {
  const list = document.getElementById("logList");
  list.innerHTML = "";

  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `${log.date}: ${log.text}`;
    list.appendChild(li);
  });
}

function exportLogs() {
  const blob = new Blob([JSON.stringify(logs, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study_logs.json";
  a.click();
  URL.revokeObjectURL(url);
}

/* ========================= STREAK ========================= */
function updateStreak() {
  const today = new Date().toDateString();

  if (lastStudyDate !== today) {
    if (lastStudyDate && new Date(today) - new Date(lastStudyDate) === 86400000) {
      streak++;
    } else {
      streak = 1;
    }
    lastStudyDate = today;
  }

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastStudyDate", lastStudyDate);
  document.getElementById("streakText").textContent = `${streak} days`;
}

/* ========================= TIPS ========================= */
const tips = [
  "Study in 25-minute sessions to improve focus.",
  "Teach what you learned to reinforce memory.",
  "Review notes before sleeping.",
  "Consistency beats long sessions.",
  "Remove distractions before starting."
];

function showTip() {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("studyTip").textContent = tip;
}

/* ========================= CHART ========================= */
function initChart() {
  const ctx = document.getElementById("studyChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Start", "Now"],
      datasets: [{
        label: "Total Study Minutes",
        data: [0, totalStudyMinutes],
        borderWidth: 2,
        fill: true,
        borderColor: settings.accent,
        backgroundColor: settings.accent + "33"
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateChart() {
  chart.data.datasets[0].data[1] = totalStudyMinutes;
  chart.data.datasets[0].borderColor = settings.accent;
  chart.data.datasets[0].backgroundColor = settings.accent + "33";
  chart.update();
}

/* ========================= THEME ========================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
  settings.theme = document.body.classList.contains("dark") ? "dark" : "light";
  saveSettingsLocal();
}

/* ========================= SETTINGS MODAL ========================= */
function openSettings() {
  document.getElementById("settingsModal").style.display = "block";
}

function closeSettings() {
  document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
  settings.theme = document.getElementById("themeSelect").value;
  settings.accent = document.getElementById("accentSelect").value;
  settings.font = document.getElementById("fontSelect").value;
  settings.defaultFocus = Number(document.getElementById("defaultFocus").value);
  settings.defaultBreak = Number(document.getElementById("defaultBreak").value);
  settings.autoStart = document.getElementById("autoStart").checked;
  settings.sound = document.getElementById("soundToggle").checked;
  settings.profileName = document.getElementById("profileName").value;
  settings.motivationQuote = document.getElementById("motivationQuote").value;

  applySettings();
  saveSettingsLocal();
  closeSettings();
}

function applySettings() {
  // Theme
  if (settings.theme === "dark") document.body.classList.add("dark");
  else document.body.classList.remove("dark");

  // Accent
  document.documentElement.style.setProperty('--accent-color', settings.accent);

  // Font
  document.body.classList.remove("font-small", "font-medium", "font-large");
  document.body.classList.add("font-" + settings.font);

  // Timer defaults
  focusMinutes = settings.defaultFocus;
  breakMinutes = settings.defaultBreak;
  document.getElementById("focusMinutes").value = focusMinutes;
  document.getElementById("breakMinutes").value = breakMinutes;
}

function saveSettingsLocal() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

/* ========================= RESET DATA ========================= */
function resetData() {
  if (!confirm("Are you sure you want to reset all data?")) return;
  localStorage.clear();
  location.reload();
}

/* ========================= FILE ORGANIZER ========================= */
function renderSectors() {
  const container = document.getElementById("sectorContainer");
  container.innerHTML = "";

  sectors.forEach((sector, index) => {
    const div = document.createElement("div");
    div.classList.add("sector");

    // Header: name + remove button
    const header = document.createElement("div");
    header.classList.add("sector-header");

    const input = document.createElement("input");
    input.value = sector.name;
    input.onchange = () => {
      sector.name = input.value;
      saveSectors();
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete Sector";
    removeBtn.classList.add("remove-sector");
    removeBtn.onclick = () => {
      if(confirm("Delete this sector and all files?")) {
        sectors.splice(index, 1);
        saveSectors();
        renderSectors();
      }
    };

    header.appendChild(input);
    header.appendChild(removeBtn);
    div.appendChild(header);

    // File list
    const ul = document.createElement("ul");
    ul.classList.add("file-list");
    sector.files.forEach((file, fIndex) => {
      const li = document.createElement("li");

      const link = document.createElement("a");
      link.href = file.data;
      link.download = file.name;
      link.textContent = file.name;

      const del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => {
        sector.files.splice(fIndex, 1);
        saveSectors();
        renderSectors();
      };

      li.appendChild(link);
      li.appendChild(del);
      ul.appendChild(li);
    });
    div.appendChild(ul);

    // Upload button
    const fileUpload = document.createElement("div");
    fileUpload.classList.add("file-upload");
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.multiple = true;
    inputFile.id = `fileInput${index}`;
    inputFile.onchange = (e) => {
      const selected = Array.from(e.target.files);
      selected.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(ev) {
          sector.files.push({ name: file.name, data: ev.target.result });
          saveSectors();
          renderSectors();
        };
        reader.readAsDataURL(file);
      });
    };
    const label = document.createElement("label");
    label.htmlFor = inputFile.id;
    label.textContent = "+ Upload Files";

    fileUpload.appendChild(inputFile);
    fileUpload.appendChild(label);
    div.appendChild(fileUpload);

    container.appendChild(div);
  });
}

function addSector() {
  sectors.push({ name: "New Sector", files: [] });
  saveSectors();
  renderSectors();
}

function saveSectors() {
  localStorage.setItem("sectors", JSON.stringify(sectors));
}
