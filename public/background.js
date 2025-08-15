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
    chrome.storage.local.set(
      {
        isTracking: false,
        elapsedTime: 0,
      },
      () => {
        // Show red badge
        chrome.action.setBadgeText({ text: "Done" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

        // Open alarm.html with sound
        chrome.tabs.create({
          url: chrome.runtime.getURL("alarm.html"),
        });
      }
    );
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TRACKING") {
    startBackgroundTimer(message.url, message.timeLimit);
    sendResponse({ status: "started" });
  } else if (message.type === "STOP_TRACKING") {
    chrome.alarms.clear("timerTick");
    chrome.alarms.clear("timerEnd");
    trackingDomain = null;
    chrome.action.setBadgeText({ text: "" });

    chrome.storage.local.set({
      isTracking: false,
      trackingUrl: null,
      timeLimit: null,
      startTime: null,
      elapsedTime: 0,
    });
    sendResponse({ status: "stopped" });
  }
});
