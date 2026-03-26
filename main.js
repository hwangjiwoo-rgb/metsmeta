const STORAGE_KEY = "metsmeta_board";

// Spline에서 Notice Board 클릭 시 열 URL (배포 주소 기준):
//   Vercel 등은 리다이렉트 시 #board 가 사라질 수 있어 ?board=1 을 권장합니다.
//   예: https://metsmeta.vercel.app/?board=1
const BOARD_HASH = "#board";
const BOARD_SESSION_KEY = "metsmeta_open_board_v1";
const SPLINE_EMBED_URL = "https://my.spline.design/metsmeta-vAALQ7iJtAMd6hdI6sOMGV0t/";

function shouldOpenBoardFromUrl() {
  if (location.hash.toLowerCase() === BOARD_HASH) return true;
  const params = new URLSearchParams(location.search);
  if (params.get("board") === "1" || params.get("board") === "true") return true;
  if (params.get("view") === "board") return true;
  return false;
}

(function splineIframeBreakoutToTop() {
  if (!shouldOpenBoardFromUrl()) return;
  if (window.parent === window) return;
  try {
    // 최상위로 올라간 뒤 해시가 날아가도(리다이렉트) 게시판을 열 수 있게 플래그 저장
    sessionStorage.setItem(BOARD_SESSION_KEY, "1");
    window.top.location.replace(location.href);
  } catch (e) {
    // 다른 도메인 iframe이면 접근 불가 — Spline에 넣는 URL은 반드시 이 페이지와 같은 도메인이어야 합니다.
  }
})();

const defaultNotices = [
  { id: 1, title: "회의실 예약 방법", content: "회의실 예약은 메타버스에서 가능합니다.", date: "2026.03.09", pinned: true },
  { id: 2, title: "법인카드 비용 신청 방법", content: "법인카드는 재무팀 승인 후 발급됩니다.", date: "2026.03.09", pinned: true },
  { id: 3, title: "사내 사이트 접근 권한 신청 방법", content: "IT팀에 요청하세요.", date: "2026.03.09", pinned: true },
  { id: 4, title: "추가 고정 공지 (더보기 테스트)", content: "고정 4번째 항목입니다.", date: "2026.03.08", pinned: true },
  { id: 5, title: "회의실 예약 방법", content: "일반 공지 내용입니다.", date: "2026.03.09", pinned: false },
  { id: 6, title: "회의실 예약 방법", content: "일반 공지 내용입니다.", date: "2026.03.09", pinned: false }
];

const defaultFreePosts = [
  { id: 101, title: "점심 메뉴 추천", content: "오늘 점심 뭐 드실래요?", date: "2026.03.09" },
  { id: 102, title: "퇴근 후 모임", content: "금요일 저녁 모임 참여자 구해요.", date: "2026.03.08" }
];

let notices = [];
let freePosts = [];
let nextNoticeId = 10;
let nextFreeId = 200;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.notices)) notices = data.notices;
      else notices = [...defaultNotices];
      if (Array.isArray(data.freePosts)) freePosts = data.freePosts;
      else freePosts = [...defaultFreePosts];
      if (typeof data.nextNoticeId === "number") nextNoticeId = data.nextNoticeId;
      if (typeof data.nextFreeId === "number") nextFreeId = data.nextFreeId;
      return;
    }
  } catch (e) {}
  notices = [...defaultNotices];
  freePosts = [...defaultFreePosts];
}

function saveToStorage() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ notices, freePosts, nextNoticeId, nextFreeId })
    );
  } catch (e) {}
}

loadFromStorage();

const PINNED_VISIBLE = 3;
let pinnedExpanded = false;
let currentTab = "notice";

// 등록/수정: writeType = 'notice' | 'free', editTarget = { item, type } or null
let writeType = "notice";
let editTarget = null;

