function updatePassword() {
  const newPassword = document.getElementById("newPassword").value.trim();
  if (newPassword) {
    alert("Password updated successfully (simulated).");
    document.getElementById("newPassword").value = "";
  } else {
    alert("Please enter a new password.");
  }
}

function requestReverification() {
  alert("Device reverification request sent to admin (simulated).");
}