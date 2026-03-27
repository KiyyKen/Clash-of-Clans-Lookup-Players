// Cache DOM elements once so we do not query repeatedly
const elements = {
  tagInput: document.getElementById("tagInput"),
  fetchButton: document.getElementById("fetchBtn"),
  errorMessage: document.getElementById("errorMessage"),
  playerCard: document.getElementById("resultCard"),
  clanCard: document.getElementById("clanCard"),

  playerName: document.getElementById("playerName"),
  townHallLevel: document.getElementById("townHallLevel"),
  trophies: document.getElementById("trophies"),
  bestTrophies: document.getElementById("bestTrophies"),
  warStars: document.getElementById("warStars"),
  expLevel: document.getElementById("expLevel"),
  clanName: document.getElementById("clanName"),

  clanBadge: document.getElementById("clanBadge"),
  clanDataName: document.getElementById("clanDataName"),
  clanDataTag: document.getElementById("clanDataTag"),
  clanLevel: document.getElementById("clanLevel"),
  clanMembers: document.getElementById("clanMembers"),
  warLeague: document.getElementById("warLeague"),
  clanLocation: document.getElementById("clanLocation"),
  membersStatus: document.getElementById("membersStatus"),
  membersTableBody: document.getElementById("membersTableBody"),
  backgroundImage: document.getElementById("backgroundImage"),
  backgroundVideo: document.getElementById("backgroundVideo"),
  modeButtons: document.querySelectorAll(".mode-btn[data-mode]"),
  soundToggleButton: document.getElementById("soundToggleBtn"),
};

const DEFAULT_BUTTON_TEXT = "Fetch Player";
const DEFAULT_CLAN_BADGE = "/assets/clan-temp.svg";
const BACKGROUND_STORAGE_KEY = "coc-background-mode";
const AVAILABLE_BACKGROUND_MODES = ["gradient", "image", "video"];

// Small helper for cleaner text assignment
function setText(element, value, fallback = "-") {
  element.textContent = value ?? fallback;
}

function activateBackgroundMode(mode) {
  const validMode = AVAILABLE_BACKGROUND_MODES.includes(mode) ? mode : "gradient";

  document.body.classList.remove("bg-image-mode", "bg-video-mode");

  if (validMode === "image") {
    document.body.classList.add("bg-image-mode");
  }

  if (validMode === "video") {
    document.body.classList.add("bg-video-mode");
    // Try to play video if browser blocks autoplay it will quietly fail.
    if (elements.backgroundVideo) {
      elements.backgroundVideo.play().catch(() => {});
    }
  } else if (elements.backgroundVideo) {
    elements.backgroundVideo.pause();
  }

  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === validMode);
  });

  localStorage.setItem(BACKGROUND_STORAGE_KEY, validMode);
  updateSoundButtonLabel();
}

function updateSoundButtonLabel() {
  if (!elements.soundToggleButton || !elements.backgroundVideo) {
    return;
  }

  const isVideoMode = document.body.classList.contains("bg-video-mode");
  const isMuted = elements.backgroundVideo.muted;

  // Keep button enabled in all modes so user can click once to switch to video + play with sound.
  elements.soundToggleButton.classList.toggle("sound-on", isVideoMode && !isMuted);
  elements.soundToggleButton.classList.toggle("visible", isVideoMode);
  elements.soundToggleButton.setAttribute(
    "aria-label",
    isMuted ? "Unmute video background" : "Mute video background"
  );
  elements.soundToggleButton.setAttribute(
    "title",
    isMuted ? "Unmute video background" : "Mute video background"
  );
}

// Best-effort check: some browsers expose audio metadata differently.
function videoHasAudioTrack(videoElement) {
  if (!videoElement) return false;

  if (videoElement.mozHasAudio !== undefined) {
    return videoElement.mozHasAudio;
  }

  if (videoElement.webkitAudioDecodedByteCount !== undefined) {
    return videoElement.webkitAudioDecodedByteCount > 0;
  }

  if (videoElement.audioTracks && videoElement.audioTracks.length !== undefined) {
    return videoElement.audioTracks.length > 0;
  }

  // If browser does not expose metadata, assume it may have audio.
  return true;
}

async function toggleVideoSound() {
  if (!elements.backgroundVideo) {
    return;
  }

  // Browsers require direct user interaction before enabling sound.
  if (!document.body.classList.contains("bg-video-mode")) {
    activateBackgroundMode("video");
  }

  const shouldUnmute = elements.backgroundVideo.muted;
  elements.backgroundVideo.muted = !shouldUnmute;
  elements.backgroundVideo.volume = 1;

  try {
    await elements.backgroundVideo.play();
    elements.errorMessage.textContent = "";
    if (!elements.backgroundVideo.muted && !videoHasAudioTrack(elements.backgroundVideo)) {
      elements.errorMessage.textContent =
        "Video berjalan, tapi file bg.mp4 kemungkinan tidak punya audio track.";
    }
  } catch (error) {
    // If playback fails, return to muted state for stability.
    elements.backgroundVideo.muted = true;
    elements.errorMessage.textContent =
      "Browser memblokir audio. Coba klik halaman dulu lalu tekan Unmute lagi.";
  }

  updateSoundButtonLabel();
}

