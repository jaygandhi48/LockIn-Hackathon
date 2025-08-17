// content.js - Content script for YouTube distraction-free mode and website blocking

let isDistractionFreeMode = false;

// CSS to hide distracting elements
const distractionFreeCSS = `
  /* Hide sidebar */
  #secondary,
  #related,
  ytd-watch-next-secondary-results-renderer,
  #sidebar,
  #chat,
  #chat-container,
  ytd-live-chat-frame,
  
  /* Hide comments */
  #comments,
  ytd-comments,
  ytd-comment-thread-renderer,
  
  /* Hide suggested videos */
  .ytp-suggestion-set,
  .ytp-cards-teaser,
  .ytp-ce-element,
  .ytp-cards-button,
  
  /* Hide homepage elements */
  ytd-rich-grid-renderer,
  ytd-rich-section-renderer,
  ytd-shelf-renderer,
  
  /* Hide search suggestions */
  .sbsb_a,
  #search-suggestions,
  
  /* Hide video suggestions in player */
  .ytp-pause-overlay,
  .ytp-scroll-min,
  
  /* Hide trending and subscriptions in sidebar */
  #guide-content,
  ytd-guide-renderer,
  
  /* Hide notifications */
  ytd-notification-topbar-button-renderer,
  
  /* Hide shorts shelf */
  ytd-rich-shelf-renderer[is-shorts],
  ytd-reel-shelf-renderer,
  
  /* Hide end screen elements */
  .ytp-endscreen-content,
  
  /* Hide autoplay toggle */
  .ytp-autonav-toggle-button-container {
    display: none !important;
  }
  
  /* Focus on video player */
  #player-container {
    margin: 0 auto !important;
  }
  
  /* Adjust layout for focused viewing */
  ytd-watch-flexy #primary {
    margin: 0 auto !important;
    max-width: 100% !important;
  }
  
  /* Hide video thumbnails in search results except current video */
  ytd-video-renderer:not(:first-child) {
    display: none !important;
  }
`;

// Function to inject/remove CSS
function toggleDistractionFreeMode(enable) {
  const styleId = "youtube-distraction-free-style";
  let existingStyle = document.getElementById(styleId);

  if (enable && !existingStyle) {
    // Create and inject the CSS
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = distractionFreeCSS;
    document.head.appendChild(style);
    isDistractionFreeMode = true;

    // Also hide any dynamic content that loads later
    hideDistractingElements();

    return true;
  } else if (!enable && existingStyle) {
    // Remove the CSS
    existingStyle.remove();
    isDistractionFreeMode = false;
    return false;
  } else if (enable && existingStyle) {
    // Already enabled
    return true;
  } else {
    // Already disabled
    return false;
  }
}

// Function to continuously hide elements that load dynamically
function hideDistractingElements() {
  if (!isDistractionFreeMode) return;

  // Hide elements that might load after initial page load
  const selectorsToHide = [
    "#secondary",
    "#related",
    "#comments",
    ".ytp-suggestion-set",
    ".ytp-pause-overlay",
  ];

  selectorsToHide.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el) el.style.display = "none";
    });
  });

  // Continue checking for new elements
  if (isDistractionFreeMode) {
    setTimeout(hideDistractingElements, 2000);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TOGGLE_DISTRACT_FREE") {
    // Check if we're on YouTube
    if (
      window.location.hostname === "www.youtube.com" ||
      window.location.hostname === "youtube.com"
    ) {
      // Toggle the mode
      const newState = !isDistractionFreeMode;
      const actualState = toggleDistractionFreeMode(newState);

      // Send response back
      sendResponse({
        status: true,
        isDistractionFreeMode: actualState,
        message: actualState
          ? "Distraction-free mode enabled"
          : "Distraction-free mode disabled",
      });

      // Store the state
      chrome.storage.local.set({ isDistractionFreeMode: actualState });
    } else {
      sendResponse({
        status: false,
        isDistractionFreeMode: false,
        error: "Not on YouTube",
      });
    }
  }

  // Handle page blocking (updated for multiple websites)
  if (message.type === "BLOCK_PAGE") {
    // Create blocking overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Format allowed websites for display
    const allowedWebsites = message.trackingDomains || [];
    let websitesText = "";

    if (allowedWebsites.length === 1) {
      websitesText = `<strong>${allowedWebsites[0]}</strong>`;
    } else if (allowedWebsites.length === 2) {
      websitesText = `<strong>${allowedWebsites[0]}</strong> and <strong>${allowedWebsites[1]}</strong>`;
    } else if (allowedWebsites.length > 2) {
      const lastWebsite = allowedWebsites[allowedWebsites.length - 1];
      const otherWebsites = allowedWebsites.slice(0, -1);
      websitesText = `<strong>${otherWebsites.join(
        "</strong>, <strong>"
      )}</strong>, and <strong>${lastWebsite}</strong>`;
    }

    overlay.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <h1 style="font-size: 3rem; margin-bottom: 20px;">🚫 Focus Mode Active</h1>
        <p style="font-size: 1.5rem; margin-bottom: 10px;">Hi ${
          message.userName
        }!</p>
        <p style="font-size: 1.2rem; margin-bottom: 30px; line-height: 1.4;">
          You're only allowed to visit ${websitesText} during this focus session.
        </p>
        <p style="font-size: 1rem; opacity: 0.9; margin-bottom: 20px;">
          Current site: <strong>${message.currentDomain}</strong>
        </p>
        ${
          allowedWebsites.length > 0
            ? `
        <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Allowed Websites:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            ${allowedWebsites
              .map(
                (domain) =>
                  `<span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;">${domain}</span>`
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }
        <button onclick="window.history.back()" 
                style="margin-top: 30px; padding: 15px 30px; font-size: 1.1rem; 
                       background: rgba(255,255,255,0.2); border: 2px solid white; 
                       color: white; border-radius: 25px; cursor: pointer; transition: all 0.3s ease;"
                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          Go Back
        </button>
      </div>
    `;

    document.body.innerHTML = "";
    document.body.appendChild(overlay);
  }
});

// Initialize distraction-free mode state from storage when page loads
chrome.storage.local.get(["isDistractionFreeMode"], (data) => {
  if (
    data.isDistractionFreeMode &&
    (window.location.hostname === "www.youtube.com" ||
      window.location.hostname === "youtube.com")
  ) {
    toggleDistractionFreeMode(true);
  }
});

// Re-apply distraction-free mode when navigating within YouTube (SPA navigation)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;

    // Check if distraction-free mode should be active
    chrome.storage.local.get(["isDistractionFreeMode"], (data) => {
      if (data.isDistractionFreeMode) {
        setTimeout(() => {
          toggleDistractionFreeMode(true);
        }, 1000); // Delay to let YouTube load
      }
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true });
