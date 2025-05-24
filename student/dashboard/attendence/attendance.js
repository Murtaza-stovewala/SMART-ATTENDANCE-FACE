function exportCSV() {
  const rows = [...document.querySelectorAll("table tr")].map(row =>
    [...row.children].map(cell => cell.innerText).join(",")
  );
  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function filterTable() {
  const filter = document.getElementById("subjectFilter").value.toLowerCase();
  const rows = document.querySelectorAll("#attendanceTable tbody tr");

  rows.forEach(row => {
    const subject = row.children[1].innerText.toLowerCase();
    row.style.display = (filter === "all" || subject === filter) ? "" : "none";
  });

  updateChart();
}

function updateChart() {
  const rows = document.querySelectorAll("#attendanceTable tbody tr");
  let present = 0, absent = 0;

  rows.forEach(row => {
    if (row.style.display !== "none") {
      const status = row.children[2].innerText.toLowerCase();
      if (status === "present") present++;
      else if (status === "absent") absent++;
    }
  });

  const chart = Chart.getChart("attendanceChart");
  if (chart) {
    chart.data.datasets[0].data = [present, absent];
    chart.update();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("attendanceChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [2, 1],
        backgroundColor: ["#4ade80", "#f87171"]
      }]
    }
  });

  const chartCanvas = document.getElementById("attendanceChart");
chartCanvas.style.width = "300px";
chartCanvas.style.height = "300px";

});