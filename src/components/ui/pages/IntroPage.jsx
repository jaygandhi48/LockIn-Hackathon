import React, { useState } from "react";

const IntroPage = ({ onNameSubmit }) => {
  const [userName, setUserName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      // Save userName to storages
      chrome.storage.local.set({ userName }, () => {
        onNameSubmit(userName); // Notify parent component
        alert(`Welcome, ${userName}! Your name has been saved.`); // For demonstration
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Main glass card */}
      <div className="min-h-[400px] min-w-[300px] w-full max-w-md backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-6 z-10 relative flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            LockedIn
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Ready to be locked in?
          </p>
        </div>

        {/* Form */}
        <form
          className="space-y-4 flex-1 flex flex-col justify-center"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Enter your name
            </label>

            <input
              id="userName"
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border-0 rounded-2xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/80 transition-all duration-300 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!userName.trim()}
            className={`w-full px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 ${
              !userName.trim()
                ? "bg-slate-200/50 text-slate-400 cursor-not-allowed backdrop-blur-sm"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
            }`}
          >
            Get Started
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 font-medium">
            Start your focused journey today
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
