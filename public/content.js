(function () {
  function blockImmediately(
    trackingDomain = "",
    currentDomain = "",
    userName = ""
  ) {
    const motivationalQuotes = [
      `${userName || "Friend"}, hard work isn’t achieved by losing focus.`,
      `Discipline is choosing what you want most over what you want now.`,
      `Stay sharp, ${
        userName || "champ"
      } — every moment counts toward your goals.`,
      `Distractions steal progress. Focus builds success.`,
      `${
        userName || "You"
      }, remember: success comes to those who stay consistent.`,
      `Greatness is built in silence, not in wasted time.`,
      `Your future self will thank you for staying on track today.`,
    ];

    const randomQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    const blockPageHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: linear-gradient(135deg, #e3f2fd, #ffffff); 
                display: flex; justify-content: center; align-items: center; 
                z-index: 9999; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
      
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; 
                  box-shadow: 0 8px 20px rgba(0,0,0,0.1); text-align: center; 
                  max-width: 550px; width: 90%;">
        
        <h2 style="font-size: 28px; margin-bottom: 12px; font-weight: 700; color: #1565c0;">
          Hi ${userName || "there"}, stay focused 🚀
        </h2>
        
        <p style="font-size: 18px; margin-bottom: 20px; color: #444;">
          You tried visiting <strong style="color:#d32f2f;">${currentDomain}</strong>, 
          but only <strong style="color:#2e7d32;">${trackingDomain}</strong> is allowed right now.
        </p>
        
        <img src="https://ih1.redbubble.net/image.2059825667.8061/st,small,507x507-pad,600x600,f8f8f8.jpg" alt="Stay Focused" style="max-width: 100%; border-radius: 12px; margin: 20px 0;" />
        
        <blockquote style="font-size: 18px; font-style: italic; margin: 20px auto; 
                           color: #555; border-left: 4px solid #1565c0; padding-left: 12px;">
          “${randomQuote}”
        </blockquote>
        
        <p style="font-size: 15px; color: #666; margin-top: 20px;">
          ✨ Stay disciplined — every click is a step toward your goals.
        </p>
      </div>
    </div>
    `;

    // Overwrite the page content immediately
    document.open();
    document.write(blockPageHTML);
    document.close();
  }

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
})();
