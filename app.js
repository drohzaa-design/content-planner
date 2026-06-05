const channels = ["Facebook", "Instagram", "TikTok", "Blog", "Email", "YouTube"];
const formats = ["Post", "Story", "Reel", "Carousel", "Video", "Article", "Email"];

const statuses = [
  { id: "idea", label: "ไอเดีย" },
  { id: "draft", label: "ร่าง" },
  { id: "review", label: "รอตรวจ" },
  { id: "scheduled", label: "ตั้งเวลาแล้ว" },
  { id: "published", label: "เผยแพร่แล้ว" },
];

const thaiWeekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const viewIds = ["calendar", "board", "list"];
const legacyItemsKey = "simple-content-planner-items";
const categoriesStorageKey = "simple-content-planner-categories";
const activeCategoryStorageKey = "simple-content-planner-active-category";
const defaultCategories = [
  { id: "real-estate", name: "อสังหา", icon: "building-2" },
  { id: "solar", name: "โซลาร์เซลล์", icon: "sun" },
  { id: "restaurant", name: "ร้านอาหาร", icon: "utensils" },
];
let toastTimer;
let storageError = false;

const state = {
  view: "calendar",
  monthDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  search: "",
  channel: "all",
  status: "all",
  editingId: null,
  activeCategoryId: null,
};

