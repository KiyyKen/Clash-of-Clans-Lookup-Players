import { elements } from "./dom.js";

export const THEME_STORAGE_KEY = "coc-theme-preference";

export function applyTheme(theme) {
  document.body.classList.remove("bg-image-mode");

  const isDay = theme === "image";
  if (isDay) {
    document.body.classList.add("bg-image-mode");
  }

  const selectedTheme = isDay ? "image" : "gradient";
  if (elements.themeSelect) {
    elements.themeSelect.value = selectedTheme;
  }

  localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
}

export function initTheme() {
  if (elements.themeSelect) {
    elements.themeSelect.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  }

  if (elements.bgDay) {
    elements.bgDay.addEventListener("error", () => {
      if (document.body.classList.contains("bg-image-mode")) applyTheme("gradient");
    });
  }

  const initialTheme = localStorage.getItem(THEME_STORAGE_KEY) || "gradient";
  applyTheme(initialTheme);
}

