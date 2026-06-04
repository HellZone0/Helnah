(function() {
    "use strict";

    if (typeof window.ZXI_BOOKMARK_LOAD === "undefined") {
        console.log("%cAccess Denied - Bookmark Required", "color:#ff0000;font-size:15px;font-weight:bold");
        return;
    }

    const _d = {
        k: 'https://raw.githubusercontent.com/zxidesert/script/main/key.txt',
        r: 'https://raw.githubusercontent.com/zxidesert/script/refs/heads/main/zxi.txt',
        t: 'https://raw.githubusercontent.com/zxidesert/script/refs/heads/main/button.txt',
        s: 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#02040a;color:#fff;padding:25px;border-radius:12px;z-index:2147483647;font-family:sans-serif;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.8);border:2px solid #00ffcc;width:280px;box-sizing:border-box;'
    };

    (async function() {
        const oldBox = document.getElementById('zxi-auth-box');
        if(oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.id = 'zxi-auth-box';
        box.style.cssText = _d.s;
        
        box.innerHTML = `
          <h3 style="margin:0 0 10px 0;color:#00ffcc;font-size:18px;letter-spacing:1px;font-weight:bold;">ZXI SYSTEM AUTH</h3>
          <p style="margin:0 0 15px 0;color:#64748b;font-size:11px;">ENTER LICENSE KEY</p>
          <input type="text" id="zxi-key-input" placeholder="ENTER KEY HERE" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #00ffcc;border-radius:6px;background:#070b19;color:#fff;text-align:center;box-sizing:border-box;font-size:13px;outline:none;">
          
          <button id="zxi-login-btn" style="width:100%;background:#00ffcc;color:#000;border:none;padding:12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;margin-bottom:10px;">VERIFY & RUN</button>
          
          <button id="zxi-telegram-btn" style="width:100%;background:#229ED9;color:#fff;border:none;padding:12px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px;">TELEGRAM</button>
          
          <div id="zxi-status" style="margin-top:12px;font-size:12px;font-weight:bold;color:#64748b;">READY</div>
        `;
        document.body.appendChild(box);

        setTimeout(() => {
            box.style.zIndex = '2147483647';
            if (window.innerWidth < 600) {
                box.style.width = '90%';
                box.style.maxWidth = '280px';
            }
        }, 10);

        const loginBtn = document.getElementById('zxi-login-btn');
        const tgBtn = document.getElementById('zxi-telegram-btn');
        const keyInput = document.getElementById('zxi-key-input');
        const statusDiv = document.getElementById('zxi-status');

        tgBtn.addEventListener('click', async () => {
            try {
                const res = await fetch(_d.t + '?t=' + Date.now());
                const tgLink = (await res.text()).trim();
                if (tgLink.startsWith('http')) window.open(tgLink, '_blank');
            } catch(e) {}
        });

        loginBtn.addEventListener('click', async () => {
            const inputKey = keyInput.value.trim();
            if(!inputKey) {
                statusDiv.innerHTML = "<span style='color:#ff4444;'>PLEASE INPUT KEY!</span>";
                return;
            }

            statusDiv.innerHTML = "<span style='color:#00ffcc;'>CONNECTING SERVER...</span>";
            loginBtn.disabled = tgBtn.disabled = true;

            try {
                const response = await fetch(_d.k + '?t=' + Date.now());
                const fileContent = await response.text();
                const serverKeys = fileContent.split('\n').map(k => k.trim()).filter(k => k !== "");

                if (serverKeys.includes(inputKey)) {
                    statusDiv.innerHTML = "<span style='color:#00ffcc;'>KEY VALIDATED! ✓</span>";
                    
                    setTimeout(async () => {
                        box.remove();

                        // ১. ৫ সেকেন্ডের আপডেট চেকিং পপআপ তৈরি
                        const checkOverlay = document.createElement('div');
                        checkOverlay.style.cssText = `
                            position:fixed; top:0; left:0; width:100%; height:100%; 
                            background:rgba(2,4,10,0.85); z-index:2147483647; 
                            display:flex; align-items:center; justify-content:center;
                            font-family:sans-serif;
                        `;
                        checkOverlay.innerHTML = `
                            <div style="text-align:center; background:#02040a; padding:30px; border-radius:12px; border:2px solid #00ffcc; box-shadow:0 10px 30px rgba(0,0,0,0.8); width:280px;">
                                <div style="width: 50px; height: 50px; border: 5px solid #1a2338; border-top: 5px solid #00ffcc; border-radius: 50%; margin: 0 auto 20px auto; animation: zxi-spin 1s linear infinite;"></div>
                                <p id="zxi-check-text" style="color:#00ffcc; font-size:16px; font-weight:bold; margin:0; letter-spacing:1px;">CHECKING UPDATE...</p>
                            </div>
                            <style>
                                @keyframes zxi-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                            </style>
                        `;
                        document.body.appendChild(checkOverlay);

                        // ব্যাকগ্রাউন্ডে ক্লাউডফ্লেয়ার ওয়ার্কারকে হিট করে লিংক আপডেট চেক করা
                        let isUpdated = false;
                        try {
                            const workerRes = await fetch('https://zxi.zxidesert.workers.dev/');
                            const workerText = await workerRes.text();
                            if (workerText.includes("GitHub Updated")) {
                                isUpdated = true;
                            }
                        } catch (err) {}

                        // ৫ সেকেন্ডের টাইমার অ্যানিমেশন হোল্ড করা
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        const checkTextNode = document.getElementById('zxi-check-text');
                        if (isUpdated) {
                            checkTextNode.innerHTML = "<span style='color:#00ffcc;'>Link Updated Successfully! ✓</span>";
                        } else {
                            checkTextNode.innerHTML = "<span style='color:#ff4444;'>No Update Available!</span>";
                        }

                        // মেসেজটি দেখানোর জন্য আরও ১.৫ সেকেন্ড অপেক্ষা করা, তারপর কাউন্টডাউন শুরু
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        checkOverlay.remove();

                        // ২. মেইন কাউন্টডাউন শুরু (২২ থেকে ২৫ সেকেন্ডের র্যান্ডম টাইম)
                        const rResp = await fetch(_d.r + '?t=' + Date.now());
                        const finalUrl = (await rResp.text()).trim();

                        if(finalUrl.startsWith('http')) {
                            const overlay = document.createElement('div');
                            overlay.style.cssText = `
                                position:fixed; top:0; left:0; width:100%; height:100%; 
                                background:rgba(2,4,10,0.02); z-index:2147483647; 
                                display:flex; align-items:center; justify-content:center;
                            `;

                            // ২২ থেকে ২৫ সেকেন্ডের মধ্যে একটি র্যান্ডম টাইম সেট করা
                            const totalSeconds = Math.floor(Math.random() * (25 - 22 + 1)) + 22;

                            overlay.innerHTML = `
                                <div style="text-align:center;">
                                    <div style="position:relative; width:220px; height:220px; margin:0 auto;">
                                        <svg width="220" height="220" style="transform:rotate(-90deg);">
                                            <circle cx="110" cy="110" r="98" fill="none" stroke="#1a2338" stroke-width="18"></circle>
                                            <circle id="progress" cx="110" cy="110" r="98" fill="none" 
                                                    stroke="#00ffcc" stroke-width="18" 
                                                    stroke-dasharray="615" stroke-dashoffset="615"
                                                    stroke-linecap="round"></circle>
                                        </svg>
                                        <div id="countdown-text" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:46px; font-weight:bold; color:#00ffcc;">${totalSeconds}</div>
                                    </div>
                                    <p style="margin-top:25px; color:#00ffcc; font-size:18px; font-weight:bold;">REDIRECTING...</p>
                                </div>
                            `;
                            document.body.appendChild(overlay);

                            let timeLeft = totalSeconds;
                            const progress = overlay.querySelector('#progress');
                            const text = overlay.querySelector('#countdown-text');
                            const circumference = 615;

                            const timer = setInterval(() => {
                                timeLeft--;
                                text.textContent = timeLeft;

                                const offset = circumference * (timeLeft / totalSeconds);
                                progress.style.strokeDashoffset = offset;

                                if (timeLeft <= 0) {
                                    clearInterval(timer);
                                    overlay.remove();
                                    window.location.replace(finalUrl);
                                }
                            }, 1000);
                        }
                    }, 800);
                } else {
                    statusDiv.innerHTML = "<span style='color:#ff4444;'>INVALID LICENSE KEY!</span>";
                    loginBtn.disabled = tgBtn.disabled = false;
                }
            } catch (e) {
                statusDiv.innerHTML = "<span style='color:#ff4444;'>SERVER ERROR!</span>";
                loginBtn.disabled = tgBtn.disabled = false;
            }
        });
    })();
})();
