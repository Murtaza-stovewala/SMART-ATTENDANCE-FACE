document.getElementById("scheduleForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const course = document.getElementById("courseName").value.trim();
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (course && start && end) {
    const table = document.getElementById("scheduleTable").querySelector("tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course}</td>
      <td>${start}</td>
      <td>${end}</td>
      <td><button class="delete">Delete</button></td>
    `;
    table.appendChild(row);

    document.getElementById("scheduleForm").reset();
  }
});

document.getElementById("scheduleTable").addEventListener("click", function(e) {
  if (e.target.classList.contains("delete")) {
    const row = e.target.closest("tr");
    row.remove();
  }
});