const elements = {
  categoryScreen: document.querySelector("#categoryScreen"),
  appShell: document.querySelector("#appShell"),
  categoryGrid: document.querySelector("#categoryGrid"),
  categoryForm: document.querySelector("#categoryForm"),
  categoryNameInput: document.querySelector("#categoryNameInput"),
  activeCategoryName: document.querySelector("#activeCategoryName"),
  activeCategoryEyebrow: document.querySelector("#activeCategoryEyebrow"),
  changeCategoryButton: document.querySelector("#changeCategoryButton"),
  topChangeCategoryButton: document.querySelector("#topChangeCategoryButton"),
  pageTitle: document.querySelector("#pageTitle"),
  totalMetric: document.querySelector("#totalMetric"),
  reviewMetric: document.querySelector("#reviewMetric"),
  scheduledMetric: document.querySelector("#scheduledMetric"),
  publishedMetric: document.querySelector("#publishedMetric"),
  channelStack: document.querySelector("#channelStack"),
  searchInput: document.querySelector("#searchInput"),
  channelFilter: document.querySelector("#channelFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  panelEyebrow: document.querySelector("#panelEyebrow"),
  panelTitle: document.querySelector("#panelTitle"),
  monthSwitcher: document.querySelector("#monthSwitcher"),
  monthLabel: document.querySelector("#monthLabel"),
  previousMonth: document.querySelector("#previousMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  calendarView: document.querySelector("#calendarView"),
  boardView: document.querySelector("#boardView"),
  listView: document.querySelector("#listView"),
  form: document.querySelector("#contentForm"),
  formTitle: document.querySelector("#formTitle"),
  submitButton: document.querySelector("#submitButton span"),
  resetFormButton: document.querySelector("#resetFormButton"),
  focusFormButton: document.querySelector("#focusFormButton"),
  toast: document.querySelector("#toast"),
  titleInput: document.querySelector("#titleInput"),
  dateInput: document.querySelector("#dateInput"),
  timeInput: document.querySelector("#timeInput"),
  channelInput: document.querySelector("#channelInput"),
  formatInput: document.querySelector("#formatInput"),
  statusInput: document.querySelector("#statusInput"),
  urlInput: document.querySelector("#urlInput"),
  urlPreview: document.querySelector("#urlPreview"),
  notesInput: document.querySelector("#notesInput"),
};

let categories = loadCategories();
let items = [];

window.switchView = switchView;
window.selectCategory = selectCategory;
window.deleteCategory = deleteCategory;
window.showCategoryScreen = showCategoryScreen;

function offsetDate(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

function seedItems() {
  return [
    {
      id: createId(),
      title: "Reel เปิดตัวคอลเลกชันกลางปี",
      date: offsetDate(1),
      time: "10:00",
      channel: "Instagram",
      format: "Reel",
      status: "scheduled",
      urls: ["https://www.instagram.com/"],
      notes: "ใช้ hook 3 วินาทีแรกและปิดท้ายด้วย CTA ไปหน้าโปรโมชัน",
    },
    {
      id: createId(),
      title: "บทความสรุป Pain Point ของลูกค้า",
      date: offsetDate(3),
      time: "09:30",
      channel: "Blog",
      format: "Article",
      status: "draft",
      urls: [],
      notes: "อ้างอิงคำถามจากฝ่ายขายและเลือก 5 ประเด็นหลัก",
    },
    {
      id: createId(),
      title: "โพสต์ Checklist ก่อนซื้อ",
      date: offsetDate(5),
      time: "13:00",
      channel: "Facebook",
      format: "Post",
      status: "review",
      urls: [],
      notes: "ตรวจภาพปกและ bullet ให้จบภายในวันเดียวกัน",
    },
    {
      id: createId(),
      title: "Email ส่งข้อเสนอสำหรับลูกค้าเก่า",
      date: offsetDate(8),
      time: "08:45",
      channel: "Email",
      format: "Email",
      status: "idea",
      urls: [],
      notes: "แบ่ง segment ตามยอดซื้อ 6 เดือนล่าสุด",
    },
    {
      id: createId(),
      title: "Short video ตอบคำถามยอดนิยม",
      date: offsetDate(12),
      time: "18:00",
      channel: "TikTok",
      format: "Video",
      status: "published",
      urls: ["https://www.tiktok.com/"],
      notes: "ตัดเวอร์ชันสั้นสำหรับ Reels ด้วย",
    },
  ];
}

function loadCategories() {
  try {
    const saved = window.localStorage?.getItem(categoriesStorageKey);
    const parsed = saved ? JSON.parse(saved) : defaultCategories;
    if (!Array.isArray(parsed)) return [...defaultCategories];
    const normalized = parsed.map(normalizeCategory).filter(Boolean);
    return normalized.length ? normalized : [...defaultCategories];
  } catch {
    storageError = true;
    return [...defaultCategories];
  }
}

function normalizeCategory(category) {
  if (!category || typeof category !== "object") return null;
  const name = String(category.name || "").trim();
  if (!name) return null;
  return {
    id: String(category.id || createCategoryId(name)),
    name,
    icon: String(category.icon || "folder"),
  };
}

function createCategoryId(name) {
  return `category-${Date.now()}-${String(name || "new").replace(/\s+/g, "-").slice(0, 20)}`;
}

function saveCategories() {
  try {
    window.localStorage?.setItem(categoriesStorageKey, JSON.stringify(categories));
  } catch {
    storageError = true;
  }
}

function itemsKeyForCategory(categoryId) {
  return `${legacyItemsKey}:${categoryId}`;
}

function removeCategoryStorage(categoryId) {
  try {
    window.localStorage?.removeItem(itemsKeyForCategory(categoryId));
    if (window.localStorage?.getItem(activeCategoryStorageKey) === categoryId) {
      window.localStorage.removeItem(activeCategoryStorageKey);
    }
    if (categoryId === defaultCategories[0]?.id) {
      window.localStorage?.removeItem(legacyItemsKey);
    }
  } catch {
    storageError = true;
  }
}

function loadItems(categoryId = state.activeCategoryId) {
  if (!categoryId) return [];
  try {
    const saved = window.localStorage?.getItem(itemsKeyForCategory(categoryId));
    if (!saved && categoryId === categories[0]?.id) {
      const legacySaved = window.localStorage?.getItem(legacyItemsKey);
      if (legacySaved) {
        const legacyParsed = JSON.parse(legacySaved);
        const migrated = Array.isArray(legacyParsed) ? legacyParsed.map(normalizeItem).filter(Boolean) : [];
        window.localStorage?.setItem(itemsKeyForCategory(categoryId), JSON.stringify(migrated));
        window.localStorage?.removeItem(legacyItemsKey);
        return migrated;
      }
    }

    const parsed = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed.map(normalizeItem).filter(Boolean);
    return normalized;
  } catch {
    storageError = true;
    return [];
  }
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;
  return {
    id: String(item.id || createId()),
    title: String(item.title || "รายการไม่มีชื่อ"),
    date: isValidISODate(item.date) ? item.date : toISODate(new Date()),
    time: /^\d{2}:\d{2}$/.test(item.time || "") ? item.time : "09:00",
    channel: channels.includes(item.channel) ? item.channel : channels[0],
    format: formats.includes(item.format) ? item.format : formats[0],
    status: statuses.some((status) => status.id === item.status) ? item.status : statuses[0].id,
    urls: normalizeUrls(item.urls ?? item.url ?? ""),
    notes: String(item.notes || ""),
  };
}

function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  return !Number.isNaN(parseISODate(value).getTime());
}

function saveItems() {
  if (!state.activeCategoryId) return false;
  try {
    window.localStorage?.setItem(itemsKeyForCategory(state.activeCategoryId), JSON.stringify(items));
    window.localStorage?.setItem(activeCategoryStorageKey, state.activeCategoryId);
    storageError = false;
    return true;
  } catch {
    storageError = true;
    return false;
  }
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function getUrlCandidates(value) {
  if (Array.isArray(value)) {
    return value.flatMap(getUrlCandidates);
  }
  return String(value || "")
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function normalizeUrls(value) {
  const seen = new Set();
  return getUrlCandidates(value)
    .map(normalizeUrl)
    .filter(Boolean)
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
}

function hasInvalidUrls(value) {
  return getUrlCandidates(value).some((url) => !normalizeUrl(url));
}

function showToast(message, type = "success") {
  if (!elements.toast) return;
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.dataset.type = type;
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3200);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return new Date();
  }
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatThaiDate(value, options = {}) {
  if (!isValidISODate(value)) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: options.year ? "numeric" : undefined,
  }).format(parseISODate(value));
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function statusLabel(statusId) {
  return statuses.find((status) => status.id === statusId)?.label ?? statusId;
}

function populateSelects() {
  channels.forEach((channel) => {
    elements.channelFilter.append(new Option(channel, channel));
    elements.channelInput.append(new Option(channel, channel));
  });

  statuses.forEach((status) => {
    elements.statusFilter.append(new Option(status.label, status.id));
    elements.statusInput.append(new Option(status.label, status.id));
  });
}

function filteredItems() {
  const search = state.search.trim().toLowerCase();
  return items
    .filter((item) => {
      const matchesSearch =
        !search ||
        [item.title, item.date, item.urls.join(" "), item.notes, item.channel, item.format]
          .join(" ")
          .toLowerCase()
          .includes(search);
      const matchesChannel = state.channel === "all" || item.channel === state.channel;
      const matchesStatus = state.status === "all" || item.status === state.status;
      return matchesSearch && matchesChannel && matchesStatus;
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function render() {
  const visibleItems = filteredItems();
  renderMetrics(visibleItems);
  renderChannels();
  renderViewShell();
  renderCalendar(visibleItems);
  renderBoard(visibleItems);
  renderList(visibleItems);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderCategoryPicker() {
  const lastCategoryId = getStoredActiveCategoryId();
  elements.categoryGrid.innerHTML = categories
    .map((category) => {
      const count = loadItems(category.id).length;
      const activeClass = category.id === lastCategoryId ? " is-last" : "";
      const categoryId = escapeHTML(category.id);
      const categoryName = escapeHTML(category.name);
      return `
        <div class="category-card${activeClass}" data-category-id="${categoryId}">
          <button class="category-open" type="button" data-category-id="${categoryId}" aria-label="เปิดหมวด ${categoryName}">
            <span class="category-icon"><i data-lucide="${escapeHTML(category.icon)}" aria-hidden="true"></i></span>
            <span>
              <strong>${categoryName}</strong>
              <span>${count} รายการคอนเทนต์</span>
            </span>
          </button>
          <button class="category-delete" type="button" data-delete-category="${categoryId}" aria-label="ลบหมวด ${categoryName}" title="ลบหมวด">
            <i data-lucide="trash-2" aria-hidden="true"></i>
          </button>
        </div>
      `;
    })
    .join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function getStoredActiveCategoryId() {
  try {
    return window.localStorage?.getItem(activeCategoryStorageKey);
  } catch {
    return null;
  }
}

function getActiveCategory() {
  return categories.find((category) => category.id === state.activeCategoryId) ?? null;
}

function showCategoryScreen() {
  state.editingId = null;
  elements.appShell.hidden = true;
  elements.categoryScreen.hidden = false;
  renderCategoryPicker();
}

function selectCategory(categoryId) {
  const category = categories.find((current) => current.id === categoryId);
  if (!category) return;

  state.activeCategoryId = category.id;
  state.view = "calendar";
  state.search = "";
  state.channel = "all";
  state.status = "all";
  state.editingId = null;
  items = loadItems(category.id);

  elements.searchInput.value = "";
  elements.channelFilter.value = "all";
  elements.statusFilter.value = "all";
  elements.categoryScreen.hidden = true;
  elements.appShell.hidden = false;
  updateActiveCategoryUI();
  resetForm();
  render();
}

function updateActiveCategoryUI() {
  const category = getActiveCategory();
  const label = category ? category.name : "เลือกหมวด";
  elements.activeCategoryName.textContent = label;
  elements.activeCategoryEyebrow.textContent = category ? `แผนเดือนนี้ • ${label}` : "แผนเดือนนี้";
}

function renderMetrics(visibleItems) {
  elements.totalMetric.textContent = visibleItems.length;
  elements.reviewMetric.textContent = visibleItems.filter((item) => item.status === "review").length;
  elements.scheduledMetric.textContent = visibleItems.filter((item) => item.status === "scheduled").length;
  elements.publishedMetric.textContent = visibleItems.filter((item) => item.status === "published").length;
}

function renderChannels() {
  elements.channelStack.innerHTML = channels
    .map((channel) => {
      const count = items.filter((item) => item.channel === channel).length;
      return `<div class="channel-pill"><span>${channel}</span><span>${count}</span></div>`;
    })
    .join("");
}

function renderViewShell() {
  const isCalendar = state.view === "calendar";
  elements.calendarView.hidden = !isCalendar;
  elements.boardView.hidden = state.view !== "board";
  elements.listView.hidden = state.view !== "list";
  elements.monthSwitcher.hidden = !isCalendar;

  document.querySelectorAll(".nav-item").forEach((button) => {
    const isActive = button.dataset.view === state.view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const titles = {
    calendar: ["ปฏิทินคอนเทนต์", "Monthly view", "ปฏิทินเผยแพร่"],
    board: ["บอร์ดคอนเทนต์", "Workflow view", "สถานะงานคอนเทนต์"],
    list: ["รายการคอนเทนต์", "Table view", "แผนทั้งหมด"],
  };
  const [pageTitle, eyebrow, panelTitle] = titles[state.view];
  elements.pageTitle.textContent = pageTitle;
  elements.panelEyebrow.textContent = eyebrow;
  elements.panelTitle.textContent = panelTitle;
}

function switchView(view) {
  if (!viewIds.includes(view)) return false;
  state.view = view;
  render();
  return false;
}

function renderCalendar(visibleItems) {
  const year = state.monthDate.getFullYear();
  const month = state.monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());
  const todayKey = toISODate(new Date());

  elements.monthLabel.textContent = formatMonth(state.monthDate);

  const weekdayMarkup = `<div class="weekday-grid">${thaiWeekdays.map((day) => `<span>${day}</span>`).join("")}</div>`;
  const dayCells = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toISODate(date);
    const dayItems = visibleItems.filter((item) => item.date === dateKey);
    const cards = dayItems
      .slice(0, 2)
      .map((item) => renderSmallCard(item))
      .join("");
    const more = dayItems.length > 2 ? `<button class="more-pill" type="button" data-date="${dateKey}">+${dayItems.length - 2}</button>` : "";
    const classes = [
      "day-cell",
      date.getMonth() !== month ? "is-muted" : "",
      dateKey === todayKey ? "is-today" : "",
      dayItems.length ? "has-items" : "",
    ]
      .filter(Boolean)
      .join(" ");

    dayCells.push(`
      <div class="${classes}">
        <div class="day-number">
          <span>${date.getDate()}</span>
          ${dayItems.length ? `<span class="day-count">${dayItems.length}</span>` : ""}
        </div>
        ${cards}
        ${more}
      </div>
    `);
  }

  elements.calendarView.innerHTML = `${weekdayMarkup}<div class="calendar-grid">${dayCells.join("")}</div>`;
}

function renderSmallCard(item) {
  return `
    <article class="content-card calendar-card" data-id="${item.id}">
      <span class="status-badge status-${item.status}">${statusLabel(item.status)}</span>
      <div class="card-title">${escapeHTML(item.title)}</div>
      <div class="card-meta">
        <span><i data-lucide="clock" aria-hidden="true"></i>${item.time}</span>
        <span>${escapeHTML(item.channel)}</span>
        ${renderContentLinks(item.urls)}
      </div>
    </article>
  `;
}

function renderBoard(visibleItems) {
  elements.boardView.innerHTML = statuses
    .map((status) => {
      const statusItems = visibleItems.filter((item) => item.status === status.id);
      const body = statusItems.length ? statusItems.map((item) => renderBoardCard(item)).join("") : `<div class="empty-column">ว่าง</div>`;
      return `
        <section class="board-column">
          <header class="column-head">
            <span>${status.label}</span>
            <span class="column-count">${statusItems.length}</span>
          </header>
          <div class="column-body">${body}</div>
        </section>
      `;
    })
    .join("");
}

function renderBoardCard(item) {
  return `
    <article class="content-card board-card" data-id="${item.id}">
      <span class="status-badge status-${item.status}">${statusLabel(item.status)}</span>
      <div class="card-title">${escapeHTML(item.title)}</div>
      <div class="card-meta">
        <span><i data-lucide="calendar" aria-hidden="true"></i>${formatThaiDate(item.date)}</span>
        <span><i data-lucide="clock" aria-hidden="true"></i>${item.time}</span>
        <span>${escapeHTML(item.channel)}</span>
        ${renderContentLinks(item.urls)}
      </div>
      <div class="status-actions">
        <button class="status-button" type="button" data-action="edit" data-id="${item.id}">แก้ไข</button>
        <button class="status-button" type="button" data-action="advance" data-id="${item.id}">ถัดไป</button>
      </div>
    </article>
  `;
}

function renderList(visibleItems) {
  if (!visibleItems.length) {
    elements.listView.innerHTML = `<div class="empty-state">ไม่พบรายการที่ตรงกับตัวกรอง</div>`;
    return;
  }

  elements.listView.innerHTML = `
    <table class="content-table">
      <thead>
        <tr>
          <th>คอนเทนต์</th>
          <th>กำหนดเผยแพร่</th>
          <th>ช่องทาง</th>
          <th>สถานะ</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        ${visibleItems.map((item) => renderTableRow(item)).join("")}
      </tbody>
    </table>
  `;
}

function renderTableRow(item) {
  return `
    <tr>
      <td>
        <div class="table-title">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${escapeHTML(item.format)}${item.notes ? ` · ${escapeHTML(item.notes)}` : ""}</span>
          ${renderContentLinks(item.urls)}
        </div>
      </td>
      <td>${formatThaiDate(item.date, { year: true })} ${item.time}</td>
      <td>${escapeHTML(item.channel)}</td>
      <td><span class="status-badge status-${item.status}">${statusLabel(item.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action" type="button" data-action="edit" data-id="${item.id}" aria-label="แก้ไข">
            <i data-lucide="pencil" aria-hidden="true"></i>
          </button>
          <button class="table-action" type="button" data-action="advance" data-id="${item.id}" aria-label="เลื่อนสถานะ">
            <i data-lucide="arrow-right" aria-hidden="true"></i>
          </button>
          <button class="table-action" type="button" data-action="delete" data-id="${item.id}" aria-label="ลบ">
            <i data-lucide="trash-2" aria-hidden="true"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderContentLinks(urls) {
  const links = normalizeUrls(urls);
  if (!links.length) return "";
  return links
    .map((url) => {
      const text = getLinkName(url);
      return `
        <a class="content-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="เปิด ${escapeHTML(text)}">
          <i data-lucide="external-link" aria-hidden="true"></i>
          <span>${escapeHTML(text)}</span>
        </a>
      `;
    })
    .join("");
}

function openContentLink(url) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    const fallbackLink = document.createElement("a");
    fallbackLink.href = url;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noopener noreferrer";
    document.body.append(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  }
}

function getLinkName(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.replace(/\/$/, "") : "";
    const search = parsed.search || "";
    const name = `${host}${path}${search}`;
    return name.length > 46 ? `${name.slice(0, 43)}...` : name;
  } catch {
    return String(url).length > 46 ? `${String(url).slice(0, 43)}...` : String(url);
  }
}

function renderUrlPreview() {
  if (!elements.urlPreview) return;
  const candidates = getUrlCandidates(elements.urlInput.value);
  const links = normalizeUrls(candidates);

  if (!candidates.length) {
    elements.urlPreview.innerHTML = "";
    return;
  }

  if (hasInvalidUrls(candidates)) {
    elements.urlPreview.innerHTML = `<span class="url-preview-note">มี URL ที่ยังเปิดไม่ได้</span>`;
    return;
  }

  elements.urlPreview.innerHTML = renderContentLinks(links);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function handleSubmit(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const formData = new FormData(elements.form);
  const urls = normalizeUrls(formData.get("url"));
  const item = {
    id: state.editingId ?? createId(),
    title: formData.get("title").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    channel: formData.get("channel"),
    format: formData.get("format"),
    status: formData.get("status"),
    urls,
    notes: formData.get("notes").trim(),
  };

  if (state.editingId) {
    items = items.map((current) => (current.id === state.editingId ? item : current));
  } else {
    items = [...items, item];
  }

  state.monthDate = new Date(parseISODate(item.date).getFullYear(), parseISODate(item.date).getMonth(), 1);
  const persisted = saveItems();
  resetForm();
  render();
  showToast(persisted ? "บันทึกแผนแล้ว" : "เพิ่มรายการแล้ว แต่เบราว์เซอร์ไม่อนุญาตให้บันทึกถาวร", persisted ? "success" : "warning");
}

function validateForm() {
  const title = elements.titleInput.value.trim();
  if (!title) {
    elements.titleInput.setAttribute("aria-invalid", "true");
    elements.titleInput.focus();
    showToast("กรอกชื่อคอนเทนต์ก่อนบันทึก", "warning");
    return false;
  }

  const requiredControls = [elements.dateInput, elements.timeInput, elements.channelInput, elements.formatInput, elements.statusInput];
  const missingControl = requiredControls.find((control) => !control.value);
  if (missingControl) {
    missingControl.setAttribute("aria-invalid", "true");
    missingControl.focus();
    showToast("กรอกข้อมูลที่จำเป็นให้ครบก่อนบันทึก", "warning");
    return false;
  }

  elements.titleInput.removeAttribute("aria-invalid");
  requiredControls.forEach((control) => control.removeAttribute("aria-invalid"));

  if (hasInvalidUrls(elements.urlInput.value)) {
    elements.urlInput.setAttribute("aria-invalid", "true");
    elements.urlInput.focus();
    showToast("URL ต้องเป็นลิงก์แบบ http หรือ https", "warning");
    return false;
  }

  elements.urlInput.removeAttribute("aria-invalid");
  return true;
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.dateInput.value = toISODate(new Date());
  elements.timeInput.value = "09:00";
  elements.channelInput.value = "Instagram";
  elements.statusInput.value = "idea";
  elements.urlInput.value = "";
  renderUrlPreview();
  elements.formTitle.textContent = "เพิ่มรายการใหม่";
  elements.submitButton.textContent = "บันทึกแผน";
}

function editItem(itemId) {
  const item = items.find((current) => current.id === itemId);
  if (!item) return;

  state.editingId = item.id;
  elements.titleInput.value = item.title;
  elements.dateInput.value = item.date;
  elements.timeInput.value = item.time;
  elements.channelInput.value = item.channel;
  elements.formatInput.value = item.format;
  elements.statusInput.value = item.status;
  elements.urlInput.value = normalizeUrls(item.urls ?? item.url ?? "").join("\n");
  renderUrlPreview();
  elements.notesInput.value = item.notes ?? "";
  elements.formTitle.textContent = "แก้ไขรายการ";
  elements.submitButton.textContent = "อัปเดตแผน";
  elements.titleInput.focus({ preventScroll: true });
  document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function advanceStatus(itemId) {
  items = items.map((item) => {
    if (item.id !== itemId) return item;
    const currentIndex = statuses.findIndex((status) => status.id === item.status);
    const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];
    return { ...item, status: nextStatus.id };
  });
  saveItems();
  render();
}

function deleteItem(itemId) {
  items = items.filter((item) => item.id !== itemId);
  if (state.editingId === itemId) {
    resetForm();
  }
  saveItems();
  render();
}

function addCategory(name) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    elements.categoryNameInput.setAttribute("aria-invalid", "true");
    elements.categoryNameInput.focus();
    showToast("ใส่ชื่อหมวดก่อนเพิ่ม", "warning");
    return;
  }

  const existing = categories.find((category) => category.name.toLowerCase() === normalizedName.toLowerCase());
  if (existing) {
    elements.categoryForm.reset();
    selectCategory(existing.id);
    return;
  }

  const category = {
    id: createCategoryId(normalizedName),
    name: normalizedName,
    icon: "folder-plus",
  };
  categories = [...categories, category];
  saveCategories();
  elements.categoryForm.reset();
  selectCategory(category.id);
}

function deleteCategory(categoryId) {
  const category = categories.find((current) => current.id === categoryId);
  if (!category) return;

  if (categories.length <= 1) {
    showToast("ต้องมีอย่างน้อย 1 หมวด", "warning");
    return;
  }

  const itemCount = loadItems(category.id).length;
  const confirmMessage = itemCount
    ? `ลบหมวด "${category.name}" พร้อม ${itemCount} รายการคอนเทนต์?`
    : `ลบหมวด "${category.name}"?`;

  if (!window.confirm(confirmMessage)) return;

  categories = categories.filter((current) => current.id !== category.id);
  removeCategoryStorage(category.id);
  saveCategories();

  if (state.activeCategoryId === category.id) {
    state.activeCategoryId = null;
    items = [];
    showCategoryScreen();
  } else {
    renderCategoryPicker();
  }

  showToast(`ลบหมวด "${category.name}" แล้ว`, "success");
}

function showDateInList(dateKey) {
  state.view = "list";
  state.search = dateKey;
  elements.searchInput.value = dateKey;
  render();
}

function handleAction(event) {
  if (event.target.closest("a")) return;

  const card = event.target.closest("[data-id]");
  const actionButton = event.target.closest("[data-action]");
  const moreButton = event.target.closest("[data-date]");

  if (moreButton) {
    showDateInList(moreButton.dataset.date);
    return;
  }

  if (actionButton) {
    const { action, id } = actionButton.dataset;
    if (action === "edit") editItem(id);
    if (action === "advance") advanceStatus(id);
    if (action === "delete") deleteItem(id);
    return;
  }

  if (card) {
    editItem(card.dataset.id);
  }
}

function attachEvents() {
  elements.categoryGrid.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-category]");
    if (deleteButton) {
      event.preventDefault();
      event.stopPropagation();
      deleteCategory(deleteButton.dataset.deleteCategory);
      return;
    }

    const categoryButton = event.target.closest("[data-category-id]");
    if (!categoryButton) return;
    selectCategory(categoryButton.dataset.categoryId);
  });

  elements.categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addCategory(elements.categoryNameInput.value);
  });

  elements.categoryNameInput.addEventListener("input", () => {
    elements.categoryNameInput.removeAttribute("aria-invalid");
  });

  elements.changeCategoryButton.addEventListener("click", showCategoryScreen);
  elements.topChangeCategoryButton.addEventListener("click", showCategoryScreen);

  document.addEventListener("click", (event) => {
    const contentLink = event.target.closest(".content-link");
    if (contentLink) {
      event.preventDefault();
      openContentLink(contentLink.href);
      return;
    }

    const navButton = event.target.closest(".nav-item[data-view]");
    if (!navButton) return;
    event.preventDefault();
    switchView(navButton.dataset.view);
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  elements.channelFilter.addEventListener("change", (event) => {
    state.channel = event.target.value;
    render();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    render();
  });

  elements.previousMonth.addEventListener("click", () => {
    state.monthDate = new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() - 1, 1);
    render();
  });

  elements.nextMonth.addEventListener("click", () => {
    state.monthDate = new Date(state.monthDate.getFullYear(), state.monthDate.getMonth() + 1, 1);
    render();
  });

  elements.form.addEventListener("submit", handleSubmit);
  elements.titleInput.addEventListener("input", () => {
    elements.titleInput.removeAttribute("aria-invalid");
  });
  elements.urlInput.addEventListener("input", () => {
    elements.urlInput.removeAttribute("aria-invalid");
    renderUrlPreview();
  });
  elements.resetFormButton.addEventListener("click", resetForm);
  elements.focusFormButton.addEventListener("click", () => {
    document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    elements.titleInput.focus({ preventScroll: true });
  });

  elements.calendarView.addEventListener("click", handleAction);
  elements.boardView.addEventListener("click", handleAction);
  elements.listView.addEventListener("click", handleAction);
}

function init() {
  populateSelects();
  resetForm();
  attachEvents();
  saveCategories();
  renderCategoryPicker();
  elements.appShell.hidden = true;
  elements.categoryScreen.hidden = false;
  if (storageError) {
    showToast("เปิดผ่านไฟล์ได้ แต่เบราว์เซอร์นี้อาจไม่บันทึกข้อมูลถาวร", "warning");
  }
}

init();
