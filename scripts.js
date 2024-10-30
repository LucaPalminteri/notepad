// Data structure for notes
let notes = [];
let currentNoteId = null;

// DOM elements
const titleElement = document.querySelector("h1");
const pageTitle = document.querySelector("title");
const textarea = document.querySelector("textarea");
const sidebar = document.querySelector(".sidebar");
const mainContent = document.querySelector("main");
const sidebarToggle = document.querySelector(".sidebar-toggle");
const newNoteBtn = document.querySelector(".new-note-btn");
const sidebarContent = document.querySelector(".sidebar-content");

// Generate unique ID for notes
function generateId() {
  return Date.now().toString();
}

// Date grouping functions
function isToday(date) {
  const today = new Date();
  return new Date(date).toDateString() === today.toDateString();
}

function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(date).toDateString() === yesterday.toDateString();
}

function isWithinLastWeek(date) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(date) > weekAgo && !isToday(date) && !isYesterday(date);
}

function groupNotesByDate(notes) {
  return {
    today: notes.filter((note) => isToday(note.lastModified)),
    yesterday: notes.filter((note) => isYesterday(note.lastModified)),
    previous7Days: notes.filter((note) => isWithinLastWeek(note.lastModified)),
    older: notes.filter((note) => {
      return (
        !isToday(note.lastModified) &&
        !isYesterday(note.lastModified) &&
        !isWithinLastWeek(note.lastModified)
      );
    }),
  };
}

// Save all notes to localStorage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Save current note content
function saveCurrentNote() {
  if (!currentNoteId) return;

  const noteIndex = notes.findIndex((note) => note.id === currentNoteId);
  if (noteIndex !== -1) {
    notes[noteIndex] = {
      id: currentNoteId,
      title: titleElement.textContent || "Untitled Note",
      text: textarea.value,
      lastModified: Date.now(),
    };
    saveNotes();
    updateSidebarList();
  }
}

// Load notes from localStorage
function loadNotes() {
  const savedNotes = localStorage.getItem("notes");
  notes = savedNotes ? JSON.parse(savedNotes) : [];
  updateSidebarList();

  const lastNoteId = localStorage.getItem("lastActiveNote");
  if (lastNoteId && notes.find((note) => note.id === lastNoteId)) {
    loadNote(lastNoteId);
  } else if (notes.length > 0) {
    loadNote(notes[0].id);
  } else {
    createNewNote();
  }
}

function createThemeToggle() {
  const themeToggleContainer = document.createElement("div");
  themeToggleContainer.className = "theme-toggle-container";

  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle";
  themeToggle.innerHTML = `
        <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;

  themeToggleContainer.appendChild(themeToggle);
  document.querySelector(".tooltip").appendChild(themeToggleContainer);

  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Theme toggle handler
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}

// Create a new note
function createNewNote() {
  const newNote = {
    id: generateId(),
    title: "",
    text: "",
    lastModified: Date.now(),
  };

  notes.unshift(newNote);
  saveNotes();
  loadNote(newNote.id);
  updateSidebarList();
}

// Load a specific note
function loadNote(noteId) {
  const note = notes.find((note) => note.id === noteId);
  if (note) {
    currentNoteId = note.id;
    titleElement.textContent = note.title;
    textarea.value = note.text;
    pageTitle.textContent = note.title;
    localStorage.setItem("lastActiveNote", noteId);

    // Update active state in sidebar
    document.querySelectorAll(".note-item").forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.noteId === noteId) {
        item.classList.add("active");
      }
    });
  }
}

// Create note item element
function createNoteElement(note) {
  const noteElement = document.createElement("div");
  noteElement.className = "note-item";
  if (note.id === currentNoteId) {
    noteElement.classList.add("active");
  }
  noteElement.dataset.noteId = note.id;

  const titleSpan = document.createElement("span");
  titleSpan.textContent = note.title || "Untitled Note";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-note";
  deleteBtn.innerHTML = "×";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    deleteNote(note.id);
  };

  noteElement.appendChild(titleSpan);
  noteElement.appendChild(deleteBtn);
  noteElement.addEventListener("click", () => loadNote(note.id));

  return noteElement;
}

// Update the sidebar list of notes
function updateSidebarList() {
  // Clear existing list
  const notesList =
    document.querySelector(".notes-list") || document.createElement("div");
  notesList.className = "notes-list";
  notesList.innerHTML = "";

  const groupedNotes = groupNotesByDate(notes);

  // Create sections for each time period
  const sections = [
    { title: "Today", notes: groupedNotes.today },
    { title: "Yesterday", notes: groupedNotes.yesterday },
    { title: "Previous 7 Days", notes: groupedNotes.previous7Days },
    { title: "Older", notes: groupedNotes.older },
  ];

  sections.forEach((section) => {
    if (section.notes.length > 0) {
      const sectionElement = document.createElement("div");
      sectionElement.className = "notes-section";

      const sectionTitle = document.createElement("h2");
      sectionTitle.className = "section-title";
      sectionTitle.textContent = section.title;
      sectionElement.appendChild(sectionTitle);

      section.notes.forEach((note) => {
        sectionElement.appendChild(createNoteElement(note));
      });

      notesList.appendChild(sectionElement);
    }
  });

  // Insert the list after the new note button
  if (!document.querySelector(".notes-list")) {
    sidebarContent.appendChild(notesList);
  }
}

// Delete a note
function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    notes = notes.filter((note) => note.id !== noteId);
    saveNotes();

    if (currentNoteId === noteId) {
      if (notes.length > 0) {
        loadNote(notes[0].id);
      } else {
        createNewNote();
      }
    }

    updateSidebarList();
  }
}

// Event listeners
loadNotes();
textarea.addEventListener("input", saveCurrentNote);
titleElement.addEventListener("input", () => {
  saveCurrentNote();
  pageTitle.textContent = titleElement.textContent || "Untitled Note";
});
sidebarToggle.addEventListener("click", toggleSidebar);
newNoteBtn.addEventListener("click", createNewNote);

function toggleSidebar() {
  sidebar.classList.toggle("closed");
  mainContent.classList.toggle("sidebar-closed");
  sidebarToggle.classList.toggle("closed");
}

createThemeToggle();
