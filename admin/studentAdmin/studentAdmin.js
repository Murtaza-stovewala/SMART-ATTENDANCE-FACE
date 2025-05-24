document.getElementById("collegeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const collegeId = document.getElementById("collegeId").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!collegeId || !name) {
    alert("Please fill all fields");
    return; 
  }

  try {
    const res = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/admin/add-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId, name })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Student added successfully");
      document.getElementById("collegeForm").reset();
    } else {
      alert(data.message || "Failed to add student");
    }
  } catch (err) {
    console.error("Error adding student:", err);
    alert("Server error. Please try again later.");
  }
});