const pinnedArea = document.getElementById("pinnedArea");
const morePinnedWrap = document.getElementById("morePinnedWrap");
const morePinnedBtn = document.getElementById("morePinned");
const noticeList = document.getElementById("noticeList");
const freeList = document.getElementById("freeList");
const tabNotice = document.getElementById("tabNotice");
const tabFree = document.getElementById("tabFree");
const openWrite = document.getElementById("openWrite");
const closeWriteBtn = document.getElementById("closeWriteBtn");
const headerBackBtn = document.getElementById("headerBackBtn");
const splineBackLink = document.getElementById("splineBackLink");
const boardTitleText = document.getElementById("boardTitleText");
const titleStar = document.querySelector(".title-star");
const titleInfo = document.querySelector(".title-info");
const listView = document.getElementById("listView");
const writeSection = document.getElementById("writeSection");
const writeTabNotice = document.getElementById("writeTabNotice");
const writeTabFree = document.getElementById("writeTabFree");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const savePost = document.getElementById("savePost");
const cancelEdit = document.getElementById("cancelEdit");
const detailPanel = document.getElementById("detailPanel");
const detailTitle = document.getElementById("detailTitle");
const detailContent = document.getElementById("detailContent");
const detailDate = document.getElementById("detailDate");
const editPostBtn = document.getElementById("editPostBtn");
const deletePostBtn = document.getElementById("deletePostBtn");
const boardOverlay = document.getElementById("boardOverlay");
const boardOverlayBackdrop = document.getElementById("boardOverlayBackdrop");

function togglePin(notice, e) {
  if (e) e.stopPropagation();
  notice.pinned = !notice.pinned;
  render();
  saveToStorage();
}

function getPinned() {
  return notices.filter((n) => n.pinned);
}

