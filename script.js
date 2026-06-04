(function () {
  "use strict";

  if (typeof window.ZXI_BOOKMARK_LOAD === "undefined") {
    console.log(
      "%cAccess Denied - Bookmark Required",
      "color:#ff0000;font-size:15px;font-weight:bold"
    );
    return;
  }

  const CONFIG = {
    keyUrl: "https://raw.githubusercontent.com/zxidesert/script/main/key.txt",
    redirectUrl: "https://raw.githubusercontent.com/zxidesert/script/refs/heads/main/zxi.txt",
    telegramUrl: "https://raw.githubusercontent.com/zxidesert/script/refs/heads/main/button.txt",
    workerUrl: "https://zxi.zxidesert.workers.dev/"
  };

  const oldBox = document.getElementById("zxi-auth-overlay");
  if (oldBox) oldBox.remove();

  const overlay = document.createElement("div");
  overlay.id = "zxi-auth-overlay";

  overlay.innerHTML = `
    <style>
      #zxi-auth-overlay {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.72);
        backdrop-filter: blur(8px);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      }

      .zxi-card {
        width: min(90vw, 360px);
        background: #050816;
        color: #ffffff;
        border: 1px solid rgba(0, 255, 204, 0.35);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.55);
        padding: 22px;
        box-sizing: border-box;
        position: relative;
      }

      .zxi-close {
        position: absolute;
        top: 12px;
        right: 14px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
      }

      .zxi-icon {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        background: rgba(0, 255, 204, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 14px;
        font-size: 22px;
      }

      .zxi-title {
        font-size: 20px;
        font-weight: 800;
        margin: 0;
        color: #e2e8f0;
      }

      .zxi-subtitle {
        font-size: 13px;
        color: #94a3b8;
        margin: 8px 0 18px;
        line-height: 1.5;
      }

      .zxi-input {
        width: 100%;
        padding: 13px;
        border-radius: 10px;
        border: 1px solid rgba(0, 255, 204, 0.45);
        background: #0f172a;
        color: #ffffff;
        outline: none;
        box-sizing: border-box;
        text-align: center;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .zxi-input:focus {
        border-color: #00ffcc;
        box-shadow: 0 0 0 3px rgba(0,255,204,0.12);
      }

      .zxi-btn {
        width: 100%;
        border: none;
        border-radius: 10px;
        padding: 13px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        margin-bottom: 10px;
      }

      .zxi-btn-primary {
        background: #00ffcc;
        color: #020617;
      }

      .zxi-btn-secondary {
        background: #229ed9;
        color: #ffffff;
      }

      .zxi-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .zxi-status {
        margin-top: 10px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.8);
        color: #94a3b8;
        font-size: 12px;
        text-align: center;
        font-weight: 700;
      }

      .zxi-footer {
        margin-top: 14px;
        font-size: 11px;
        color: #64748b;
        text-align: center;
      }

      .zxi-progress {
        width: 100%;
        height: 8px;
        background: #1e293b;
        border-radius: 999px;
        overflow: hidden;
        margin-top: 18px;
      }

      .zxi-progress-bar {
        height: 100%;
        width: 100%;
        background: #00ffcc;
        transition: width 1s linear;
      }

      .zxi-count {
        font-size: 42px;
        font-weight: 900;
        color: #00ffcc;
        text-align: center;
        margin: 20px 0 5px;
      }

      .zxi-center {
        text-align: center;
      }

      .zxi-spinner {
        width: 44px;
        height: 44px;
        border: 5px solid #1e293b;
        border-top: 5px solid #00ffcc;
        border-radius: 50%;
        animation: zxiSpin 1s linear infinite;
        margin: 10px auto 18px;
      }

      @keyframes zxiSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>

    <div class="zxi-card" id="zxi-card">
      <button class="zxi-close" id="zxi-close-btn">×</button>

      <div class="zxi-icon">🔐</div>

      <h2 class="zxi-title">Access Verification</h2>
      <p class="zxi-subtitle">
        Enter your access key to continue.
      </p>

      <input
        type="text"
        id="zxi-key-input"
        class="zxi-input"
        placeholder="Enter access key"
        autocomplete="off"
      />

      <button id="zxi-login-btn" class="zxi-btn zxi-btn-primary">
        Continue
      </button>

      <button id="zxi-telegram-btn" class="zxi-btn zxi-btn-secondary">
        Join Telegram
      </button>

      <div id="zxi-status" class="zxi-status">
        Ready
      </div>

      <div class="zxi-footer">
        Secured access gateway
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const card = document.getElementById("zxi-card");
  const closeBtn = document.getElementById("zxi-close-btn");
  const loginBtn = document.getElementById("zxi-login-btn");
  const telegramBtn = document.getElementById("zxi-telegram-btn");
  const keyInput = document.getElementById("zxi-key-input");
  const statusBox = document.getElementById("zxi-status");

  closeBtn.onclick = () => overlay.remove();

  function setStatus(text, color = "#94a3b8") {
    statusBox.innerHTML = text;
    statusBox.style.color = color;
  }

  async function fetchText(url) {
    const response = await fetch(url + "?t=" + Date.now());

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return (await response.text()).trim();
  }

  telegramBtn.addEventListener("click", async () => {
    try {
      setStatus("Opening Telegram...", "#00ffcc");

      const tgLink = await fetchText(CONFIG.telegramUrl);

      if (tgLink.startsWith("http")) {
        window.open(tgLink, "_blank");
        setStatus("Telegram opened.", "#00ffcc");
      } else {
        setStatus("Telegram link is invalid.", "#ff4444");
      }
    } catch (error) {
      setStatus("Unable to open Telegram link.", "#ff4444");
    }
  });

  loginBtn.addEventListener("click", async () => {
    const inputKey = keyInput.value.trim();

    if (!inputKey) {
      setStatus("Please enter your access key.", "#ff4444");
      return;
    }

    loginBtn.disabled = true;
    telegramBtn.disabled = true;

    try {
      setStatus("Checking access key...", "#00ffcc");

      const keyFile = await fetchText(CONFIG.keyUrl);
      const serverKeys = keyFile
        .split("\n")
        .map(key => key.trim())
        .filter(Boolean);

      if (!serverKeys.includes(inputKey)) {
        setStatus("Invalid access key.", "#ff4444");
        loginBtn.disabled = false;
        telegramBtn.disabled = false;
        return;
      }

      setStatus("Access key validated.", "#00ffcc");

      setTimeout(() => {
        showUpdateCheck();
      }, 700);

    } catch (error) {
      setStatus("Server error. Please try again.", "#ff4444");
      loginBtn.disabled = false;
      telegramBtn.disabled = false;
    }
  });

  async function showUpdateCheck() {
    card.innerHTML = `
      <div class="zxi-center">
        <div class="zxi-spinner"></div>
        <h2 class="zxi-title">Checking Update</h2>
        <p class="zxi-subtitle">
          Please wait while the system prepares your access.
        </p>
        <div id="zxi-update-status" class="zxi-status">
          Connecting...
        </div>
      </div>
    `;

    const updateStatus = document.getElementById("zxi-update-status");
    let updated = false;

    try {
      const workerResponse = await fetch(CONFIG.workerUrl + "?t=" + Date.now());
      const workerText = await workerResponse.text();

      if (workerText.includes("GitHub Updated")) {
        updated = true;
      }
    } catch (error) {}

    await new Promise(resolve => setTimeout(resolve, 5000));

    updateStatus.style.color = updated ? "#00ffcc" : "#ffcc00";
    updateStatus.innerHTML = updated
      ? "Link updated successfully."
      : "No update available.";

    await new Promise(resolve => setTimeout(resolve, 1500));

    startCountdown();
  }

  async function startCountdown() {
    let finalUrl = "";

    try {
      finalUrl = await fetchText(CONFIG.redirectUrl);
    } catch (error) {
      card.innerHTML = `
        <div class="zxi-center">
          <h2 class="zxi-title">Redirect Failed</h2>
          <p class="zxi-subtitle">
            Unable to load the destination link.
          </p>
          <div class="zxi-status" style="color:#ff4444;">
            Link unavailable.
          </div>
        </div>
      `;
      return;
    }

    if (!finalUrl.startsWith("http")) {
      card.innerHTML = `
        <div class="zxi-center">
          <h2 class="zxi-title">Invalid Link</h2>
          <p class="zxi-subtitle">
            The destination link is not valid.
          </p>
        </div>
      `;
      return;
    }

    const totalSeconds = Math.floor(Math.random() * 4) + 22;
    let timeLeft = totalSeconds;

    card.innerHTML = `
      <div class="zxi-center">
        <h2 class="zxi-title">Redirecting</h2>
        <p class="zxi-subtitle">
          You will be redirected shortly.
        </p>

        <div id="zxi-count" class="zxi-count">
          ${timeLeft}
        </div>

        <div class="zxi-progress">
          <div id="zxi-progress-bar" class="zxi-progress-bar"></div>
        </div>

        <div class="zxi-footer">
          Please do not close this page.
        </div>
      </div>
    `;

    const countText = document.getElementById("zxi-count");
    const progressBar = document.getElementById("zxi-progress-bar");

    const timer = setInterval(() => {
      timeLeft--;

      countText.textContent = timeLeft;

      const percentage = (timeLeft / totalSeconds) * 100;
      progressBar.style.width = percentage + "%";

      if (timeLeft <= 0) {
        clearInterval(timer);
        overlay.remove();
        window.location.replace(finalUrl);
      }
    }, 1000);
  }
})();