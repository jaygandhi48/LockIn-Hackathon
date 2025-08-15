import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState([]);

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

  useEffect(() => {
    const updateFromStorage = () => {
      chrome.storage.local.get(
        ["trackingUrl", "timeLimit", "isTracking", "elapsedTime"],
        (data) => {
          if (data.isTracking) {
            const remaining = Math.max(
              0,
              data.timeLimit - (data.elapsedTime || 0)
            );
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setTimerDisplay(
              `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
                2,
                "0"
              )}`
            );
            setIsTracking(true);
            setUrl(data.trackingUrl);
            setMinutes(Math.floor(data.timeLimit / (60 * 1000)));
          } else {
            setIsTracking(false);
            setTimerDisplay("00:00");
          }
        }
      );
    };
    updateFromStorage();
    const handleStorageChange = (changes, area) => {
      if (area === "local" && (changes.elapsedTime || changes.isTracking)) {
        updateFromStorage();
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleStartTracking = () => {
    if (!url || !minutes) {
      alert("Please enter both URL and time limit");
      return;
    }
    const timeLimit = minutes * 60 * 1000;

    chrome.runtime.sendMessage(
      {
        type: "START_TRACKING",
        url,
        timeLimit,
      },
      (response) => {
        if (response.status === "started") {
          setIsTracking(true);
        }
      }
    );
  };

  const handleStopTracking = () => {
    chrome.runtime.sendMessage({ type: "STOP_TRACKING" }, (response) => {
      if (response.status === "stopped") {
        setIsTracking(false);
        setTimerDisplay("00:00");
        setIsPaused(false);
      }
    });
  };

  return <h1>Hello world</h1>;
}

export default App;
