import { showToast } from "./toast.js";

export async function copyToClipboard(text, label = "Tag") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(`${label} disalin ke clipboard! 📋`);
  } catch (err) {
    showToast(`Gagal menyalin: ${text}`);
  }
}

export function shareLink(type, tag, name) {
  const clean = tag.replace(/^#/, "");
  const url = `${window.location.origin}${window.location.pathname}?${type}=${encodeURIComponent(clean)}`;
  copyToClipboard(url, `Link ${name || tag}`);
}

export function syncUrl(type, tag) {
  const clean = tag.replace(/^#/, "");
  const newUrl = `${window.location.pathname}?${type}=${encodeURIComponent(clean)}`;
  window.history.replaceState({ type, tag }, "", newUrl);
}