function toggleLoadingState(isLoading) {
  elements.fetchButton.disabled = isLoading;
  elements.fetchButton.innerHTML = isLoading
    ? '<span class="loading-dot"></span>Loading...'
    : DEFAULT_BUTTON_TEXT;
}

function resetView() {
  elements.errorMessage.textContent = "";
  elements.playerCard.classList.remove("show");
  elements.clanCard.classList.remove("show");
  elements.clanBadge.src = DEFAULT_CLAN_BADGE;
  elements.membersStatus.textContent = "No member data loaded.";
  elements.membersTableBody.innerHTML =
    '<tr><td colspan="4" class="members-empty">No members yet.</td></tr>';
}

function renderPlayer(playerData) {
  setText(elements.playerName, playerData.name);
  setText(elements.townHallLevel, playerData.townHallLevel);
  setText(elements.trophies, playerData.trophies);
  setText(elements.bestTrophies, playerData.bestTrophies);
  setText(elements.warStars, playerData.warStars);
  setText(elements.expLevel, playerData.expLevel);
  setText(elements.clanName, playerData.clanName, "No clan");

  elements.playerCard.classList.add("show");
}

function renderClan(clanData) {
  setText(elements.clanDataName, clanData.name);
  setText(elements.clanDataTag, clanData.tag);
  setText(elements.clanLevel, clanData.clanLevel);
  setText(elements.clanMembers, clanData.members);
  setText(elements.warLeague, clanData.warLeague);
  setText(elements.clanLocation, clanData.location);

  elements.clanBadge.src = clanData.badgeUrl || DEFAULT_CLAN_BADGE;
  elements.clanCard.classList.add("show");
}

function renderClanMembers(memberList) {
  if (!memberList.length) {
    elements.membersStatus.textContent = "This clan has no members.";
    elements.membersTableBody.innerHTML =
      '<tr><td colspan="4" class="members-empty">No members found.</td></tr>';
    return;
  }

  elements.membersStatus.textContent = `Showing ${memberList.length} clan members.`;

  const rows = memberList
    .map((member, index) => {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${member.name || "-"}</td>
          <td>${formatRoleLabel(member.role)}</td>
          <td>${member.trophies ?? "-"}</td>
        </tr>
      `;
    })
    .join("");

  elements.membersTableBody.innerHTML = rows;
}

// Convert API role value into a more user-friendly label
function formatRoleLabel(role) {
  const roleMap = {
    member: "Member",
    admin: "Elder",
    coLeader: "Co-Leader",
    leader: "Leader",
  };

  return roleMap[role] || "-";
}

async function requestJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  return { response, data };
}

// Load clan profile if the player belongs to a clan
async function fetchClanData(clanTag) {
  try {
    const { response, data } = await requestJson(`/clan/${encodeURIComponent(clanTag)}`);

    if (!response.ok) {
      elements.clanCard.classList.remove("show");
      return;
    }

    renderClan(data);
  } catch (error) {
    elements.clanCard.classList.remove("show");
    return;
  }

  // After clan profile is loaded, fetch member list from backend
  // This is separated so clan card still appears even if member list fails.
  try {
    const membersResult = await requestJson(`/clan/${encodeURIComponent(clanTag)}/members`);
    if (membersResult.response.ok) {
      renderClanMembers(membersResult.data.members || []);
    } else {
      elements.membersStatus.textContent = "Failed to load clan members.";
    }
  } catch (error) {
    elements.membersStatus.textContent = "Failed to load clan members.";
  }
}

// Main action for player lookup
async function fetchPlayerData() {
  const rawTag = elements.tagInput.value.trim();

  resetView();

  if (!rawTag) {
    elements.errorMessage.textContent = "Please enter a player tag.";
    return;
  }

  toggleLoadingState(true);

  try {
    const { response, data } = await requestJson(`/player/${encodeURIComponent(rawTag)}`);

    if (!response.ok) {
      elements.errorMessage.textContent = data.error || "Something went wrong.";
      return;
    }

    renderPlayer(data);

    if (data.clanTag) {
      await fetchClanData(data.clanTag);
    }
  } catch (error) {
    elements.errorMessage.textContent = "Network error. Please try again.";
  } finally {
    toggleLoadingState(false);
  }
}

// Button click action
elements.fetchButton.addEventListener("click", fetchPlayerData);

// Enter key action on input field
elements.tagInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    fetchPlayerData();
  }
});

// Background switcher setup
elements.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateBackgroundMode(button.dataset.mode);
  });
});

if (elements.soundToggleButton) {
  elements.soundToggleButton.addEventListener("click", toggleVideoSound);
}

// If image/video file does not exist, automatically fallback to gradient.
if (elements.backgroundImage) {
  elements.backgroundImage.addEventListener("error", () => {
    if (document.body.classList.contains("bg-image-mode")) {
      activateBackgroundMode("gradient");
    }
  });
}

if (elements.backgroundVideo) {
  elements.backgroundVideo.addEventListener("error", () => {
    if (document.body.classList.contains("bg-video-mode")) {
      activateBackgroundMode("gradient");
    }
  });
}

const savedMode = localStorage.getItem(BACKGROUND_STORAGE_KEY) || "gradient";
activateBackgroundMode(savedMode);