function renderPinned() {
  const pinned = getPinned();
  pinnedArea.innerHTML = "";
  const section = document.querySelector(".pinned-section");
  if (pinned.length === 0) {
    section.classList.add("hidden");
    morePinnedWrap.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");

  const limit = pinnedExpanded ? pinned.length : PINNED_VISIBLE;
  const toShow = pinned.slice(0, limit);

  toShow.forEach((n) => {
    const div = document.createElement("div");
    div.className = "pinned-item";
    const newTag = isNewPost(n.date) ? '<span class="new-tag">New</span>' : "";
    div.innerHTML = `
      <button type="button" class="pin-btn pinned" aria-label="고정 해제" title="고정 해제">📌</button>
      <span class="pinned-title">${n.title}${newTag}</span>
      <span class="pinned-date">${n.date}</span>
    `;
    const pinBtn = div.querySelector(".pin-btn");
    pinBtn.addEventListener("click", (e) => togglePin(n, e));
    div.onclick = (e) => { if (!e.target.closest(".pin-btn")) openDetail(n, "notice"); };
    pinnedArea.appendChild(div);
  });

  if (pinned.length > PINNED_VISIBLE) {
    morePinnedWrap.classList.remove("hidden");
    morePinnedBtn.innerHTML = pinnedExpanded ? "<span class=\"more-caret\">▲</span> 접기" : "<span class=\"more-caret\">▼</span> 더보기";
  } else {
    morePinnedWrap.classList.add("hidden");
  }
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split(".").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const NEW_DAYS = 2;
function isNewPost(dateStr) {
  const postTime = parseDate(dateStr);
  const now = Date.now();
  const diffDays = (now - postTime) / (1000 * 60 * 60 * 24);
  return diffDays < NEW_DAYS;
}

function renderNoticeList() {
  const sorted = [...notices].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  noticeList.innerHTML = "";
  sorted.forEach((n) => {
    const div = document.createElement("div");
    div.className = "list-item list-item-notice";
    const pinClass = n.pinned ? "pinned" : "unpinned";
    const pinLabel = n.pinned ? "고정 해제" : "상단 고정";
    const newTag = isNewPost(n.date) ? '<span class="new-tag">New</span>' : "";
    div.innerHTML = `
      <button type="button" class="pin-btn ${pinClass}" aria-label="${pinLabel}" title="${pinLabel}">📌</button>
      <span class="item-title">${n.title}${newTag}</span>
      <span class="item-date">${n.date}</span>
    `;
    const pinBtn = div.querySelector(".pin-btn");
    pinBtn.addEventListener("click", (e) => togglePin(n, e));
    div.onclick = (e) => { if (!e.target.closest(".pin-btn")) openDetail(n, "notice"); };
    noticeList.appendChild(div);
  });
}

function renderFreeList() {
  freeList.innerHTML = "";
  freePosts.forEach((p) => {
    const div = document.createElement("div");
    div.className = "list-item";
    const newTag = isNewPost(p.date) ? '<span class="new-tag">New</span>' : "";
    div.innerHTML = `<span class="item-title">${p.title}${newTag}</span><span class="item-date">${p.date}</span>`;
    div.onclick = () => openDetail(p, "free");
    freeList.appendChild(div);
  });
}

function openDetail(item, type) {
  editTarget = { item, type };
  detailTitle.textContent = item.title;
  detailContent.textContent = item.content;
  detailDate.textContent = item.date;
  detailPanel.classList.remove("hidden");
  editPostBtn.style.display = "inline-block";
  listView.classList.add("hidden");
  document.querySelector(".pinned-section").classList.add("hidden");
  headerBackBtn.classList.remove("hidden");
  openWrite.classList.add("hidden");
}

function closeDetailPanel() {
  detailPanel.classList.add("hidden");
  listView.classList.remove("hidden");
  headerBackBtn.classList.add("hidden");
  openWrite.classList.remove("hidden");
  const pinnedSection = document.querySelector(".pinned-section");
  if (getPinned().length > 0) pinnedSection.classList.remove("hidden");
  editTarget = null;
}

function renderTabs() {
  noticeList.classList.toggle("hidden", currentTab !== "notice");
  freeList.classList.toggle("hidden", currentTab !== "free");
  tabNotice.classList.toggle("active", currentTab === "notice");
  tabFree.classList.toggle("active", currentTab === "free");
}

function render() {
  renderPinned();
  renderNoticeList();
  renderFreeList();
  renderTabs();
}

morePinnedBtn.addEventListener("click", () => {
  pinnedExpanded = !pinnedExpanded;
  renderPinned();
});

tabNotice.addEventListener("click", () => {
  currentTab = "notice";
  renderTabs();
});

tabFree.addEventListener("click", () => {
  currentTab = "free";
  renderTabs();
});

// 등록하기 섹션 표시 (새 글)
function showWriteSection() {
  editTarget = null;
  closeDetailPanel();
  listView.classList.add("hidden");
  document.querySelector(".pinned-section").classList.add("hidden");
  writeSection.classList.remove("hidden");
  openWrite.classList.add("hidden");
  closeWriteBtn.classList.remove("hidden");
  boardTitleText.textContent = "등록하기";
  if (titleStar) titleStar.classList.add("hidden");
  if (titleInfo) titleInfo.classList.add("hidden");
  titleInput.value = "";
  contentInput.value = "";
  writeType = "notice";
  writeTabNotice.classList.add("active");
  writeTabFree.classList.remove("active");
  savePost.textContent = "등록하기";
  cancelEdit.classList.add("hidden");
}

// 수정하기용으로 등록 섹션 표시 (closeDetailPanel은 호출한 쪽에서 이미 함)
function showWriteSectionForEdit(target) {
  editTarget = target;
  listView.classList.add("hidden");
  document.querySelector(".pinned-section").classList.add("hidden");
  writeSection.classList.remove("hidden");
  openWrite.classList.add("hidden");
  closeWriteBtn.classList.remove("hidden");
  boardTitleText.textContent = "등록하기";
  if (titleStar) titleStar.classList.add("hidden");
  if (titleInfo) titleInfo.classList.add("hidden");
  titleInput.value = target.item.title;
  contentInput.value = target.item.content;
  writeType = target.type;
  writeTabNotice.classList.toggle("active", target.type === "notice");
  writeTabFree.classList.toggle("active", target.type === "free");
  savePost.textContent = "수정 완료";
  cancelEdit.classList.remove("hidden");
}

function hideWriteSection() {
  writeSection.classList.add("hidden");
  listView.classList.remove("hidden");
  openWrite.classList.remove("hidden");
  closeWriteBtn.classList.add("hidden");
  boardTitleText.textContent = "공지사항";
  if (titleStar) titleStar.classList.remove("hidden");
  if (titleInfo) titleInfo.classList.remove("hidden");
  const pinnedSection = document.querySelector(".pinned-section");
  if (getPinned().length > 0) pinnedSection.classList.remove("hidden");
  editTarget = null;
  titleInput.value = "";
  contentInput.value = "";
  savePost.textContent = "등록하기";
  cancelEdit.classList.add("hidden");
}

openWrite.addEventListener("click", showWriteSection);
closeWriteBtn.addEventListener("click", hideWriteSection);

writeTabNotice.addEventListener("click", () => {
  writeType = "notice";
  writeTabNotice.classList.add("active");
  writeTabFree.classList.remove("active");
});

writeTabFree.addEventListener("click", () => {
  writeType = "free";
  writeTabFree.classList.add("active");
  writeTabNotice.classList.remove("active");
});

cancelEdit.addEventListener("click", () => {
  hideWriteSection();
});

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

savePost.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title) {
    alert("제목을 입력하세요.");
    return;
  }
  if (editTarget) {
    const { item, type } = editTarget;
    const newContent = content || "(내용 없음)";
    const newDate = getTodayStr();
    if (type === "notice") {
      const n = notices.find((x) => x.id === item.id);
      if (n) {
        n.title = title;
        n.content = newContent;
        n.date = newDate;
      }
    } else {
      const p = freePosts.find((x) => x.id === item.id);
      if (p) {
        p.title = title;
        p.content = newContent;
        p.date = newDate;
      }
    }
    hideWriteSection();
    closeDetailPanel();
  } else {
    if (writeType === "notice") {
      notices.unshift({
        id: nextNoticeId++,
        title,
        content: content || "(내용 없음)",
        date: getTodayStr(),
        pinned: false
      });
    } else {
      freePosts.unshift({
        id: nextFreeId++,
        title,
        content: content || "(내용 없음)",
        date: getTodayStr()
      });
    }
    titleInput.value = "";
    contentInput.value = "";
    hideWriteSection();
  }
  render();
  saveToStorage();
});

