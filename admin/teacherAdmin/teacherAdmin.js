document.getElementById("teacherForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const teacherId = document.getElementById("teacherId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !teacherId || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const res = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/admin/add-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, teacherId, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "✅ Teacher added successfully.");
      document.getElementById("teacherForm").reset();
    } else {
      alert(data.message || "❌ Failed to add teacher.");
    }
  } catch (err) {
    console.error("Error adding teacher:", err);
    alert("❌ Server error. Please try again.");
  }
});
