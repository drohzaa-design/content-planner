(function () {
  const legacyItemsKey = "simple-content-planner-items";
  const categoriesStorageKey = "simple-content-planner-categories";
  const activeCategoryStorageKey = "simple-content-planner-active-category";
  const defaultCategories = [
    { id: "real-estate", name: "อสังหา" },
    { id: "solar", name: "โซลาร์เซลล์" },
    { id: "restaurant", name: "ร้านอาหาร" },
  ];
  const templates = {
    realEstate: [
      { title: "Carousel 5 เช็กลิสต์ก่อนซื้อบ้าน", channel: "Facebook", format: "Carousel", days: 1, time: "09:00", notes: "ทำเป็นสไลด์สั้น ๆ: ทำเล, งบ, สภาพบ้าน, เอกสาร, ค่าใช้จ่ายแฝง" },
      { title: "Reel พาทัวร์จุดเด่นโครงการ", channel: "Instagram", format: "Reel", days: 3, time: "11:00", notes: "ถ่าย 5 ช็อตหลัก: หน้าบ้าน, ห้องนั่งเล่น, ครัว, ห้องนอน, ส่วนกลาง" },
      { title: "โพสต์เปรียบเทียบเช่ากับซื้อ", channel: "Facebook", format: "Post", days: 5, time: "13:00", notes: "เล่าแบบเข้าใจง่าย พร้อม CTA ให้ทักปรึกษางบประมาณ" },
      { title: "บทความทำเลน่าอยู่ประจำเดือน", channel: "Blog", format: "Article", days: 7, time: "10:00", notes: "รวมจุดเด่นการเดินทาง โรงเรียน ห้าง โรงพยาบาล และราคาเริ่มต้น" },
      { title: "TikTok ตอบคำถามกู้บ้านผ่านยากไหม", channel: "TikTok", format: "Video", days: 9, time: "18:00", notes: "เปิดด้วยคำถามแรง แล้วตอบ 3 ปัจจัยที่ธนาคารดู" },
      { title: "โพสต์รีวิวลูกค้าหลังโอน", channel: "Facebook", format: "Post", days: 12, time: "15:00", notes: "ใช้ quote ลูกค้าจริงหรือสรุป journey ตั้งแต่ทักจนโอน" },
    ],
    solar: [
      { title: "Carousel คำนวณค่าไฟก่อนติดโซลาร์", channel: "Facebook", format: "Carousel", days: 1, time: "09:00", notes: "ทำตัวอย่างบิลค่าไฟ 3 ระดับ พร้อมคำแนะนำขนาดระบบเบื้องต้น" },
      { title: "Reel ก่อนติดตั้งต้องเตรียมอะไร", channel: "Instagram", format: "Reel", days: 3, time: "11:00", notes: "เช็กลิสต์หลังคา มิเตอร์ พื้นที่ติดตั้ง และเอกสาร" },
      { title: "โพสต์ Myth vs Fact โซลาร์เซลล์", channel: "Facebook", format: "Post", days: 5, time: "13:00", notes: "เลือก 3 ความเข้าใจผิด เช่น ฝนตกผลิตไฟไม่ได้เลย, ดูแลยาก, คืนทุนช้าเสมอ" },
      { title: "วิดีโอเคสลูกค้าลดค่าไฟจริง", channel: "YouTube", format: "Video", days: 8, time: "17:00", notes: "เล่าก่อนติดตั้ง หลังติดตั้ง และตัวเลขประหยัดเฉลี่ย" },
      { title: "บทความคืนทุนโซลาร์กี่ปี", channel: "Blog", format: "Article", days: 10, time: "10:00", notes: "อธิบายปัจจัยค่าไฟ พฤติกรรมใช้ไฟ ขนาดระบบ และต้นทุนติดตั้ง" },
      { title: "TikTok 3 สัญญาณว่าควรติดโซลาร์", channel: "TikTok", format: "Video", days: 12, time: "18:30", notes: "ใช้ hook เร็ว: ค่าไฟเกินเท่านี้, ใช้ไฟกลางวันเยอะ, มีพื้นที่หลังคา" },
    ],
    restaurant: [
      { title: "Carousel เมนูขายดีประจำสัปดาห์", channel: "Instagram", format: "Carousel", days: 1, time: "10:00", notes: "รวม 5 เมนู พร้อมภาพ close-up และราคา/โปรโมชัน" },
      { title: "Reel เบื้องหลังครัวช่วงเตรียมร้าน", channel: "Instagram", format: "Reel", days: 3, time: "11:30", notes: "ถ่ายวัตถุดิบสด การปรุง และจานเสิร์ฟสุดท้าย" },
      { title: "โพสต์รีวิวลูกค้าและเมนูที่สั่ง", channel: "Facebook", format: "Post", days: 5, time: "14:00", notes: "ทำเป็น quote สั้น ๆ พร้อมภาพเมนูจริง" },
      { title: "TikTok เมนูลับที่ลูกค้าประจำชอบ", channel: "TikTok", format: "Video", days: 7, time: "18:00", notes: "เปิดด้วยจานเด็ด แล้วเล่าว่าทำไมคนสั่งซ้ำ" },
      { title: "โพสต์โปรกลางสัปดาห์", channel: "Facebook", format: "Post", days: 9, time: "09:30", notes: "ทำ offer ชัด ๆ เช่น มา 4 จ่าย 3 หรือเซ็ตกลางวัน" },
      { title: "Email ชวนลูกค้าเก่ากลับมาทาน", channel: "Email", format: "Email", days: 12, time: "08:30", notes: "ส่งคูปองหรือเมนูใหม่ให้ลูกค้าเก่าพร้อมวันหมดอายุ" },
    ],
    general: [
      { title: "Carousel ปัญหาที่ลูกค้ามักเจอ", channel: "Facebook", format: "Carousel", days: 1, time: "09:00", notes: "เลือก 5 pain point แล้วปิดท้ายด้วยวิธีแก้/บริการของเรา" },
      { title: "Reel เบื้องหลังการทำงาน", channel: "Instagram", format: "Reel", days: 3, time: "11:00", notes: "ทำให้แบรนด์ดูจริงใจและน่าเชื่อถือ" },
      { title: "โพสต์ FAQ จากลูกค้า", channel: "Facebook", format: "Post", days: 5, time: "13:00", notes: "ตอบ 3 คำถามที่ฝ่ายขายเจอบ่อย" },
      { title: "บทความ How-to สำหรับมือใหม่", channel: "Blog", format: "Article", days: 8, time: "10:00", notes: "ทำเป็น guide ที่แชร์ต่อได้และช่วย SEO" },
      { title: "วิดีโอรีวิวหรือเคสตัวอย่าง", channel: "YouTube", format: "Video", days: 10, time: "17:00", notes: "เล่าปัญหา วิธีแก้ และผลลัพธ์หลังใช้บริการ" },
      { title: "Email สรุปโปรหรือข่าวล่าสุด", channel: "Email", format: "Email", days: 12, time: "08:30", notes: "เขียนสั้น มี CTA ชัดเจน และใส่ลิงก์กลับมาหน้าแคมเปญ" },
    ],
  };
  let currentCategoryId = null;
  let toastTimer = 0;

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function offsetDate(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return toISODate(date);
  }

  function createId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function itemsKeyForCategory(categoryId) {
    return `${legacyItemsKey}:${categoryId}`;
  }

  function readJSON(key, fallback) {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadCategories() {
    const saved = readJSON(categoriesStorageKey, null);
    return Array.isArray(saved) && saved.length ? saved : defaultCategories;
  }

  function loadItems(categoryId) {
    const saved = readJSON(itemsKeyForCategory(categoryId), null);
    if (Array.isArray(saved)) return saved;
    if (categoryId === "real-estate") {
      const legacy = readJSON(legacyItemsKey, null);
      if (Array.isArray(legacy)) return legacy;
    }
    return [];
  }

  function saveItems(categoryId, nextItems) {
    window.localStorage.setItem(itemsKeyForCategory(categoryId), JSON.stringify(nextItems));
    window.localStorage.setItem(activeCategoryStorageKey, categoryId);
  }

  function showToast(message, type = "success") {
    const toast = document.querySelector("#toast");
    if (!toast) {
      window.alert(message);
      return;
    }
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.dataset.type = type;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function findCategory(categoryId) {
    return loadCategories().find((category) => category.id === categoryId) ?? null;
  }

  function getCurrentCategoryId() {
    if (currentCategoryId) return currentCategoryId;
    try {
      return window.localStorage.getItem(activeCategoryStorageKey);
    } catch {
      return null;
    }
  }

  function ideasForCategory(category) {
    if (!category) return templates.general;
    const name = String(category.name || "").toLowerCase();
    if (category.id === "real-estate" || name.includes("อสัง")) return templates.realEstate;
    if (category.id === "solar" || name.includes("โซลาร์") || name.includes("solar")) return templates.solar;
    if (category.id === "restaurant" || name.includes("อาหาร") || name.includes("restaurant")) return templates.restaurant;
    return templates.general;
  }

  function addContentIdeas() {
    const categoryId = getCurrentCategoryId();
    if (!categoryId) {
      showToast("เลือกหมวดก่อนเติมไอเดีย", "warning");
      return;
    }

    const category = findCategory(categoryId);
    const items = loadItems(categoryId);
    const existingTitles = new Set(items.map((item) => String(item.title || "").trim().toLowerCase()));
    const newItems = ideasForCategory(category)
      .filter((idea) => !existingTitles.has(idea.title.trim().toLowerCase()))
      .map((idea) => ({
        id: createId(),
        title: idea.title,
        date: offsetDate(idea.days),
        time: idea.time,
        channel: idea.channel,
        format: idea.format,
        status: "idea",
        urls: [],
        notes: idea.notes,
      }));

    if (!newItems.length) {
      showToast("มีไอเดียชุดนี้อยู่ในหมวดนี้แล้ว", "warning");
      return;
    }

    saveItems(categoryId, [...items, ...newItems]);
    if (typeof window.selectCategory === "function") {
      window.selectCategory(categoryId);
    }
    showToast(`เพิ่มไอเดีย ${newItems.length} รายการแล้ว`);
  }

  function rememberCategory(event) {
    const categoryElement = event.target.closest("[data-category-id]");
    if (!categoryElement?.dataset.categoryId) return;
    currentCategoryId = categoryElement.dataset.categoryId;
    try {
      window.localStorage.setItem(activeCategoryStorageKey, currentCategoryId);
    } catch {}
  }

  function setup() {
    document.addEventListener("click", rememberCategory, true);
    document.querySelector("#seedContentButton")?.addEventListener("click", addContentIdeas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
