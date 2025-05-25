let countdownTimer;
let generatedCode = "";

document.addEventListener("DOMContentLoaded", () => {
  const teacherName = localStorage.getItem("teacherName");
  const teacherId = localStorage.getItem("teacherId");

  if (!teacherId) {
    alert("Not logged in. Redirecting to login...");
    window.location.href = "/teacherupdate/login/login.html";
    return;
  }

  document.getElementById("teacher-name").textContent = teacherName || "Teacher";

  // If code is still valid, resume countdown
  const savedCode = localStorage.getItem("generatedCode");
  const codeTimeRaw = localStorage.getItem("codeGeneratedAt");

  if (savedCode && codeTimeRaw) {
    const codeTime = new Date(codeTimeRaw);
    const now = new Date();
    const diffInSeconds = Math.floor((now - codeTime) / 1000);

    if (diffInSeconds < 600) {
      // Resume existing code
      generatedCode = savedCode;
      const remaining = 600 - diffInSeconds;
      showCodeBox(generatedCode, remaining);
      startCountdown(remaining);
      if (goToDashboardBtn) {
        goToDashboardBtn.style.display = "block";
        goToDashboardBtn.addEventListener("click", () => {
          window.location.href = "../dashboard.html";
        });
      }
    } else {
      // Expired, clear old data
      clearStoredCode();
    }
  }
});

function showCodeBox(code, timeLeft) {
  const codeBox = document.getElementById("codeDisplay");
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  codeBox.innerHTML = `
    <strong>Attendance Code:</strong> ${code}<br>
    <small>Valid for: <span id='timer'>${minutes}:${seconds.toString().padStart(2, "0")}</span> minutes</small>
  `;
}

function startCountdown(duration) {
  let timer = duration;
  const display = document.getElementById("timer");

  countdownTimer = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    if (--timer < 0) {
      clearInterval(countdownTimer);
      document.getElementById("codeDisplay").innerHTML = "<strong>Code expired</strong>";
      clearStoredCode();
    }
  }, 1000);
}

function clearStoredCode() {
  localStorage.removeItem("generatedCode");
  localStorage.removeItem("codeGeneratedAt");
}

function generateCode() {
  generatedCode = Math.floor(100000 + Math.random() * 900000);
  const codeTime = new Date().toISOString();

  localStorage.setItem("generatedCode", generatedCode);
  localStorage.setItem("codeGeneratedAt", codeTime);

  showCodeBox(generatedCode, 600);
  startCountdown(600);
}

function getLocationAndGenerateCode() {
  const locationBox = document.getElementById("locationInfo");

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  locationBox.textContent = "Fetching location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude.toFixed(5);
      const longitude = position.coords.longitude.toFixed(5);

      locationBox.textContent = `Location Acquired ✅ (Lat: ${latitude}, Lng: ${longitude})`;

      // Only generate if no active code
      if (!localStorage.getItem("generatedCode")) {
        generateCode();
        sendCodeToServer(generatedCode, parseFloat(latitude), parseFloat(longitude));
      }
    },
    (error) => {
      locationBox.textContent = "❌ Failed to fetch location.";
      alert("Please allow location access to generate code.");
      console.error(error);
    }
  );
}

async function sendCodeToServer(code, latitude, longitude) {
  try {
    const res = await fetch("https://smart-attendance-face.onrender.com/api/generateCode/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, latitude, longitude }),
    });

    const data = await res.json();
    console.log("✅ Code stored in MongoDB:", data);

    const goToDashboardBtn = document.getElementById("goToDashboardBtn");
    if (goToDashboardBtn) {
      goToDashboardBtn.style.display = "block";
      goToDashboardBtn.addEventListener("click", () => {
        window.location.href = "../dashboard.html";
      });
    }
  } catch (err) {
    console.error("❌ Failed to store code in MongoDB:", err);
  }
}

document
  .getElementById("generateCodeBtn")
  .addEventListener("click", getLocationAndGenerateCode);
