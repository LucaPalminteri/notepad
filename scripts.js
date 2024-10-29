const titleElement = document.querySelector("h1");
const pageTitle = document.querySelector("title");
const textarea = document.querySelector("textarea");

let saveTimeout;
const SAVE_INTERVAL = 0;

function saveContent() {
  const content = {
    title: titleElement.textContent,
    text: textarea.value,
  };
  localStorage.setItem("note", JSON.stringify(content));
}

function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveContent, SAVE_INTERVAL);
}

function loadContent() {
  const saved = localStorage.getItem("note");
  if (saved) {
    const content = JSON.parse(saved);
    titleElement.textContent = content.title || "Untitled Note";
    textarea.value = content.text || "";
    pageTitle.textContent = content.title || "Untitled Note";
  }
}

titleElement.addEventListener("input", () => {
  const newTitle = titleElement.textContent || "Untitled Note";
  pageTitle.textContent = newTitle;
  debouncedSave();
});

textarea.addEventListener("input", debouncedSave);

loadContent();
