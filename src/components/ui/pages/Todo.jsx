import React, { useState, useEffect } from "react";
import { Plus, Check, X, ArrowLeft } from "lucide-react";

const Todo = ({ onPageChange, currentSession, onSessionUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  useEffect(() => {
    if (currentSession?.tasks) {
      setTasks(currentSession.tasks);
    } else {
      setTasks([]);
    }
  }, [currentSession]);
  const addTask = () => {
    if (inputValue.trim() && currentSession) {
      const newTask = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        sessionId: currentSession.id,
        createdAt: Date.now(),
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setInputValue("");
      updateSessionTasks(updatedTasks);
    }
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? Date.now() : null,
          }
        : task
    );
    setTasks(updatedTasks);
    updateSessionTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    updateSessionTasks(updatedTasks);
  };

  const updateSessionTasks = (updatedTasks) => {
    if (currentSession && onSessionUpdate) {
      const updatedSession = {
        ...currentSession,
        tasks: updatedTasks,
        lastUpdated: Date.now(),
      };
      onSessionUpdate(updatedSession);
      chrome.storage.local.set({
        currentSession: updatedSession,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;

  // Get session info
  const sessionWebsite = currentSession?.website || "Unknown";
  const sessionDuration = currentSession?.duration || 0;

  // Calculate session time elapsed if session is active
  const getSessionTimeElapsed = () => {
    if (!currentSession?.startTime) return "0 min";
    const elapsed = Math.floor(
      (Date.now() - currentSession.startTime) / (1000 * 60)
    );
    return `${elapsed} min elapsed`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Main glass card */}
      <div className="min-h-[500px] min-w-[300px] w-full max-w-md backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-6 z-10 relative">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onPageChange("main")}
            className="p-2 text-slate-600 hover:text-purple-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Session Tasks
              </h1>
            </div>

            {/* Session Info */}
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-medium truncate">{sessionWebsite}</p>
              <p>{sessionDuration} min focus session</p>

              {totalCount > 0 && (
                <p className="text-green-600 font-medium">
                  {completedCount}/{totalCount} tasks completed
                </p>
              )}
            </div>
          </div>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>

        {/* Session Status Card */}
        {currentSession && (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">
                  Active Session Date:
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(currentSession.startTime).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a task for this session..."
              className="flex-1 px-4 py-3 border-0 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/80 transition-all duration-300 text-sm"
              disabled={!currentSession}
            />
            <button
              onClick={addTask}
              disabled={!inputValue.trim() || !currentSession}
              className={`p-3 rounded-xl transition-all duration-300 ${
                !inputValue.trim() || !currentSession
                  ? "bg-slate-200/50 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {!currentSession && (
            <p className="text-xs text-red-500 mt-2">
              Start a focus session to add tasks
            </p>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-slate-600 text-sm font-medium">
                No tasks for this session yet
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {currentSession
                  ? `Add tasks to stay focused on ${sessionWebsite}`
                  : "Start a focus session to add tasks"}
              </p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                className={`bg-white/50 backdrop-blur-sm rounded-xl p-3 transition-all duration-300 ${
                  task.completed ? "opacity-75" : "hover:bg-white/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        task.completed
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-500"
                          : "border-slate-300 hover:border-purple-500"
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span
                        className={`block transition-all duration-300 text-sm ${
                          task.completed
                            ? "text-slate-500 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {task.text}
                      </span>
                      {task.completed && task.completedAt && (
                        <span className="text-xs text-green-600">
                          Completed{" "}
                          {new Date(task.completedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-purple-600">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="bg-slate-200/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Footer or Spacer */}
        <div className="text-center text-xs text-slate-400 mt-auto">
          <p>Stay focused and productive 💪</p>
        </div>
      </div>
    </div>
  );
};

export default Todo;
