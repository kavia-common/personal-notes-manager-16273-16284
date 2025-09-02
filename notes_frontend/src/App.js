import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import AssistantMessage from './AssistantMessage';

/**
 * Notes App – Vintage Notepad UI
 * - In-memory notes store with CRUD and search
 * - Layout: TopBar, Sidebar, Editor
 * - Aesthetic: cream paper, ruled lines, red margin, binder rings
 */

// Utilities
const uid = () => Math.random().toString(36).slice(2, 10);
const nowISO = () => new Date().toISOString();
const fmtDate = (iso) => new Date(iso).toLocaleString();

// Demo seed data
const seedNotes = [
  {
    id: uid(),
    title: 'Welcome to Notes',
    content:
      'This is your vintage notepad.\n\n- Create a new note with the “+ New Note” button.\n- Search using the top search bar.\n- Your content aligns after the red margin rule.\n\nHappy writing!',
    tags: ['welcome', 'tips'],
    pinned: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: uid(),
    title: 'Grocery List',
    content: '• Coffee beans\n• Oat milk\n• Sourdough bread\n• Apples\n• Eggs',
    tags: ['personal'],
    pinned: false,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

// Icons (inline SVG, 1.5px stroke)
const Icon = {
  // PUBLIC_INTERFACE
  Search: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Plus: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Notebook: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Tag: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20 13l-7 7-10-10V3h7l10 10z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  Trash: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <polyline points="3 6 5 6 21 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Pin: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M16 3l5 5-6 6v4l-3-3-6 6v-4l6-6L16 3z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  More: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Bold: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M7 5h6.5a3.5 3.5 0 0 1 0 7H7zM7 12h7a4 4 0 0 1 0 8H7z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Italic: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <line x1="10" y1="5" x2="20" y2="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="19" x2="14" y2="19" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="5" x2="10" y2="19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Underline: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M7 5v7a5 5 0 0 0 10 0V5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  List: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <line x1="9" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
};

// App shell components
function TopBar({ query, setQuery, onNew }) {
  return (
    <header className="topbar" role="banner">
      <div className="brand">
        <Icon.Notebook />
        <span className="brand-title">Notes</span>
      </div>
      <div className="search">
        <Icon.Search className="search-icon" />
        <input
          aria-label="Search notes"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="actions">
        <button className="btn primary" onClick={onNew} aria-label="New Note">
          <Icon.Plus />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
}

function Sidebar({
  notes,
  activeId,
  setActiveId,
  filter,
  setFilter,
  onDelete,
  onTogglePin,
}) {
  const filters = ['All', 'Pinned', 'Recent'];
  const filtered = useMemo(() => {
    let list = [...notes];
    if (filter === 'Pinned') list = list.filter((n) => n.pinned);
    if (filter === 'Recent') list = list.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    return list;
  }, [notes, filter]);

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="sidebar-section">
        <div className="pill-group" role="tablist" aria-label="Quick filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`pill ${filter === f ? 'selected' : ''}`}
              onClick={() => setFilter(f)}
              role="tab"
              aria-selected={filter === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">Notes</div>
        <div className="note-list" role="list">
          {filtered.length === 0 && (
            <div className="empty muted">No notes yet</div>
          )}
          {filtered.map((n) => (
            <button
              key={n.id}
              className={`note-cell ${activeId === n.id ? 'active' : ''}`}
              onClick={() => setActiveId(n.id)}
              role="listitem"
            >
              <div className="cell-main">
                <div className="cell-title">
                  {n.title || 'Untitled note'}
                </div>
                <div className="cell-snippet">
                  {(n.content || '').split('\n')[0].slice(0, 64)}
                </div>
              </div>
              <div className="cell-meta">
                <time className="muted">{fmtDate(n.updatedAt)}</time>
                <div className="cell-actions">
                  <button
                    className={`icon-btn ${n.pinned ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(n.id);
                    }}
                    aria-label={n.pinned ? 'Unpin note' : 'Pin note'}
                    title={n.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Icon.Pin />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(n.id);
                    }}
                    aria-label="Delete note"
                    title="Delete"
                  >
                    <Icon.Trash />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer muted">
        {notes.length} note{notes.length !== 1 ? 's' : ''}
      </div>
    </aside>
  );
}

function Toolbar() {
  const buttons = [
    { key: 'bold', icon: <Icon.Bold />, label: 'Bold (Ctrl/Cmd+B)' },
    { key: 'italic', icon: <Icon.Italic />, label: 'Italic (Ctrl/Cmd+I)' },
    { key: 'underline', icon: <Icon.Underline />, label: 'Underline' },
    { key: 'list', icon: <Icon.List />, label: 'List' },
  ];
  return (
    <div className="toolbar" role="toolbar" aria-label="Editor toolbar">
      {buttons.map((b) => (
        <button key={b.key} className="icon-btn" aria-label={b.label} title={b.label}>
          {b.icon}
        </button>
      ))}
      <span className="toolbar-spacer" />
      <button className="icon-btn" aria-label="More" title="More">
        <Icon.More />
      </button>
    </div>
  );
}

function Editor({ note, onChange, onDelete }) {
  if (!note) {
    return (
      <main className="editor empty-state" role="main">
        <div className="paper">
          <div className="rings" aria-hidden="true">
            <span className="ring" />
            <span className="ring" />
            <span className="ring" />
          </div>
          <div className="empty-message">
            <div className="empty-title">Select a note to get started</div>
            <div className="muted">Or create a new note from the top bar.</div>
          </div>
        </div>
      </main>
    );
  }

  const handleTitle = (e) => onChange({ ...note, title: e.target.value, updatedAt: nowISO() });
  const handleBody = (e) => onChange({ ...note, content: e.target.value, updatedAt: nowISO() });

  return (
    <main className="editor" role="main">
      <div className="paper">
        <div className="rings" aria-hidden="true">
          <span className="ring" />
          <span className="ring" />
          <span className="ring" />
        </div>
        <input
          className="note-title"
          placeholder="Untitled note"
          value={note.title}
          onChange={handleTitle}
          aria-label="Note title"
        />
        <Toolbar />
        <textarea
          className="note-body"
          placeholder="Start typing…"
          value={note.content}
          onChange={handleBody}
          aria-label="Note body"
        />
        <div className="editor-meta muted">
          <span>Updated {fmtDate(note.updatedAt)}</span>
          <span className="spacer" />
          <button className="btn danger" onClick={() => onDelete(note.id)} aria-label="Delete note">
            <Icon.Trash />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </main>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState(seedNotes);
  const [activeId, setActiveId] = useState(seedNotes[0]?.id || null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.querySelector('.search input');
        input?.focus();
      }
      if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'n') {
        // quick new note
        e.preventDefault();
        createNote();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, query]);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  // PUBLIC_INTERFACE
  const createNote = () => {
    const n = {
      id: uid(),
      title: '',
      content: '',
      tags: [],
      pinned: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setNotes([n, ...notes]);
    setActiveId(n.id);
  };

  // PUBLIC_INTERFACE
  const updateNote = (note) => {
    setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveId(remaining[0]?.id || null);
    }
  };

  const togglePin = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: nowISO() } : n))
    );
  };

  return (
    <div className="vintage-app">
      <TopBar query={query} setQuery={setQuery} onNew={createNote} />
      <div className="app-grid">
        <Sidebar
          notes={filteredNotes}
          activeId={activeId}
          setActiveId={setActiveId}
          filter={filter}
          setFilter={setFilter}
          onDelete={deleteNote}
          onTogglePin={togglePin}
        />
        <div style={{ overflowY: 'auto' }}>
          <div style={{ padding: '16px 0' }}>
            <AssistantMessage
              headerText="KaviaAI"
              alertContent={
                <span>
                  <b>
                    It looks like there was a problem reading your uploaded design image ( 20250825_082754_1.png ) from
                    the path /home/kavia/workspace/code-generation/attachments/20250825_082754_1.png.
                  </b>{' '}
                  This may be due to an unsupported file type or a path issue.
                </span>
              }
              bullets={[
                'Double-check the file name and extension are correct',
                'Confirm the image exists at the indicated path',
                'Re-upload the image if needed',
              ]}
              paragraphs={[
                'Once I have a valid image, I will extract all design details and move forward with generating your full React code based on your design reference!',
                'Let me know once you’ve uploaded or clarified the design image. 😊',
              ]}
            />
          </div>
          <Editor note={activeNote} onChange={updateNote} onDelete={deleteNote} />
        </div>
      </div>
    </div>
  );
}

export default App;
