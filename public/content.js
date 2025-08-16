(function () {
  function blockImmediately(
    trackingDomain = "",
    currentDomain = "",
    userName = ""
  ) {
    const motivationalQuotes = [
      `${userName || "Friend"}, hard work isn't achieved by losing focus.`,
      "Discipline is choosing what you want most over what you want now.",
      `Stay sharp, ${
        userName || "champ"
      } — every moment counts toward your goals.`,
      "Distractions steal progress. Focus builds success.",
      `${
        userName || "You"
      }, remember: success comes to those who stay consistent.`,
      "Greatness is built in silence, not in wasted time.",
      "Your future self will thank you for staying on track today.",
      "Small disciplined choices lead to major successful outcomes.",
      "Focus is not about saying yes to the thing you've got to focus on. It's about saying no to the hundred other good ideas.",
      "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    ];

    const focusTips = [
      "💡 Try the Pomodoro Technique: 25 minutes of focused work, then a 5-minute break.",
      "💡 Close unnecessary browser tabs to reduce distractions.",
      "💡 Use website blockers during your focus sessions.",
      "💡 Set specific goals for each focus session.",
      "💡 Take regular breaks to maintain concentration.",
      "💡 Create a dedicated workspace free from distractions.",
      "💡 Turn off notifications during focus time.",
      "💡 Practice mindfulness to improve your attention span.",
    ];

    const randomQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    const randomTip = focusTips[Math.floor(Math.random() * focusTips.length)];

    const blockPageHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Stay Focused - ${userName || "User"}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          animation: gradientShift 10s ease infinite;
        }
        
        @keyframes gradientShift {
          0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          50% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        }
        
        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideUp 0.8s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          animation: titlePulse 2s ease-in-out infinite;
        }
        
        @keyframes titlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 20px;
        }
        
        .blocked-info {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin: 20px 0;
        }
        
        .allowed-info {
          background: linear-gradient(135deg, #00d2d3, #54a0ff);
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin: 20px 0;
        }
        
        .domain {
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .focus-icon {
          font-size: 4rem;
          margin: 20px 0;
          animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .quote {
          font-size: 1.1rem;
          font-style: italic;
          color: #555;
          margin: 25px 0;
          padding: 20px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 16px;
          border-left: 4px solid #667eea;
        }
        
        .tip {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 12px;
          padding: 15px;
          margin: 20px 0;
          font-size: 0.95rem;
          color: #856404;
        }
        
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 25px 0;
        }
        
        .stat {
          background: rgba(118, 75, 162, 0.1);
          padding: 15px;
          border-radius: 12px;
          text-align: center;
        }
        
        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #764ba2;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: #666;
          margin-top: 5px;
        }
        
        .footer {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #888;
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(102, 126, 234, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin: 20px 0;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          width: 0%;
          animation: progressFill 3s ease-out forwards;
        }
        
        @keyframes progressFill {
          to { width: 100%; }
        }
        
        @media (max-width: 600px) {
          .container {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .stats {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">Stay Focused, ${userName || "Champion"}! 🎯</div>
          <div class="subtitle">You're doing great - keep up the momentum!</div>
        </div>
        
        <div class="focus-icon">🚫</div>
        
        <div class="blocked-info">
          <div>❌ <strong>Blocked:</strong></div>
          <div class="domain">${currentDomain}</div>
        </div>
        
        <div class="allowed-info">
          <div>✅ <strong>Allowed:</strong></div>
          <div class="domain">${trackingDomain}</div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        
        <div class="quote">
          "${randomQuote}"
        </div> 
        <div class="tip">
          ${randomTip}
        </div>  
        <div class="footer">
          <p>🌟 Every moment of focus brings you closer to your goals</p>
          <p style="margin-top: 10px; font-size: 0.8rem;">
            Close this tab and return to <strong>${trackingDomain}</strong>
          </p>
        </div>
      </div>
      
      <script>
        // Animate focus time counter
        let focusTime = 0;
        const focusTimeElement = document.getElementById('focusTime');
        const focusTimeInterval = setInterval(() => {
          if (focusTime < 25) {
            focusTime++;
            focusTimeElement.textContent = focusTime;
          } else {
            clearInterval(focusTimeInterval);
          }
        }, 100);
        
        // Update blocked sites counter
        let blockedCount = 1;
        const blockedElement = document.getElementById('blockedSites');
        setTimeout(() => {
          blockedCount = Math.floor(Math.random() * 5) + 1;
          blockedElement.textContent = blockedCount;
        }, 1500);
        
        // Prevent back navigation
        history.pushState(null, null, location.href);
        window.onpopstate = function () {
          history.go(1);
        };
        
        // Auto-close after 10 seconds and redirect to allowed domain
        setTimeout(() => {
          window.location.href = 'https://${trackingDomain}';
        }, 10000);
      </script>
    </body>
    </html>
    `;

    // Overwrite the page content immediately
    document.open();
    document.write(blockPageHTML);
    document.close();

    // Prevent further script execution
    window.stop();
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "BLOCK_PAGE") {
      blockImmediately(
        message.trackingDomain,
        message.currentDomain,
        message.userName
      );
      sendResponse({ success: true });
    }
  });

  // Immediate blocking check on script injection
  if (window.location.href && !window.location.href.startsWith("chrome://")) {
    chrome.storage.local.get(
      ["trackingUrl", "isTracking", "userName"],
      (data) => {
        if (data.isTracking && data.trackingUrl) {
          const currentDomain = window.location.hostname.replace("www.", "");
          if (currentDomain !== data.trackingUrl) {
            blockImmediately(data.trackingUrl, currentDomain, data.userName);
          }
        }
      }
    );
  }
})();
