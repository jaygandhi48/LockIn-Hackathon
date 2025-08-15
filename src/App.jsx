import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { init } from "express/lib/application";

function App() {
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(
      [
        //Things stored in local storage in chrome.
        "trackingUrl", //Url being tracked
        "timeLimit", //Time limit set by user in minutes
        "startTime", //Start time of the tracking sessions
        "isTracking", //Boolean to check if tracking is active
        "elapsedTime", //Elapsed time (how much has been passed)
        "notes", //Notes added by user
      ],
      (data) => {
        if (data.isTracking) {
          setUrl(data.trackingUrl);
          setMinutes(Math.floor(data.timeLimit / (60 * 1000)));
          setIsTracking(true);
          startTimer(
            data.trackingUrl,
            data.timeLimit,
            data.startTime,
            data.elapsedTime || 0
          );
        }
      }
    );
  }, []);

  const extractDomain = (url) => {
    try {
      if (!url.includes("://")) {
        url = "https://" + url;
      }
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch (e) {
      return url.replace("www.", "");
    }
  };

  const checkActiveTab = async (trackingDomain) => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          const currentDomain = extractDomain(tabs[0].url);
          resolve(currentDomain === trackingDomain);
        } else {
          resolve(false);
        }
      });
    });
  };

  const startTimer = (
    trackingUrl,
    timeLimit,
    initialStartTime = null,
    initialElapsedTime = 0
  ) => {
    let elapsedTime = initialElapsedTime;
    const trackingDomain = extractDomain(trackingUrl);
    let storageUpdateCounter = 0;

    chrome.storage.local.get("timerInterval", (data) => {
      if (data.timerInterval) {
        clearInterval(data.timerInterval);
      }

      chrome.storage.local.set({
        trackingUrl: trackingDomain,
        timeLimit: timeLimit,
        startTime: initialStartTime || Date.now(),
        isTracking: true,
        elapsedTime: elapsedTime,
      });

      const newInterval = setInterval(async () => {
        const isActiveTab = await checkActiveTab(trackingDomain);
        if (isActiveTab && !isPaused) {
          elapsedTime += 500;
          storageUpdateCounter++;
          //Do it in batch instead of every 500ms
          if (storageUpdateCounter >= 10) {
            storageUpdateCounter = 0;
            chrome.storage.local.set({ elapsedTime: elapsedTime });
          }
          const remaining = Math.max(0, timeLimit - elapsedTime);
          if (remaining == 0) {
            chrome.storage.local.set({
              isTracking: false,
              elapsedTime: 0,
            });
            clearInterval(newInterval);
            chrome.storage.local.remove("timerInterval");
            setIsTracking(false);
            alert("Time's up! You have reached your time limit.");
            return;
          }
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimerDisplay(
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
              2,
              "0"
            )}`
          );
          setIsPaused(false);
        } else {
          setIsPaused(true);
        }
      }, 500);
      chrome.storage.local.set({ timerInterval: newInterval });
    });
  };

  return (
    <>
      <h1 className="text-2xl">Hello UQ CS</h1>
    </>
  );
}

export default App;
