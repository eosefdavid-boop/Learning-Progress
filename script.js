// ===== DAILY GOAL =====
function saveGoal() {
  const goal = document.getElementById("goalInput").value;
  if (!goal) return;

  localStorage.setItem("studyGoal", goal);
  document.getElementById("goalDisplay").innerText = "🎯 " + goal;
}

document.getElementById("goalDisplay").innerText =
  "🎯 " + (localStorage.getItem("studyGoal") || "No goal set");

// ===== TIMER =====
let time = 25 * 60;
let interval;

function startTimer() {
  if (interval) return;

  interval = setInterval(() => {
    if (time <= 0) {
      clearInterval(interval);
      interval = null;
      alert("Session complete! Great focus 👏");
      logSession();
      addProgress();
      time = 25 * 60;
      updateTimer();
      return;
    }
    time--;
    updateTimer();
  }, 1000);
}

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

function updateProgress() {
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById("progressText").innerText = progress + "%";
}

updateProgress();

// ===== STUDY LOG =====
function saveLog() {
  const text = document.getElementById("studyLog").value;
  if (!text) return;

  const li = document.createElement("li");
  li.innerText = "🧠 " + text;
  document.getElementById("logList").appendChild(li);
  document.getElementById("studyLog").value = "";

  updateStreak();
}

// ===== STUDY TIPS =====
function showTip() {
  const tips = [
    "“Live as if you were to die tomorrow. Learn as if you were to live forever.” — Mahatma Gandhi",
    "“The beautiful thing about learning is that no one can take it away from you.” — B.B. King",
    "“Success is the sum of small efforts repeated day in and day out.” — Robert Collier",
    "“There are no shortcuts to any place worth going.” — Beverly Sills",
    "“An investment in knowledge pays the best interest.” — Benjamin Franklin",
    "“The expert in anything was once a beginner.” — Helen Hayes",
    "“Don’t wish it were easier; wish you were better.” — Jim Rohn",
    "“Education is the most powerful weapon which you can use to change the world.” — Nelson Mandela",
    "“It always seems impossible until it’s done.” — Nelson Mandela",
    "“Learning never exhausts the mind.” — Leonardo da Vinci",
    "“Discipline is the bridge between goals and accomplishment.” — Jim Rohn",
    "“The future belongs to those who prepare for it today.” — Malcolm X",
    "“Small progress is still progress.” — Anonymous",
    "“You don’t have to be great to start, but you have to start to be great.” — Zig Ziglar",
    "“Study while others are sleeping; work while others are loafing.” — William A. Ward",
    "“If you are willing to learn, no one can stop you.” — Anonymous",
    "“Dreams don’t work unless you do.” — John C. Maxwell",
    "“Push yourself, because no one else is going to do it for you.” — Anonymous",
    "“Hard work beats talent when talent doesn’t work hard.” — Tim Notke",
    "“The secret of getting ahead is getting started.” — Mark Twain"
  ];

  const tip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("studyTip").innerText = tip;
}


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

// ===== ANALYTICS =====
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let chart;

function logSession() {
  const day = new Date().toLocaleDateString();
  sessions.push(day);
  localStorage.setItem("sessions", JSON.stringify(sessions));
  updateChart();
}

function updateChart() {
  const counts = {};
  sessions.forEach(d => counts[d] = (counts[d] || 0) + 1);

  const ctx = document.getElementById("studyChart").getContext("2d");
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
