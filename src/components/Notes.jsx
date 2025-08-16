import { useState } from 'react';
import { Plus, Trash2, Calendar, Smile, Frown, Meh, Zap, Coffee, Battery, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotesJournal() {
  const [notes, setNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  
  const [newNote, setNewNote] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: '',
    productivity: 0,
    content: ''
  });

  const moods = [
    { value: 'great', label: 'Great', icon: Smile, color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'good', label: 'Good', icon: Smile, color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'bad', label: 'Bad', icon: Frown, color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'terrible', label: 'Terrible', icon: Frown, color: 'text-red-600', bg: 'bg-red-100' }
  ];

  const productivityLevels = [
    { value: 1, label: 'Very Low', icon: Battery, color: 'text-red-500' },
    { value: 2, label: 'Low', icon: Battery, color: 'text-orange-500' },
    { value: 3, label: 'Medium', icon: Coffee, color: 'text-yellow-500' },
    { value: 4, label: 'High', icon: Zap, color: 'text-blue-500' },
    { value: 5, label: 'Very High', icon: Zap, color: 'text-green-500' }
  ];

  const addNote = () => {
    if (newNote.content.trim() && newNote.mood && newNote.productivity > 0) {
      const note = {
        id: Date.now(),
        ...newNote,
        createdAt: new Date().toISOString()
      };
      setNotes([note, ...notes]);
      setNewNote({
        date: new Date().toISOString().split('T')[0],
        mood: '',
        productivity: 0,
        content: ''
      });
      setIsAddingNote(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotes(newExpanded);
  };

  const getMoodInfo = (moodValue) => {
    return moods.find(mood => mood.value === moodValue) || moods[2];
  };

  const getProductivityInfo = (level) => {
    return productivityLevels.find(p => p.value === level) || productivityLevels[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (content) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daily Notes & Journal</h1>
          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isAddingNote
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus size={20} />
            {isAddingNote ? 'Cancel' : 'New Entry'}
          </button>
        </div>

        {/* Add New Note Form */}
        {isAddingNote && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Journal Entry</h3>
            
            {/* Date Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={newNote.date}
                onChange={(e) => setNewNote({...newNote, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mood Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today?
              </label>
              <div className="flex gap-2 flex-wrap">
                {moods.map(mood => {
                  const IconComponent = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => setNewNote({...newNote, mood: mood.value})}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border-2 transition-colors ${
                        newNote.mood === mood.value
                          ? `${mood.bg} border-current ${mood.color}`
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent size={16} className={newNote.mood === mood.value ? mood.color : 'text-gray-500'} />
                      <span className={`text-sm ${newNote.mood === mood.value ? mood.color : 'text-gray-700'}`}>
                        {mood.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Productivity Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productivity Level (1-5)
              </label>
              <div className="flex gap-2">
                {productivityLevels.map(level => {
                  const IconComponent = level.icon;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setNewNote({...newNote, productivity: level.value})}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md border-2 transition-colors ${
                        newNote.productivity === level.value
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent size={20} className={
                        newNote.productivity === level.value ? 'text-blue-600' : level.color
                      } />
                      <span className="text-xs">{level.value}</span>
                    </button>
                  );
                })}
              </div>
              {newNote.productivity > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {getProductivityInfo(newNote.productivity).label}
                </p>
              )}
            </div>

            {/* Note Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Write your thoughts, experiences, goals, or anything else you'd like to remember about today..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={addNote}
                disabled={!newNote.content.trim() || !newNote.mood || newNote.productivity === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Entry
              </button>
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p>Start documenting your daily experiences, moods, and thoughts!</p>
            </div>
          ) : (
            notes.map(note => {
              const moodInfo = getMoodInfo(note.mood);
              const productivityInfo = getProductivityInfo(note.productivity);
              const MoodIcon = moodInfo.icon;
              const ProductivityIcon = productivityInfo.icon;
              const isExpanded = expandedNotes.has(note.id);
              const showPreview = note.content.length > 150 && !isExpanded;

              return (
                <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {formatDate(note.date)}
                        </h3>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${moodInfo.bg}`}>
                          <MoodIcon size={14} className={moodInfo.color} />
                          <span className={`text-xs font-medium ${moodInfo.color}`}>
                            {moodInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ProductivityIcon size={14} className={productivityInfo.color} />
                          <span className="text-xs text-gray-600">
                            Productivity: {note.productivity}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed">
                    {showPreview ? getPreview(note.content) : note.content}
                  </div>
                  
                  {note.content.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(note.id)}
                      className="flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-3 pt-3 border-t">
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {notes.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Journal Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-2xl text-blue-600">{notes.length}</div>
                <div className="text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-green-600">
                  {(notes.reduce((sum, note) => sum + note.productivity, 0) / notes.length).toFixed(1)}
                </div>
                <div className="text-gray-600">Avg Productivity</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-purple-600">
                  {notes.filter(note => ['great', 'good'].includes(note.mood)).length}
                </div>
                <div className="text-gray-600">Good Days</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-2xl text-orange-600">
                  {Math.round(notes.reduce((sum, note) => sum + note.content.length, 0) / notes.length)}
                </div>
                <div className="text-gray-600">Avg Words/Entry</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}