document.addEventListener("DOMContentLoaded", () => {
  const teacherId = localStorage.getItem("teacherId");
  const teacherName = localStorage.getItem("teacherName");

  // 🔐 Redirect if not logged in
  if (!teacherId) {
    alert("Not logged in. Redirecting to login...");
    window.location.href = "/teacherupdate/login/login.html";
    return;
  }

  // 👤 Show teacher name
  const nameSpan = document.getElementById("teacher-name");
  if (nameSpan) {
    nameSpan.textContent = teacherName || "Teacher";
  }

  // 👥 Fetch and display live attendance list
  fetch(`https://smart-attendance-face.onrender.com/api/attendance/live/${teacherId}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    })
    .then(data => {
      const tbody = document.querySelector("#liveTable tbody");
      tbody.innerHTML = "";

      if (data.success && data.attendance.length > 0) {
        data.attendance.forEach(record => {
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
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No attendance yet</td></tr>`;
      }
    })
    .catch(err => console.error("Live attendance error:", err));

  // ❌ Attach "Mark Absent" handler
  function attachAbsentHandlers() {
    document.querySelectorAll(".markAbsent").forEach(button => {
      button.addEventListener("click", e => {
        const row = e.target.closest("tr");
        const studentId = row.children[0].textContent;

        fetch("https://smart-attendance-face.onrender.com/api/attendance/mark-absent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId, studentId })
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

  // 📝 Fetch override requests (optional)
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
});

// 🔓 Logout
function logout() {
  localStorage.removeItem("teacherId");
  localStorage.removeItem("teacherName");
  localStorage.removeItem("teacherToken");
  window.location.href = "/teacherupdate/login/login.html";
}

// 📤 Export to Excel
function exportToExcel() {
  const table = document.getElementById("liveTable");
  if (!table) return;

  const rows = Array.from(table.rows);
  const csv = rows.map(row =>
    Array.from(row.cells).map(cell => `"${cell.textContent.trim()}"`).join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}
