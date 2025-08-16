import { useState, useEffect } from "react";
import IntroPage from "./components/ui/pages/Intropage";
import MainPage from "./components/ui/pages/MainPage";
import Todo from "./components/ui/pages/Todo";
import Notes from "./components/ui/pages/Notes";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState(25); // Default to 25 minutes
  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState([]);
  const [userName, setUserName] = useState("");
  const [isUserNameLoaded, setIsUserNameLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState("main");
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);

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

  // Load username, tracking state, sessions, and notes on component mount
  useEffect(() => {
    const loadInitialData = () => {
      chrome.storage.local.get(
        [
          "userName",
          "trackingUrl",
          "timeLimit",
          "isTracking",
          "elapsedTime",
          "sessions",
          "currentSession",
          "notes",
        ],
        (data) => {
          // Set username
          if (data.userName) {
            setUserName(data.userName);
          }
          setIsUserNameLoaded(true);

          // Load sessions
          if (data.sessions) {
            setSessions(data.sessions);
          }

          // Load current session
          if (data.currentSession) {
            setCurrentSession(data.currentSession);
          }

          // Load notes
          if (data.notes) {
            setNotes(data.notes);
          }

          // Handle tracking state
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

    loadInitialData();

    // Listen for storage changes (for timer updates)
    const handleStorageChange = (changes, area) => {
      if (area === "local") {
        if (changes.elapsedTime || changes.isTracking) {
          // Update tracking state
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
                  `${String(minutes).padStart(2, "0")}:${String(
                    seconds
                  ).padStart(2, "0")}`
                );
                setIsTracking(true);
              } else {
                setIsTracking(false);
                setTimerDisplay("00:00");
                // When session ends, save it to history
                if (currentSession) {
                  saveSessionToHistory(currentSession);
                  setCurrentSession(null);
                }
              }
            }
          );
        }
        if (changes.userName) {
          setUserName(changes.userName.newValue || "");
        }
        if (changes.sessions) {
          setSessions(changes.sessions.newValue || []);
        }
        if (changes.currentSession) {
          setCurrentSession(changes.currentSession.newValue || null);
        }
        if (changes.notes) {
          setNotes(changes.notes.newValue || []);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [currentSession]);

  const saveSessionToHistory = (session) => {
    chrome.storage.local.get(["sessions"], (data) => {
      const existingSessions = data.sessions || [];
      const updatedSessions = [...existingSessions, session];
      chrome.storage.local.set({ sessions: updatedSessions });
      setSessions(updatedSessions);
    });
  };

  const handleStartTracking = () => {
    if (!url || !minutes) {
      alert("Please enter both URL and time limit");
      return;
    }
    const timeLimit = minutes * 60 * 1000;

    // Create new session
    const newSession = {
      id: Date.now(),
      website: extractDomain(url),
      duration: minutes,
      startTime: Date.now(),
      tasks: [],
      completed: false,
    };

    setCurrentSession(newSession);

    // Save current session to storage
    chrome.storage.local.set({ currentSession: newSession });

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

        // Save session to history before clearing
        if (currentSession) {
          const completedSession = {
            ...currentSession,
            endTime: Date.now(),
            completed: true,
          };
          saveSessionToHistory(completedSession);
          setCurrentSession(null);
          chrome.storage.local.remove("currentSession");
        }
      }
    });
  };

  const handleNameSubmit = (name) => {
    setUserName(name);
    // Save username to chrome storage
    chrome.storage.local.set({ userName: name });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSessionUpdate = (updatedSession) => {
    setCurrentSession(updatedSession);
    // Update current session in storage
    chrome.storage.local.set({ currentSession: updatedSession });
  };

  // Determine which page to render based on state
  const renderPage = () => {
    // Show loading or nothing while checking username
    if (!isUserNameLoaded) {
      return null; // or a loading spinner
    }

    // If no username, show intro page
    if (!userName) {
      return <IntroPage onNameSubmit={handleNameSubmit} />;
    }

    // Handle page navigation
    switch (currentPage) {
      case "todo":
        return (
          <Todo
            onPageChange={handlePageChange}
            currentSession={currentSession}
            onSessionUpdate={handleSessionUpdate}
          />
        );
      case "notes":
        return <Notes onPageChange={handlePageChange} />;
      default:
        return (
          <MainPage
            username={userName}
            url={url}
            setUrl={setUrl}
            minutes={minutes}
            setMinutes={setMinutes}
            timerDisplay={timerDisplay}
            isTracking={isTracking}
            onStartTracking={handleStartTracking}
            onStopTracking={handleStopTracking}
            onPageChange={handlePageChange}
            currentSession={currentSession}
            sessions={sessions}
          />
        );
    }
  };

  return <>{renderPage()}</>;
}

export default App;
