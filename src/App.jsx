import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Button from "./components/Button";
import Card from "./components/Card";
import TodoList from "./components/todo";
import NotesJournal from "./components/Notes";

function App() {
  /*
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

  **/

  return (
    <>
      <div>
        <NotesJournal></NotesJournal>
      </div>
    </>
  );
}

export default App;
