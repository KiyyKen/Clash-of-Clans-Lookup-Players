// Formatting utilities for Clash of Clans data

export function formatRole(role) {
  const map = {
    member: "Member",
    admin: "Elder",
    coLeader: "Co-Leader",
    leader: "Leader",
  };
  return map[role] || role || "Member";
}

export function formatClanType(type) {
  const map = {
    open: "Public (Open)",
    inviteOnly: "Invite Only",
    closed: "Closed",
  };
  return map[type] || type || "Public";
}

export function formatWarFrequency(freq) {
  const map = {
    always: "Always (Selalu)",
    moreThanOnceAWeek: "2x per minggu",
    onceAWeek: "1x per minggu",
    lessThanOnceAWeek: "Jarang",
    never: "Never",
    unknown: "Tidak diketahui",
  };
  return map[freq] || freq || "-";
}

export function renderLabels(container, labels = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!labels || labels.length === 0) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";
  labels.forEach((l) => {
    const chip = document.createElement("div");
    chip.className = "official-label-chip";
    if (l.iconUrl) {
      const img = document.createElement("img");
      img.className = "official-label-img";
      img.src = l.iconUrl;
      img.alt = "";
      chip.appendChild(img);
    }
    const txt = document.createElement("span");
    txt.textContent = l.name;
    chip.appendChild(txt);
    container.appendChild(chip);
  });
}

