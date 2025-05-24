document.addEventListener("DOMContentLoaded", () => {
  const studentId = localStorage.getItem("studentId");

  // ✅ Check if logged in
  if (!studentId) {
    alert("Not logged in. Redirecting to login...");
    window.location.href = "/student/login/login.html";
    return;
  }

  // ✅ Fetch student profile
  fetch(`https://smart-attendance-system-2p2j.onrender.com/api/students/profile/${studentId}`)
    .then(async (res) => {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (res.ok && data.success) {
          document.getElementById("student-name").textContent = data.student.name;
          document.getElementById("student-email").textContent = data.student.email;
          document.getElementById("student-collegeId").textContent = data.student.collegeId;
        } else {
          alert("Could not load student profile.");
        }
      } catch (err) {
        console.error("Invalid JSON from server:", text);
        alert("Failed to load profile (invalid response).");
      }
    })
    .catch(err => {
      console.error("Profile fetch error:", err);
    });

  // ✅ Dummy attendance values (replace with real values later)
  const present = 78;
  const absent = 22;
  const attendancePercent = (present / (present + absent)) * 100;

  // ✅ Set alert message dynamically
  const alertMsg = document.getElementById("attendance-alert");
  if (attendancePercent < 75) {
    alertMsg.textContent = "⚠ Your attendance is below 75%. Please attend more lectures.";
  } else {
    alertMsg.textContent = "✅ Great job! Your attendance is above 75%.";
  }

  // ✅ Charts
  const overallCtx = document.getElementById("overallChart").getContext("2d");
  new Chart(overallCtx, {
    type: "pie",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [present, absent],
        backgroundColor: ["#4ade80", "#f87171"]
      }]
    }
  });

  const lectureCtx = document.getElementById("lectureChart").getContext("2d");
  new Chart(lectureCtx, {
    type: "bar",
    data: {
      labels: ["Math", "Physics", "CS", "AI", "ML"],
      datasets: [{
        label: "Attendance (%)",
        data: [85, 70, 80, 75, 90],
        backgroundColor: "#60a5fa"
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
});

// ✅ Logout function
function logout() {
  localStorage.removeItem("studentId");
  window.location.href = "/student/login/login.html";
}

// ✅ Complaint submission
function submitComplaint() {
  const message = document.querySelector("textarea").value.trim();
  if (message) {
    alert("Complaint submitted. Teacher will review it.");
    document.querySelector("textarea").value = "";
  } else {
    alert("Please enter your complaint before submitting.");
  }
}
