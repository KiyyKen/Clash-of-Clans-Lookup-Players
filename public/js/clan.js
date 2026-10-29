import { elements, setText } from "./dom.js";
import { copyToClipboard, shareLink, syncUrl } from "./clipboard.js";
import { getTownHallImg } from "./assets.js";
import { formatRole, formatClanType, formatWarFrequency, renderLabels } from "./formatters.js";
import { saveRecent } from "./history.js";
import { requestApi } from "./api.js";

let currentClanMembers = [];
let memberClickCallback = null;

export function renderClan(c, onRecentSelect) {
  setText(elements.clanDataName, c.name);
  setText(elements.clanDataTag, c.tag);

  elements.copyClanTagBtn.onclick = () => copyToClipboard(c.tag, "Clan Tag");
  elements.shareClanBtn.onclick = () => shareLink("clan", c.tag, c.name);

  elements.clanBadge.src = c.badgeUrl || "/assets/clan-temp.svg";
  setText(elements.clanLevelBadge, `Level ${c.clanLevel}`);
  setText(elements.clanTypeBadge, formatClanType(c.type));
  setText(elements.clanWarLeagueBadge, c.warLeague ? `🏆 ${c.warLeague}` : "War League");
  setText(elements.clanLocationBadge, c.location ? `📍 ${c.location}` : "📍 International");

  if (c.description) {
    elements.clanDescription.textContent = `“${c.description}”`;
    elements.clanDescription.style.display = "block";
  } else {
    elements.clanDescription.style.display = "none";
  }

  renderLabels(elements.clanLabelsContainer, c.labels);

  // Metrics
  setText(elements.clanPoints, `${c.clanPoints?.toLocaleString() || 0}`);
  setText(elements.clanBuilderPoints, `Builder Base: ${c.clanBuilderBasePoints?.toLocaleString() || 0}`);
  setText(elements.clanMembers, `${c.members} / 50`);

  const warLogStr = c.isWarLogPublic
    ? `${c.warWins || 0}W - ${c.warLosses || 0}L - ${c.warTies || 0}T`
    : `${c.warWins || 0} Menang (Log Privat)`;
  setText(elements.warRecord, warLogStr);
  setText(elements.warWinStreak, `Streak: ${c.warWinStreak || 0} Win`);

  setText(elements.capitalHallLevel, c.capitalHallLevel ? `CH ${c.capitalHallLevel}` : "-");
  setText(elements.capitalPoints, `Capital Points: ${c.clanCapitalPoints?.toLocaleString() || 0}`);

  const reqTh = c.requiredTownhallLevel ? `TH ${c.requiredTownhallLevel}` : "-";
  setText(elements.requiredEntry, `${c.requiredTrophies?.toLocaleString() || 0} 🏆 / ${reqTh}`);
  setText(elements.warFrequency, formatWarFrequency(c.warFrequency));

  elements.clanCard.classList.add("show");
  saveRecent("clan", c.tag, c.name, onRecentSelect);
  syncUrl("clan", c.tag);
}

export function getFilteredAndSortedRoster() {
  const query = (elements.memberSearchInput?.value || "").toLowerCase().trim();
  const sortMode = elements.memberSortSelect?.value || "trophies_desc";

  let list = [...currentClanMembers];

  if (query) {
    list = list.filter((m) =>
      (m.name || "").toLowerCase().includes(query) ||
      (m.tag || "").toLowerCase().includes(query)
    );
  }

  list.sort((a, b) => {
    if (sortMode === "trophies_desc") return (b.trophies || 0) - (a.trophies || 0);
    if (sortMode === "th_desc") return (b.townHallLevel || 0) - (a.townHallLevel || 0);
    if (sortMode === "donations_desc") return (b.donations || 0) - (a.donations || 0);
    if (sortMode === "name_asc") return (a.name || "").localeCompare(b.name || "");
    return 0;
  });

  return list;
}

