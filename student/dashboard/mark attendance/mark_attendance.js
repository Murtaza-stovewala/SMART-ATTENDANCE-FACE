
let faceDescriptor = null;
let studentId = null;
let studentName = null;
let studentCollegeId = null;

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("../../register/facemodels"),
    faceapi.nets.faceLandmark68Net.loadFromUri("../../register/facemodels"),
    faceapi.nets.faceRecognitionNet.loadFromUri("../../register/facemodels")
  ]);
  console.log("✅ FaceAPI models loaded");
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      document.getElementById("video").srcObject = stream;
      document.getElementById("cameraSection").style.display = "block";
      console.log("📷 Camera started");
    })
    .catch(err => {
      console.error("Camera error:", err);
      document.getElementById("location-status").textContent = "❌ Unable to access camera.";
    });
}

async function captureFace(code) {
  console.log("📸 Capturing face...");
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    console.log("❌ Face not detected");
    resultMessage.textContent = "❌ Face not detected.";
    resultMessage.style.color = "red";
    return;
  }

  faceDescriptor = Array.from(detection.descriptor);
  console.log("📡 Sending face descriptor to backend", faceDescriptor);

  const response = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/attendance/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId: studentCollegeId, code, faceDescriptor })
  });

  const data = await response.json();
  console.log("📥 Response from server:", data);

  if (response.ok) {
    resultMessage.textContent = `✅ Attendance marked successfully for ${studentName}`;
    resultMessage.style.color = "green";
    alert(`✅ Attendance marked for ${studentName}`);
  } else {
    resultMessage.textContent = data.message;
    resultMessage.style.color = "red";
  }

  video.srcObject.getTracks().forEach(track => track.stop());
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadModels();

  studentId = localStorage.getItem("studentId");

  if (!studentId) {
    alert("Not logged in. Redirecting...");
    window.location.href = "/student/login/login.html";
    return;
  }

  try {
    const res = await fetch(`https://smart-attendance-system-2p2j.onrender.com/api/students/profile/${studentId}`);
    const data = await res.json();
    if (res.ok && data.success) {
      studentName = data.student.name;
      studentCollegeId = data.student.collegeId;
      console.log(`✅ Logged in as ${studentName} (${studentCollegeId})`);
    } else {
      alert("⚠ Could not fetch student profile.");
    }
  } catch (err) {
    console.error("❌ Failed to fetch student profile", err);
    alert("Server error. Try again.");
  }
});

const form = document.getElementById("attendanceForm");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const locationStatus = document.getElementById("location-status");
const resultMessage = document.getElementById("resultMessage");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const inputCode = document.getElementById("code").value.trim();

  console.log("🔍 Validating code:", inputCode);

  try {
    const res = await fetch("https://smart-attendance-system-2p2j.onrender.com/api/code/active");
    const data = await res.json();
    console.log("🧾 Active code response:", data);

    if (!data || !data.code) {
      locationStatus.textContent = "❌ No active attendance code found.";
      locationStatus.style.color = "red";
      return;
    }

    const teacherCode = data.code;
    const teacherLat = data.latitude;
    const teacherLng = data.longitude;

    if (inputCode !== teacherCode) {
      locationStatus.textContent = "❌ Invalid or expired code.";
      locationStatus.style.color = "red";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userCoords = position.coords;
        const distance = getDistance(userCoords.latitude, userCoords.longitude, teacherLat, teacherLng);

        console.log("📍 Student Location:", userCoords.latitude, userCoords.longitude);
        console.log("📍 Teacher Location:", teacherLat, teacherLng);
        console.log("📏 Distance (meters):", distance);

        locationStatus.textContent = `📏 You are ${distance.toFixed(2)} meters from the teacher.`;

        if (distance <= 100) {
          locationStatus.textContent += " ✅ Within attendance zone.";
          locationStatus.style.color = "green";
          startCamera();

          const captureBtn = document.getElementById("captureBtn");
          captureBtn.onclick = () => {
            captureFace(inputCode);
          };
        } else {
          locationStatus.textContent += " ❌ You are outside the attendance zone.";
          locationStatus.style.color = "red";
        }
      },
      (error) => {
        console.error("❌ Geolocation error:", error.message);
        locationStatus.textContent = "❌ Could not retrieve your location.";
        locationStatus.style.color = "red";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    locationStatus.textContent = "❌ Server error. Please try again later.";
    locationStatus.style.color = "red";
  }
});
