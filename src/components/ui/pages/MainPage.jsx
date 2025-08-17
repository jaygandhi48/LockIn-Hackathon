import React, { useState, useEffect } from "react";
import { CheckSquare, StickyNote, Plus, X } from "lucide-react";

const MainPage = ({
  username,
  urls, // Changed from url to urls array
  setUrls, // Changed from setUrl to setUrls
  minutes,
  setMinutes,
  timerDisplay,
  isTracking,
  onStartTracking,
  onStopTracking,
  onPageChange,
  currentSession,
  sessions = [],
  isDistractionFreeMode,
  setIsDistractionFreeMode,
}) => {
  const [selectedDuration, setSelectedDuration] = useState("25");
  const [newUrl, setNewUrl] = useState(""); // For adding new URLs

  // Update minutes when duration selection changes
  useEffect(() => {
    setMinutes(parseInt(selectedDuration));
  }, [selectedDuration, setMinutes]);

  const handleStartFocus = () => {
    if (!urls.length) {
      alert("Please add at least one website URL");
      return;
    }
    onStartTracking();
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) {
      alert("Please enter a website URL");
      return;
    }

    // Check for duplicates
    const domain = extractDomain(newUrl.trim());
    const existingDomains = urls.map((url) => extractDomain(url));

    if (existingDomains.includes(domain)) {
      alert("This website is already in your allowed list");
      return;
    }

    setUrls([...urls, newUrl.trim()]);
    setNewUrl("");
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);
    setUrls(updatedUrls);
  };

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

  const taskCount = currentSession?.tasks?.length || 0;
  const completedTasks =
    currentSession?.tasks?.filter((task) => task.completed).length || 0;

  const handleYouTubeDistractionFree = () => {
    chrome.runtime.sendMessage(
      { action: "TOGGLE_DISTRACT_FREE" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          alert("An error occurred while toggling distraction-free mode.");
          return;
        }

        if (response) {
          if (response.status !== false) {
            const newState = response.status;
            setIsDistractionFreeMode(newState);

            alert(
              response.message ||
                (newState
                  ? "YouTube distraction-free mode enabled!"
                  : "YouTube distraction-free mode disabled!")
            );
          } else {
            alert(
              response.error ||
                "Could not toggle distraction-free mode. Make sure you're on a YouTube page."
            );
          }
        } else {
          alert("No response received. Make sure you're on a YouTube page.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Main glass card */}
      <div className="min-h-[400px] min-w-[300px] w-full max-w-md backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-6 z-10 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                isTracking ? "bg-green-400" : "bg-gray-400"
              }`}
            ></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isTracking ? "Focus Active" : "Distract-Free Mode"}
            </h1>
          </div>
        </div>

        <h1 className="text-3xl text-center mb-6">Welcome, {username}!</h1>

        {/* Timer Display */}
        {isTracking && (
          <div className="flex flex-col items-center mb-6">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {timerDisplay}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">
                      Time Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isTracking ? (
          // Setup Form
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">
                Allowed Websites
              </h3>

              {/* Add new URL input */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Add website URL (e.g., github.com)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddUrl()}
                  className="flex-1 px-3 py-2 border-0 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/80 transition-all duration-300"
                />
                <button
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Display added URLs */}
              {urls.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/30 rounded-lg p-2"
                    >
                      <span className="text-sm text-slate-700 truncate flex-1">
                        {extractDomain(url)}
                      </span>
                      <button
                        onClick={() => handleRemoveUrl(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {urls.length === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No websites added yet. Add at least one to start a focus
                  session.
                </p>
              )}
            </div>

            {/* Focus Timer Duration */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">
                Focus Duration
              </h3>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-4 py-3 border-0 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
              >
                <option value="1">1 minute (Super short focus)</option>
                <option value="15">15 minutes (Short Focus)</option>
                <option value="25">25 minutes (Pomodoro)</option>
                <option value="45">45 minutes (Deep Work)</option>
                <option value="60">60 minutes (Extended Focus)</option>
              </select>
            </div>

            {/* Start Focus Session Button */}
            <button
              onClick={handleStartFocus}
              disabled={urls.length === 0}
              className={`w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                urls.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              Start Focus Session
            </button>
          </div>
        ) : (
          // Active Session Controls
          <div className="space-y-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800 mb-2">
                Currently Allowed Websites:
              </h3>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {urls.map((url, index) => (
                  <p key={index} className="text-blue-600 font-medium text-sm">
                    • {extractDomain(url)}
                  </p>
                ))}
              </div>

              {/* Task Progress */}
              {taskCount > 0 && (
                <div className="mt-3 pt-3 border-t border-white/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Session Tasks:</span>
                    <span className="font-medium text-purple-600">
                      {completedTasks}/{taskCount} completed
                    </span>
                  </div>
                  <div className="mt-2 bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                      style={{
                        width: `${
                          taskCount > 0 ? (completedTasks / taskCount) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Todo Button */}
            <button
              onClick={() => onPageChange("todo")}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              Manage Session Tasks
            </button>

            {/* Stop Focus Session Button */}
            <button
              onClick={onStopTracking}
              className="w-full px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Stop Focus Session
            </button>
          </div>
        )}

        {/* Notes Button - Always visible */}
        <div className="mt-6">
          <button
            onClick={() => onPageChange("notes")}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <StickyNote className="w-4 h-4 inline mr-2" />
            Notes & Journal
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleYouTubeDistractionFree}
            className={`w-full px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
              isDistractionFreeMode
                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            }`}
          >
            <StickyNote className="w-4 h-4 inline mr-2" />
            {isDistractionFreeMode ? "Disable" : "Enable"} YouTube Distraction
            Free
          </button>
        </div>

        {/* Session History */}
        {Array.isArray(sessions) && sessions.length > 0 && !isTracking && (
          <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="font-semibold text-slate-800 mb-3">
              Recent Sessions
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sessions
                .slice(-3)
                .reverse()
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 truncate">
                      <div className="text-slate-600 text-xs">
                        {session.websites
                          ? session.websites.slice(0, 2).join(", ") +
                            (session.websites.length > 2
                              ? ` +${session.websites.length - 2} more`
                              : "")
                          : session.website}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-medium">
                        {session.duration}m
                      </span>
                      {session.tasks && session.tasks.length > 0 && (
                        <span className="text-purple-600 text-xs">
                          {session.tasks.filter((t) => t.completed).length}/
                          {session.tasks.length} tasks
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 italic">
            {isTracking
              ? "Stay focused! You're doing great!"
              : '"The successful warrior is the average person with laser-like focus." - Bruce Lee'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
