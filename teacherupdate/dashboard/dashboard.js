document.addEventListener("DOMContentLoaded", () => {
  const teacherId = localStorage.getItem("teacherId");
  const teacherName = localStorage.getItem("teacherName");

  if (!teacherId) {
    alert("Not logged in. Redirecting to login...");
    window.location.href = "/teacherupdate/login/login.html";
    return;
  }

  const nameSpan = document.getElementById("teacher-name");
  if (nameSpan) {
    nameSpan.textContent = teacherName || "Teacher";
  }

  // 🔁 Load attendance immediately and every 30 seconds
  loadAttendance();
  setInterval(loadAttendance, 30000);

  // ✅ Load overrides once (doesn’t need to refresh)
  fetch(`https://smart-attendance-face.onrender.com/api/overrides/${teacherId}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#overrideTable tbody");
      tbody.innerHTML = "";

      if (data.success && data.overrides.length > 0) {
        data.overrides.forEach(entry => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${entry.studentId}</td>
            <td>${entry.name}</td>
            <td>${entry.reason}</td>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
          `;
          tbody.appendChild(row);
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No overrides yet</td></tr>`;
      }
    })
    .catch(err => console.error("Override fetch error:", err));

  function loadAttendance() {
    const codeGeneratedAtRaw = localStorage.getItem("codeGeneratedAt");

    const tbody = document.querySelector("#liveTable tbody");

    if (!codeGeneratedAtRaw) {
      tbody.innerHTML =
        `<tr><td colspan="4" style="text-align:center; color:red;">⚠️ No active session. Generate a code first.</td></tr>`;
      return;
    }

    const codeGeneratedAt = new Date(codeGeneratedAtRaw);
    const now = new Date();
    const diffInMinutes = (now - codeGeneratedAt) / (1000 * 60);

    if (diffInMinutes > 90) {
      tbody.innerHTML =
        `<tr><td colspan="4" style="text-align:center; color:red;">⏱ Attendance window expired (1.5 hours).</td></tr>`;
      return;
    }

    fetch(`https://smart-attendance-face.onrender.com/api/attendance/live/${teacherId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch attendance");
        return res.json();
      })
      .then(data => {
        tbody.innerHTML = "";

        const recentStudents = data.attendance.filter(record => {
          const markTime = new Date(record.timestamp || record.markedAt || record.createdAt);
          return markTime >= codeGeneratedAt;
        });

        if (recentStudents.length > 0) {
          recentStudents.forEach(record => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${record.studentId}</td>
              <td>${record.name}</td>
              <td class="${record.status.toLowerCase()}">${record.status}</td>
              <td><button class="markAbsent">Mark Absent</button></td>
            `;
            tbody.appendChild(row);
          });
          attachAbsentHandlers();
        } else {
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No recent attendance found.</td></tr>`;
        }
      })
      .catch(err => console.error("Live attendance error:", err));
  } 

  function attachAbsentHandlers() {
    document.querySelectorAll(".markAbsent").forEach(button => {
      button.addEventListener("click", e => {
        const row = e.target.closest("tr");
        const studentId = row.children[0].textContent; 

        fetch("https://smart-attendance-face.onrender.com/attendance/mark-absent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, studentId }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              row.children[2].textContent = "Absent";
              row.children[2].className = "absent";
              e.target.disabled = true;
            } else {
              alert("❌ Failed to mark absent.");
            }
          })
          .catch(err => console.error("Mark absent error:", err));
      });
    });
  }
});
function logout() {
localStorage.removeItem("teacherId");
localStorage.removeItem("teacherName");
localStorage.removeItem("teacherToken"); // if you're using token storage
localStorage.removeItem("codeGeneratedAt"); // optional: clears session code
window.location.href = "/teacherupdate/login/login.html";
}