export function updateRosterTable(onMemberClick) {
  if (onMemberClick) memberClickCallback = onMemberClick;
  const list = getFilteredAndSortedRoster();

  if (!list.length) {
    elements.membersStatus.textContent = currentClanMembers.length === 0
      ? "Clan ini tidak memiliki data anggota."
      : "Tidak ada anggota yang cocok dengan filter.";
    elements.membersTableBody.innerHTML =
      '<tr><td colspan="6" class="table-empty">Tidak ada data anggota ditemukan.</td></tr>';
    return;
  }

  elements.membersStatus.textContent = `Menampilkan ${list.length} dari ${currentClanMembers.length} anggota clan. Klik baris untuk inspect.`;

  const rows = list
    .map((m, idx) => {
      const icon = m.leagueIcon
        ? `<img class="member-league-img" src="${m.leagueIcon}" alt="${m.leagueName || 'Rank'}" title="${m.leagueName || 'Rank'}" loading="lazy" onerror="this.onerror=null; this.src='/assets/trophy-temp.svg';" />`
        : `<img class="member-league-img" src="/assets/trophy-temp.svg" alt="Rank" />`;
      const thImg = m.townHallLevel
        ? `<img class="table-th-icon" src="${getTownHallImg(m.townHallLevel)}" alt="TH ${m.townHallLevel}" loading="lazy" />`
        : "";
      return `
        <tr class="member-row-clickable" data-tag="${m.tag}">
          <td style="font-weight:700;color:var(--text-tertiary);">${m.clanRank || idx + 1}</td>
          <td>
            <div class="member-name-flex">
              ${icon}
              <span>${m.name}</span>
            </div>
          </td>
          <td><span class="pill-role">${formatRole(m.role)}</span></td>
          <td>
            <div class="table-th-flex">
              ${thImg}
              <span class="pill-th">TH ${m.townHallLevel || "-"}</span>
            </div>
          </td>
          <td style="font-weight:700;font-family:var(--font-mono);">${m.trophies?.toLocaleString() || 0}</td>
          <td style="font-family:var(--font-mono);">${m.donations?.toLocaleString() || 0}</td>
        </tr>
      `;
    })
    .join("");

  elements.membersTableBody.innerHTML = rows;

  elements.membersTableBody.querySelectorAll(".member-row-clickable").forEach((row) => {
    row.addEventListener("click", () => {
      const tag = row.dataset.tag;
      if (tag && memberClickCallback) {
        memberClickCallback(tag);
      }
    });
  });
}

export function initRosterFilters(onMemberClick) {
  if (onMemberClick) memberClickCallback = onMemberClick;
  if (elements.memberSearchInput) {
    elements.memberSearchInput.addEventListener("input", () => updateRosterTable());
  }
  if (elements.memberSortSelect) {
    elements.memberSortSelect.addEventListener("change", () => updateRosterTable());
  }
}

export function renderClanMembers(members = [], onMemberClick) {
  currentClanMembers = members;
  if (onMemberClick) memberClickCallback = onMemberClick;
  setText(elements.membersCountSummary, `${members.length} Anggota`);
  if (elements.memberSearchInput) elements.memberSearchInput.value = "";
  updateRosterTable();
}

export async function fetchClanMembers(clanTag, onMemberClick) {
  try {
    elements.membersStatus.textContent = "Memuat data anggota...";
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(clanTag)}/members`);
    if (response.ok && data.members) {
      renderClanMembers(data.members, onMemberClick);
    } else {
      elements.membersStatus.textContent = "Gagal memuat anggota.";
    }
  } catch (err) {
    elements.membersStatus.textContent = "Gagal memuat anggota.";
  }
}

export async function fetchClanDataSilently(clanTag, onMemberClick, onRecentSelect) {
  try {
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(clanTag)}`);
    if (response.ok) {
      renderClan(data, onRecentSelect);
      fetchClanMembers(clanTag, onMemberClick);
    }
  } catch (err) {}
}

export async function searchClan(tag, { onMemberClick, toggleLoading, showError, resetViews, onRecentSelect }) {
  resetViews();
  toggleLoading(true);

  try {
    const { response, data } = await requestApi(`/clan/${encodeURIComponent(tag)}`);
    if (!response.ok) {
      showError(data.error || "Gagal mengambil data clan.");
      return;
    }
    renderClan(data, onRecentSelect);
    fetchClanMembers(tag, onMemberClick);
  } catch (err) {
    showError("Terjadi kendala jaringan saat menghubungi server.");
  } finally {
    toggleLoading(false);
  }
}

