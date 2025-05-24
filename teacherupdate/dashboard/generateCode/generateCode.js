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

  let countdownTimer;
  let generatedCode = "";

  function generateCode() {
    generatedCode = Math.floor(100000 + Math.random() * 900000);
    const codeBox = document.getElementById("codeDisplay");

    if (!codeBox) return;

    codeBox.innerHTML =
      "<strong>Attendance Code:</strong> " +
      generatedCode +
      "<br><small>Valid for: <span id='timer'>10:00</span> minutes</small>";

    clearInterval(countdownTimer);
    startCountdown(600); // 10 minutes
  }

  function startCountdown(duration) {
    let timer = duration;
    const display = document.getElementById("timer");

    if (!display) return;

    countdownTimer = setInterval(() => {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;

      display.textContent =
        (minutes < 10 ? "0" : "") + minutes + ":" +
        (seconds < 10 ? "0" : "") + seconds;

      if (--timer < 0) {
        clearInterval(countdownTimer);
        const codeBox = document.getElementById("codeDisplay");
        if (codeBox) {
          codeBox.innerHTML = "<strong>Code expired</strong>";
        }
      }
    }, 1000);
  }

  function getLocationAndGenerateCode() {
    const locationBox = document.getElementById("locationInfo");
    if (!locationBox) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      locationBox.textContent = "❌ Geolocation not supported.";
      return;
    }

    locationBox.textContent = "📍 Fetching location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);

        locationBox.textContent =
          "✅ Location Acquired (Lat: " + latitude + ", Lng: " + longitude + ")";

        console.log("Teacher Location:", latitude, longitude);

        generateCode();
        sendCodeToServer(generatedCode, parseFloat(latitude), parseFloat(longitude));
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
      const res = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/generateCode/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, latitude, longitude }),
      });

      const data = await res.json();
      console.log("✅ Code stored in MongoDB:", data);
    } catch (err) {
      console.error("❌ Failed to store code in MongoDB:", err);
    }
  }

  const generateBtn = document.getElementById("generateCodeBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", getLocationAndGenerateCode);
  }
});
