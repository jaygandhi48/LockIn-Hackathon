let trackingDomain = null;

function extractDomain(url) {
  try {
    if (!url.includes("://")) {
      url = "https://" + url;
    }
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch (e) {
    return url.replace("www.", "");
  }
}

function startBackgroundTimer(trackingUrl, timeLimit) {
  trackingDomain = extractDomain(trackingUrl);

  chrome.storage.local.set({
    trackingUrl: trackingDomain,
    timeLimit,
    startTime: Date.now(),
    isTracking: true,
    elapsedTime: 0,
  });

  chrome.alarms.clear("timerTick");
  chrome.alarms.clear("timerEnd");

  chrome.alarms.create("timerTick", { periodInMinutes: 1 / 60 });
  chrome.alarms.create("timerEnd", { delayInMinutes: timeLimit / 60000 });
}

async function checkActiveTabMatches() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url;
      if (currentUrl) {
        const currentDomain = extractDomain(currentUrl);
        resolve(currentDomain === trackingDomain);
      } else {
        resolve(false);
      }
    });
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "timerTick") {
    const isActive = await checkActiveTabMatches();
    if (!isActive) return;

    chrome.storage.local.get(
      ["startTime", "elapsedTime", "isTracking"],
      (data) => {
        if (!data.isTracking) return;
        const newElapsed = data.elapsedTime + 1000;
        chrome.storage.local.set({ elapsedTime: newElapsed });
      }
    );
  }

  if (alarm.name === "timerEnd") {
    // Complete the current session before stopping
    chrome.storage.local.get(["currentSession"], (data) => {
      if (data.currentSession) {
        const completedSession = {
          ...data.currentSession,
          endTime: Date.now(),
          completed: true,
          actualDuration: Math.floor(
            (Date.now() - data.currentSession.startTime) / (1000 * 60)
          ),
        };

        // Add to sessions history
        chrome.storage.local.get(["sessions"], (sessionData) => {
          const existingSessions = sessionData.sessions || [];
          const updatedSessions = [...existingSessions, completedSession];

          chrome.storage.local.set({
            sessions: updatedSessions,
            isTracking: false,
            elapsedTime: 0,
          });

          // Remove current session
          chrome.storage.local.remove("currentSession");
        });
      } else {
        // If no current session, just stop tracking
        chrome.storage.local.set({
          isTracking: false,
          elapsedTime: 0,
        });
      }

      // Show completion notification
      chrome.action.setBadgeText({ text: "Done" });
      chrome.action.setBadgeBackgroundColor({ color: "#16a34a" }); // Green for completion

      // Open completion page with sound
      chrome.tabs.create({
        url: chrome.runtime.getURL("alarm.html"),
      });

      // Clear badge after 5 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: "" });
      }, 5000);
    });
  }
});

// Enhanced tab tracking for better blocking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    chrome.storage.local.get(
      ["trackingUrl", "isTracking", "userName"],
      (data) => {
        if (data.isTracking && trackingDomain) {
          const currentDomain = extractDomain(tab.url);

          // Allow chrome:// and extension pages
          if (
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://") ||
            tab.url.startsWith("moz-extension://")
          ) {
            return;
          }

          // Block if not the allowed domain
          if (currentDomain !== data.trackingUrl) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "BLOCK_PAGE",
                trackingDomain: data.trackingUrl,
                currentDomain: currentDomain,
                userName: data.userName || "User",
              })
              .catch(() => {
                // If content script isn't ready, inject it
                chrome.scripting
                  .executeScript({
                    target: { tabId: tabId },
                    files: ["content.js"],
                  })
                  .then(() => {
                    // Retry sending the message
                    chrome.tabs.sendMessage(tabId, {
                      type: "BLOCK_PAGE",
                      trackingDomain: data.trackingUrl,
                      currentDomain: currentDomain,
                      userName: data.userName || "User",
                    });
                  })
                  .catch(() => {
                    // Fallback: redirect to blocked page
                    chrome.tabs.update(tabId, {
                      url:
                        chrome.runtime.getURL("blocked.html") +
                        `?tracking=${encodeURIComponent(
                          data.trackingUrl
                        )}&current=${encodeURIComponent(currentDomain)}`,
                    });
                  });
              });
          }
        }
      }
    );
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TRACKING") {
    startBackgroundTimer(message.url, message.timeLimit);
    sendResponse({ status: "started" });

    // Set active badge
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" }); // Blue for active
  } else if (message.type === "STOP_TRACKING") {
    chrome.alarms.clear("timerTick");
    chrome.alarms.clear("timerEnd");
    trackingDomain = null;
    chrome.action.setBadgeText({ text: "" });

    // Complete current session if exists
    chrome.storage.local.get(["currentSession"], (data) => {
      if (data.currentSession) {
        const stoppedSession = {
          ...data.currentSession,
          endTime: Date.now(),
          completed: false, // Manually stopped
          actualDuration: Math.floor(
            (Date.now() - data.currentSession.startTime) / (1000 * 60)
          ),
        };

        // Add to sessions history
        chrome.storage.local.get(["sessions"], (sessionData) => {
          const existingSessions = sessionData.sessions || [];
          const updatedSessions = [...existingSessions, stoppedSession];

          chrome.storage.local.set({
            sessions: updatedSessions,
            isTracking: false,
            trackingUrl: null,
            timeLimit: null,
            startTime: null,
            elapsedTime: 0,
          });
        });

        // Remove current session
        chrome.storage.local.remove("currentSession");
      } else {
        chrome.storage.local.set({
          isTracking: false,
          trackingUrl: null,
          timeLimit: null,
          startTime: null,
          elapsedTime: 0,
        });
      }
    });

    sendResponse({ status: "stopped" });
  } else if (message.type === "GET_SESSION_DATA") {
    // Helper message type for getting current session data
    chrome.storage.local.get(["currentSession", "sessions"], (data) => {
      sendResponse({
        currentSession: data.currentSession || null,
        sessions: data.sessions || [],
      });
    });
    return true; // Keep message channel open for async response
  }
});

// Clean up old sessions (keep last 50)
chrome.storage.local.get(["sessions"], (data) => {
  if (data.sessions && data.sessions.length > 50) {
    const recentSessions = data.sessions.slice(-50);
    chrome.storage.local.set({ sessions: recentSessions });
  }
});
