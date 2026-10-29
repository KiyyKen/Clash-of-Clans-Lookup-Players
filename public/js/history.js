import { elements } from "./dom.js";

export const RECENT_KEY = "coc_recent_searches_v2";

export function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveRecent(type, tag, name, onSelectCallback) {
  let list = loadRecent().filter((i) => i.tag !== tag);
  list.unshift({ type, tag, name, time: Date.now() });
  if (list.length > 6) list.pop();
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    renderRecent(onSelectCallback);
  } catch (e) {}
}

export function deleteRecent(tag, onSelectCallback) {
  let list = loadRecent().filter((i) => i.tag !== tag);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  renderRecent(onSelectCallback);
}

export function renderRecent(onSelectCallback) {
  const list = loadRecent();
  if (!list.length) {
    elements.recentContainer.classList.add("hide");
    return;
  }
  elements.recentContainer.classList.remove("hide");
  elements.recentChips.innerHTML = "";

  list.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "recent-chip";
    chip.innerHTML = `
      <span>${item.name || item.tag}</span>
      <span class="recent-remove" title="Hapus">✕</span>
    `;

    chip.addEventListener("click", (e) => {
      if (e.target.classList.contains("recent-remove")) {
        e.stopPropagation();
        deleteRecent(item.tag, onSelectCallback);
        return;
      }
      if (onSelectCallback) {
        onSelectCallback(item.type, item.tag);
      }
    });

    elements.recentChips.appendChild(chip);
  });
}

export function initRecent(onSelectCallback) {
  elements.clearRecentBtn.addEventListener("click", () => {
    localStorage.removeItem(RECENT_KEY);
    renderRecent(onSelectCallback);
  });
  renderRecent(onSelectCallback);
}

