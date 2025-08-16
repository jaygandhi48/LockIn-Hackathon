import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ArrowLeft,
  FileText,
} from "lucide-react";

const Notes = ({ onPageChange }) => {
  const [notes, setNotes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  useEffect(() => {
    chrome.storage.local.get(["notes"], (data) => {
      if (data.notes) {
        setNotes(data.notes);
      }
    });
  }, []);

  useEffect(() => {
    if (notes.length >= 0) {
      chrome.storage.local.set({ notes });
    }
  }, [notes]);

  const addNote = () => {
    if (noteTitle.trim() || noteContent.trim()) {
      const newNote = {
        id: Date.now(),
        title: noteTitle.trim() || "Untitled Note",
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setNoteTitle("");
      setNoteContent("");
      setIsCreating(false);
    }
  };

  const updateNote = (id) => {
    if (noteTitle.trim() || noteContent.trim()) {
      setNotes(
        notes.map((note) =>
          note.id === id
            ? {
                ...note,
                title: noteTitle.trim() || "Untitled Note",
                content: noteContent.trim(),
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      );
      setNoteTitle("");
      setNoteContent("");
      setEditingId(null);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setNoteTitle("");
    setNoteContent("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Main glass card */}
      <div className="min-h-[400px] min-w-[300px] w-full max-w-md backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-6 z-10 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onPageChange("main")}
            className="p-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center mb-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Notes & Journal
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="p-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {(isCreating || editingId) && (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6">
            <input
              type="text"
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-2 mb-3 border-0 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/80 transition-all duration-300 font-medium"
            />
            <textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 mb-3 border-0 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/80 transition-all duration-300 resize-none"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={editingId ? () => updateNote(editingId) : addNote}
                disabled={!noteTitle.trim() && !noteContent.trim()}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  !noteTitle.trim() && !noteContent.trim()
                    ? "bg-slate-200/50 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                <Save className="w-4 h-4 inline mr-2" />
                {editingId ? "Update" : "Save"} Note
              </button>
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-slate-600/80 backdrop-blur-sm text-white rounded-xl hover:bg-slate-700/80 transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-slate-600 text-sm mb-2">No notes yet</p>
              <p className="text-slate-500 text-xs">
                Click the + button to create your first note
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-white/70"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="p-1 text-slate-400 hover:text-emerald-600 transition-colors duration-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {note.content && (
                  <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                    {note.content}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Created: {formatDate(note.createdAt)}</span>
                  {note.updatedAt !== note.createdAt && (
                    <span>Updated: {formatDate(note.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Motivational Quote */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 italic">
            "The palest ink is better than the best memory." - Chinese Proverb
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notes;
