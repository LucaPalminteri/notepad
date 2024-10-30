const titleElement = document.querySelector("h1");
const pageTitle = document.querySelector("title");
const textarea = document.querySelector("textarea");
const sidebar = document.querySelector(".sidebar");
const mainContent = document.querySelector("main");
const sidebarToggle = document.querySelector(".sidebar-toggle");

function saveContent() {
  const content = {
    title: titleElement.textContent,
    text: textarea.value,
  };
  localStorage.setItem("note", JSON.stringify(content));
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

function loadTitle() {
  const newTitle = titleElement.textContent || "Untitled Note";
  pageTitle.textContent = newTitle;
  saveContent();
}

function toggleSidebar() {
  sidebar.classList.toggle("closed");
  mainContent.classList.toggle("sidebar-closed");
  sidebarToggle.classList.toggle("closed");
}

loadContent();

textarea.addEventListener("input", saveContent);
titleElement.addEventListener("input", loadTitle);
sidebarToggle.addEventListener("click", toggleSidebar);
