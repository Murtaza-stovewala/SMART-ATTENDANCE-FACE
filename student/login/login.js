document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const collegeId = loginForm.elements[0].value.trim();
    const password = loginForm.elements[1].value.trim();

    if (!collegeId || !password) {
      alert("Please enter all fields");
      return;
    }

    try {
      const res = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("studentId", data.student._id); // ✅ Store ID for dashboard
        console.log("✅ studentId saved:", data.student._id);
        alert("Login successful!");
        window.location.href = "/student/dashboard/dashboard.html";
      } else {
        alert(data.message || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Try again.");
    }
  });
});