headerBackBtn.addEventListener("click", closeDetailPanel);

editPostBtn.addEventListener("click", () => {
  const toEdit = editTarget;
  closeDetailPanel();
  if (toEdit) showWriteSectionForEdit(toEdit);
});

deletePostBtn.addEventListener("click", () => {
  if (!editTarget) return;
  if (!confirm("정말 삭제하시겠습니까?")) return;
  const { item, type } = editTarget;
  if (type === "notice") {
    const idx = notices.findIndex((n) => n.id === item.id);
    if (idx !== -1) notices.splice(idx, 1);
  } else {
    const idx = freePosts.findIndex((p) => p.id === item.id);
    if (idx !== -1) freePosts.splice(idx, 1);
  }
  closeDetailPanel();
  render();
  saveToStorage();
});

function boardOverlayOpen() {
  if (!boardOverlay) return;
  boardOverlay.classList.remove("hidden");
  boardOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
  if (splineBackLink) splineBackLink.style.display = "";
}

function boardOverlayClose() {
  if (!boardOverlay) return;
  boardOverlay.classList.add("hidden");
  boardOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  closeDetailPanel();
  hideWriteSection();
  if (splineBackLink) splineBackLink.style.display = "none";
}

function consumeBoardSessionFlag() {
  try {
    if (sessionStorage.getItem(BOARD_SESSION_KEY) !== "1") return;
    sessionStorage.removeItem(BOARD_SESSION_KEY);
    if (!shouldOpenBoardFromUrl()) {
      const base = `${location.pathname}${location.search}`;
      history.replaceState(null, "", `${base}${BOARD_HASH}`);
    }
  } catch (e) {}
}

function syncBoardOverlayFromUrl() {
  if (!boardOverlay) return;
  if (shouldOpenBoardFromUrl()) boardOverlayOpen();
  else boardOverlayClose();
}

function getUrlWithoutBoard() {
  const path = location.pathname;
  const params = new URLSearchParams(location.search);
  params.delete("board");
  params.delete("view");
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function closeBoardToSpline() {
  history.replaceState(null, "", getUrlWithoutBoard());
  boardOverlayClose();
}

window.addEventListener("hashchange", syncBoardOverlayFromUrl);
window.addEventListener("popstate", syncBoardOverlayFromUrl);

if (boardOverlayBackdrop) {
  boardOverlayBackdrop.addEventListener("click", closeBoardToSpline);
}

if (splineBackLink) {
  splineBackLink.href = "#";
  splineBackLink.addEventListener("click", (e) => {
    e.preventDefault();
    closeBoardToSpline();
  });
}

render();
consumeBoardSessionFlag();
syncBoardOverlayFromUrl();

function resetSplineIframeToEmbed() {
  const el = document.getElementById("splineIframe");
  if (!el) return;
  try {
    el.src = SPLINE_EMBED_URL;
  } catch (err) {}
}

window.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  if (!e.data || e.data.type !== "metsmeta-open-board") return;
  try {
    if (e.data.href && typeof e.data.href === "string") {
      const u = new URL(e.data.href, location.href);
      if (u.origin === location.origin) {
        history.replaceState(null, "", u.pathname + u.search + u.hash);
      }
    } else {
      const params = new URLSearchParams(location.search);
      params.set("board", "1");
      history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
    }
  } catch (err) {
    const params = new URLSearchParams(location.search);
    params.set("board", "1");
    history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
  }
  boardOverlayOpen();
  if (splineBackLink) splineBackLink.style.display = "";
  resetSplineIframeToEmbed();
});

(function notifyParentIfBoardOpenInIframe() {
  if (window.parent === window) return;
  if (!shouldOpenBoardFromUrl()) return;
  try {
    window.parent.postMessage({ type: "metsmeta-open-board", href: location.href }, location.origin);
  } catch (e) {}
})();
