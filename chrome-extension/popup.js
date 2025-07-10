const micBtn = document.getElementById('micBtn');
const toneSelect = document.getElementById('tone');
const previewBox = document.getElementById('previewBox');
const loading = document.getElementById('loading');
const insertBtn = document.getElementById("insertEmail");

let mediaRecorder;
let lastSubject = "";
let lastBody = "";

micBtn.onclick = async () => {
  micBtn.disabled = true;
  previewBox.innerText = "";
  loading.style.display = "block";

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  const chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1];
      const tone = toneSelect.value;

      try {
        const res = await fetch('http://127.0.0.1:5000/process-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio, tone: tone })
        });

        const data = await res.json();

        if (data.subject && data.body) {
          lastSubject = data.subject;
          lastBody = data.body;
          previewBox.innerText = `Subject: ${data.subject}\n\nBody:\n${data.body}`;
        } else {
          previewBox.innerText = "Error generating email.";
        }

      } catch (err) {
        console.error("🚨 Fetch error:", err);
        previewBox.innerText = "Failed to connect to server.";
      }

      loading.style.display = "none";
      micBtn.disabled = false;
    };

    reader.readAsDataURL(blob);
  };

  mediaRecorder.start();
  let timeLeft = 15;
  countdown.innerText = `⏳ Recording... ${timeLeft}s`;

  countdownInterval = setInterval(() => {
    timeLeft--;
    countdown.innerText = `⏳ Recording... ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdown.innerText = ""; // Clear countdown
    }
  }, 1000);


  setTimeout(() => mediaRecorder.stop(), 15000); // record for 15s
};


stopBtn.onclick = () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    clearInterval(countdownInterval);
  }
};

function startCountdown(seconds) {
  let timeLeft = seconds;
  countdown.innerText = `⏳ ${timeLeft} seconds left`;
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      countdown.innerText = `⏳ ${timeLeft} seconds left`;
    } else {
      clearInterval(countdownInterval);
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }
  }, 1000);
}

insertBtn.onclick = () => {
  if (!lastSubject || !lastBody) {
    alert("❗ Please generate the email first.");
    return;
  }

  const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(lastSubject)}&body=${encodeURIComponent(lastBody)}`;
  window.open(gmailURL, '_blank');
};
