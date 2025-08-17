let trackingDomains = []; // Changed from single domain to array

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

function startBackgroundTimer(trackingUrls, timeLimit) {
  // Convert URLs to domains
  trackingDomains = trackingUrls.map((url) => extractDomain(url));

  chrome.storage.local.set({
    trackingUrls: trackingDomains, // Store array of domains
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
        // Check if current domain matches any of the allowed domains
        resolve(trackingDomains.includes(currentDomain));
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
      chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });

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
      ["trackingUrls", "isTracking", "userName"],
      (data) => {
        if (data.isTracking && trackingDomains.length > 0) {
          const currentDomain = extractDomain(tab.url);

          // Allow chrome:// and extension pages
          if (
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://") ||
            tab.url.startsWith("moz-extension://")
          ) {
            return;
          }

          // Block if not in the allowed domains list
          if (!data.trackingUrls.includes(currentDomain)) {
            chrome.tabs
              .sendMessage(tabId, {
                type: "BLOCK_PAGE",
                trackingDomains: data.trackingUrls, // Send array of allowed domains
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
                      trackingDomains: data.trackingUrls,
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
                          data.trackingUrls.join(",")
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
    startBackgroundTimer(message.urls, message.timeLimit); // Use urls array
    sendResponse({ status: "started" });

    // Set active badge
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  } else if (message.type === "STOP_TRACKING") {
    chrome.alarms.clear("timerTick");
    chrome.alarms.clear("timerEnd");
    trackingDomains = []; // Clear array
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
            trackingUrls: null, // Changed from trackingUrl
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
          trackingUrls: null,
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

  // Fixed YouTube Distraction-Free Mode handling
  if (message.action === "TOGGLE_DISTRACT_FREE") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const currentTab = tabs[0];

        try {
          // Check if current tab is YouTube
          const url = new URL(currentTab.url);
          const hostname = url.hostname;
          const isYouTube =
            hostname === "www.youtube.com" || hostname === "youtube.com";

          if (!isYouTube) {
            sendResponse({
              status: false,
              error: "Please navigate to YouTube first",
            });
            return;
          }

          // Inject content script first
          await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ["content.js"],
          });

          // Wait a bit for content script to initialize
          setTimeout(() => {
            chrome.tabs.sendMessage(
              currentTab.id,
              {
                action: "TOGGLE_DISTRACT_FREE",
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Runtime error:", chrome.runtime.lastError);
                  sendResponse({
                    status: false,
                    error: "Communication error with YouTube page",
                  });
                  return;
                }

                if (response && response.status) {
                  // Save state to storage
                  chrome.storage.local.set({
                    isDistractionFreeMode: response.isDistractionFreeMode,
                  });

                  sendResponse({
                    status: response.isDistractionFreeMode,
                    message:
                      response.message ||
                      (response.isDistractionFreeMode
                        ? "YouTube distraction-free mode enabled!"
                        : "YouTube distraction-free mode disabled!"),
                  });
                } else {
                  sendResponse({
                    status: false,
                    error:
                      response?.error ||
                      "Failed to toggle distraction-free mode",
                  });
                }
              }
            );
          }, 500);
        } catch (error) {
          console.error("Error in TOGGLE_DISTRACT_FREE:", error);
          sendResponse({
            status: false,
            error: "Invalid URL or failed to access tab",
          });
        }
      } else {
        sendResponse({
          status: false,
          error: "No active tab found",
        });
      }
    });
    return true; // Critical: allows asynchronous sendResponse
  }
});

// Clean up old sessions (keep last 50)
chrome.storage.local.get(["sessions"], (data) => {
  if (data.sessions && data.sessions.length > 50) {
    const recentSessions = data.sessions.slice(-50);
    chrome.storage.local.set({ sessions: recentSessions });
  }
});
