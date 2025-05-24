document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const teacherId = document.getElementById("teacherId").value.trim();
      const teacherPassword = document.getElementById("teacherPassword").value.trim();

      if (!teacherId || !teacherPassword) {
        alert("Please enter both ID and password.");
        return;
      }

      try {
        const res = await fetch("https://smart-attendance-face.onrender.com/api/teacher/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ teacherId, password: teacherPassword })
        });

        const data = await res.json();

        if (res.ok) {
          // ✅ Save teacher info if needed
          localStorage.setItem("teacherId", data.teacher.teacherId);
          localStorage.setItem("teacherName", data.teacher.name);

          // Redirect to teacher dashboard
          window.location.href = "../dashboard/dashboard.html";
          

          alert("Login successful!");
          window.location.href = "../dashboard/dashboard.html"; // or wherever your teacher dashboard is
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Server error. Please try again later.");
      }
    });
  }
});
