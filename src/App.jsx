import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

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

  return (
    <>
      <h1 className="text-2xl">Hello UQ CS</h1>
    </>
  );
}

export default App;
