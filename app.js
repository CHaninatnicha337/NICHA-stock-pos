/**
 * 7-Eleven Architecture Stock & POS System
 * Front Store (POS) & Back Office (Inventory Management)
 * Neumorphism 80% + Liquid Glass 20%
 */

// ==========================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  static init() {
    this.ctx = null;
  }

  static getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 7-Eleven Barcode Beep
  static beep() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  // Error Alert Beep
  static error() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  }

  // Payment Success Chime
  static success() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.12, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.21);
      });
    } catch (e) {}
  }
}

// ==========================================
// 2. INITIAL DATABASE & SEED DATA
// ==========================================
const DEFAULT_PRODUCTS = [
  {
    id: "P001",
    sku: "W001",
    barcode: "8850123456019",
    name: "น้ำดื่ม ซีพี-เซเว่น 600 ml",
    category: "เครื่องดื่ม",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=350&auto=format&fit=crop&q=70",
    cost: 4.5,
    price: 7.0,
    unit: "ขวด",
    shelf: 45,
    backroom: 80,
    damaged: 0,
    expired: 0,
    minStock: 25,
    reorderPoint: 40,
    status: "ACTIVE",
    isFood: false
  },
  {
    id: "P002",
    sku: "M002",
    barcode: "8850123456026",
    name: "นมสด เมจิ รสจืด 200 ml",
    category: "เครื่องดื่ม",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=350&auto=format&fit=crop&q=70",
    cost: 9.0,
    price: 13.5,
    unit: "กล่อง",
    shelf: 18,
    backroom: 35,
    damaged: 1,
    expired: 0,
    minStock: 15,
    reorderPoint: 30,
    status: "ACTIVE",
    isFood: true
  },
  {
    id: "P003",
    sku: "S003",
    barcode: "8850123456033",
    name: "แซนด์วิชอบร้อน แฮมชีส",
    category: "อาหารพร้อมรับประทาน",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=350&auto=format&fit=crop&q=70",
    cost: 18.0,
    price: 29.0,
    unit: "ชิ้น",
    shelf: 8,
    backroom: 15,
    damaged: 0,
    expired: 0,
    minStock: 10,
    reorderPoint: 20,
    status: "ACTIVE",
    isFood: true
  },
  {
    id: "P004",
    sku: "F004",
    barcode: "8850123456040",
    name: "ข้าวกะเพราหมูสับ ไข่ดาว EZYGO",
    category: "อาหารพร้อมรับประทาน",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=350&auto=format&fit=crop&q=70",
    cost: 30.0,
    price: 45.0,
    unit: "กล่อง",
    shelf: 12,
    backroom: 20,
    damaged: 0,
    expired: 0,
    minStock: 10,
    reorderPoint: 25,
    status: "ACTIVE",
    isFood: true
  },
  {
    id: "P005",
    sku: "F005",
    barcode: "8850123456057",
    name: "ข้าวผัดไส้กรอก EZYGO",
    category: "อาหารพร้อมรับประทาน",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=350&auto=format&fit=crop&q=70",
    cost: 26.0,
    price: 39.0,
    unit: "กล่อง",
    shelf: 15,
    backroom: 25,
    damaged: 0,
    expired: 0,
    minStock: 5,
    reorderPoint: 15,
    status: "ACTIVE",
    isFood: true,
    testExpired: false
  },
  {
    id: "P006",
    sku: "B006",
    barcode: "8850123456064",
    name: "ขนมปังแซนด์วิช ฟาร์มเฮ้าส์",
    category: "เบเกอรี่",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=350&auto=format&fit=crop&q=70",
    cost: 16.0,
    price: 24.0,
    unit: "แถว",
    shelf: 6,
    backroom: 12,
    damaged: 0,
    expired: 0,
    minStock: 8,
    reorderPoint: 15,
    status: "ACTIVE",
    isFood: true
  },
  {
    id: "P007",
    sku: "S007",
    barcode: "8850123456071",
    name: "มันฝรั่งทอดกรอบ เลย์ คลาสสิค 42g",
    category: "ขนมขบเคี้ยว",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=350&auto=format&fit=crop&q=70",
    cost: 14.5,
    price: 20.0,
    unit: "ซอง",
    shelf: 30,
    backroom: 50,
    damaged: 0,
    expired: 0,
    minStock: 20,
    reorderPoint: 40,
    status: "ACTIVE",
    isFood: false
  },
  {
    id: "P008",
    sku: "D008",
    barcode: "8850123456088",
    name: "ชาเขียว อิชิตัน รสน้ำผึ้งมะนาว 420 ml",
    category: "เครื่องดื่ม",
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=350&auto=format&fit=crop&q=70",
    cost: 13.0,
    price: 20.0,
    unit: "ขวด",
    shelf: 22,
    backroom: 40,
    damaged: 0,
    expired: 0,
    minStock: 15,
    reorderPoint: 35,
    status: "ACTIVE",
    isFood: false
  },
  {
    id: "P009",
    sku: "O009",
    barcode: "8850123456095",
    name: "ยาสีฟัน คอลเกต โททอล 150g",
    category: "ของใช้ส่วนตัว",
    image: "https://images.unsplash.com/photo-1559591937-e1032b4b4556?w=350&auto=format&fit=crop&q=70",
    cost: 58.0,
    price: 79.0,
    unit: "หลอด",
    shelf: 14,
    backroom: 25,
    damaged: 0,
    expired: 0,
    minStock: 8,
    reorderPoint: 15,
    status: "ACTIVE",
    isFood: false
  },
  {
    id: "P010",
    sku: "N010",
    barcode: "8850123456101",
    name: "มาม่า บะหมี่กึ่งสำเร็จรูป ต้มยำกุ้ง",
    category: "อาหารแห้ง",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=350&auto=format&fit=crop&q=70",
    cost: 5.5,
    price: 7.0,
    unit: "ซอง",
    shelf: 48,
    backroom: 120,
    damaged: 0,
    expired: 0,
    minStock: 30,
    reorderPoint: 60,
    status: "ACTIVE",
    isFood: false
  }
];

function getRelativeDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const DEFAULT_BATCHES = [
  {
    batchNo: "LOT-202611-01",
    productId: "P001",
    mfd: getRelativeDate(-20),
    exp: getRelativeDate(360),
    qty: 125,
    location: "Shelf & Backroom"
  },
  {
    batchNo: "LOT-202611-02",
    productId: "P002",
    mfd: getRelativeDate(-3),
    exp: getRelativeDate(7),
    qty: 53,
    location: "Shelf & Backroom"
  },
  {
    batchNo: "LOT-202611-03",
    productId: "P003",
    mfd: getRelativeDate(-1),
    exp: getRelativeDate(2),
    qty: 23,
    location: "Shelf & Backroom"
  },
  {
    batchNo: "LOT-202611-04",
    productId: "P004",
    mfd: getRelativeDate(-2),
    exp: getRelativeDate(4),
    qty: 32,
    location: "Shelf & Backroom"
  },
  {
    batchNo: "LOT-202611-05",
    productId: "P005",
    mfd: getRelativeDate(-5),
    exp: getRelativeDate(14),
    qty: 40,
    location: "Shelf & Backroom"
  }
];

// ==========================================
// 3. STORAGE & STATE CONTROLLER
// ==========================================
class StockSystemState {
  constructor() {
    this.currentMode = 'FRONT'; // 'FRONT' = หน้าร้าน POS, 'BACK' = หลังร้าน Back Office
    this.loadState();
    this.cart = [];
    this.currentUser = {
      name: "สมศักดิ์ สุขใจ",
      role: "ผู้จัดการสาขา (Store Manager)",
      roleKey: "MANAGER", // 'MANAGER' or 'CASHIER'
      empId: "EMP-71109"
    };
  }

  loadState() {
    this.products = JSON.parse(localStorage.getItem('seven_products')) || DEFAULT_PRODUCTS;
    // Ensure all products have images even if loaded from older localStorage
    this.products.forEach(p => {
      if (!p.image) {
        const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
        p.image = def ? def.image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=350&auto=format&fit=crop&q=70";
      }
    });

    this.batches = JSON.parse(localStorage.getItem('seven_batches')) || DEFAULT_BATCHES;
    this.movements = JSON.parse(localStorage.getItem('seven_movements')) || [
      {
        id: "MOV-1001",
        date: new Date(Date.now() - 3600000 * 5).toLocaleString('th-TH'),
        type: "RECEIVE",
        productId: "P001",
        productName: "น้ำดื่ม ซีพี-เซเว่น 600 ml",
        qty: 100,
        ref: "PO-711-8890",
        operator: "สมศักดิ์ (Manager)",
        note: "รับเข้าจากคลัง DC บางบัวทอง"
      },
      {
        id: "MOV-1002",
        date: new Date(Date.now() - 3600000 * 2).toLocaleString('th-TH'),
        type: "TRANSFER",
        productId: "P001",
        productName: "น้ำดื่ม ซีพี-เซเว่น 600 ml",
        qty: 30,
        ref: "TR-004",
        operator: "วิชัย (Cashier)",
        note: "โอนจากห้องเก็บของ -> ชั้นวางหน้าร้าน"
      }
    ];
    this.salesHistory = JSON.parse(localStorage.getItem('seven_sales')) || [];
    this.holdBills = JSON.parse(localStorage.getItem('seven_hold_bills')) || [];
    this.cashierShift = JSON.parse(localStorage.getItem('seven_cashier_shift')) || {
      startTime: new Date().toLocaleTimeString('th-TH'),
      startDate: new Date().toLocaleDateString('th-TH'),
      cashier: "สมศักดิ์ สุขใจ",
      billsCount: 0,
      cashTotal: 0,
      qrTotal: 0,
      cardTotal: 0
    };
    this.auditLogs = JSON.parse(localStorage.getItem('seven_audit')) || [
      {
        timestamp: new Date(Date.now() - 3600000 * 6).toLocaleString('th-TH'),
        user: "สมศักดิ์ สุขใจ",
        action: "LOGIN",
        details: "เข้าสู่ระบบ POS ประจำเครื่อง Terminal #1"
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString('th-TH'),
        user: "สมศักดิ์ สุขใจ",
        action: "GOODS_RECEIVE",
        details: "บันทึกรับสินค้า PO-711-8890 จำนวน 100 รายการ"
      }
    ];
  }

  save() {
    localStorage.setItem('seven_products', JSON.stringify(this.products));
    localStorage.setItem('seven_batches', JSON.stringify(this.batches));
    localStorage.setItem('seven_movements', JSON.stringify(this.movements));
    localStorage.setItem('seven_sales', JSON.stringify(this.salesHistory));
    localStorage.setItem('seven_audit', JSON.stringify(this.auditLogs));
    localStorage.setItem('seven_hold_bills', JSON.stringify(this.holdBills));
    localStorage.setItem('seven_cashier_shift', JSON.stringify(this.cashierShift));

    // Asynchronously sync with central backend (server.py)
    this.syncToBackend();
  }

  async syncToBackend() {
    try {
      const payload = {
        products: this.products,
        batches: this.batches,
        movements: this.movements,
        salesHistory: this.salesHistory,
        auditLogs: this.auditLogs,
        holdBills: this.holdBills,
        cashierShift: this.cashierShift,
        timestamp: new Date().toISOString()
      };
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Offline or static file mode: continue using localStorage smoothly
    }
  }

  async initSync() {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data && data.products && data.products.length > 0) {
          this.products = data.products;
          if (data.batches) this.batches = data.batches;
          if (data.movements) this.movements = data.movements;
          if (data.salesHistory) this.salesHistory = data.salesHistory;
          if (data.auditLogs) this.auditLogs = data.auditLogs;
          if (data.holdBills) this.holdBills = data.holdBills;
          if (data.cashierShift) this.cashierShift = data.cashierShift;
          
          localStorage.setItem('seven_products', JSON.stringify(this.products));
          localStorage.setItem('seven_batches', JSON.stringify(this.batches));
          localStorage.setItem('seven_movements', JSON.stringify(this.movements));
          localStorage.setItem('seven_sales', JSON.stringify(this.salesHistory));
          localStorage.setItem('seven_audit', JSON.stringify(this.auditLogs));
          localStorage.setItem('seven_hold_bills', JSON.stringify(this.holdBills));
          localStorage.setItem('seven_cashier_shift', JSON.stringify(this.cashierShift));

          if (this.currentMode === 'FRONT') {
            renderPOS();
            updateHeldBillsUI();
          } else {
            renderDashboard();
          }
        } else {
          // If server database is empty, seed it with initial state
          this.syncToBackend();
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  resetAllData() {
    localStorage.removeItem('seven_products');
    localStorage.removeItem('seven_batches');
    localStorage.removeItem('seven_movements');
    localStorage.removeItem('seven_sales');
    localStorage.removeItem('seven_audit');
    localStorage.removeItem('seven_hold_bills');
    localStorage.removeItem('seven_cashier_shift');
    this.loadState();
    this.cart = [];
    this.save();
    try {
      fetch('/api/reset', { method: 'POST' });
    } catch (e) {}
  }

  addAudit(action, details) {
    const log = {
      timestamp: new Date().toLocaleString('th-TH'),
      user: this.currentUser.name + ` (${this.currentUser.roleKey})`,
      action: action,
      details: details
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    this.save();
  }

  addMovement(type, productId, qty, ref, note) {
    const prod = this.products.find(p => p.id === productId);
    const mov = {
      id: "MOV-" + Date.now().toString().slice(-6),
      date: new Date().toLocaleString('th-TH'),
      type: type,
      productId: productId,
      productName: prod ? prod.name : productId,
      qty: qty,
      ref: ref || "-",
      operator: this.currentUser.name,
      note: note || ""
    };
    this.movements.unshift(mov);
    if (this.movements.length > 500) this.movements.pop();
    this.save();
  }
}

const AppState = new StockSystemState();

// ==========================================
// 4. FRONT STORE vs BACK OFFICE SWITCHER
// ==========================================
function switchSystemMode(mode) {
  AppState.currentMode = mode;
  const frontView = document.getElementById('front-store-view');
  const backView = document.getElementById('back-office-view');
  const btnFront = document.getElementById('mode-btn-front');
  const btnBack = document.getElementById('mode-btn-back');

  if (mode === 'FRONT') {
    if (frontView) frontView.classList.remove('hidden');
    if (backView) backView.classList.add('hidden');
    if (btnFront) btnFront.classList.add('mode-switch-active');
    if (btnBack) btnBack.classList.remove('mode-switch-active');
    renderPOS();
    showToast('เข้าสู่ระบบหน้าร้าน (Front POS คิดเงิน)', 'info', 1800);
  } else {
    // Auto switch to Manager role so user is never blocked
    if (AppState.currentUser.roleKey === 'CASHIER') {
      AppState.currentUser.roleKey = 'MANAGER';
      AppState.currentUser.name = 'สมศักดิ์ สุขใจ';
      AppState.currentUser.role = 'ผู้จัดการสาขา (Store Manager)';
      const roleEl = document.getElementById('header-user-role');
      if (roleEl) roleEl.innerText = AppState.currentUser.role;
      const cashierEl = document.getElementById('pos-cashier-name');
      if (cashierEl) cashierEl.innerText = AppState.currentUser.name;
    }

    if (frontView) frontView.classList.add('hidden');
    if (backView) backView.classList.remove('hidden');
    if (btnFront) btnFront.classList.remove('mode-switch-active');
    if (btnBack) btnBack.classList.add('mode-switch-active');

    switchBackTab('dashboard-tab', '📊 1. แดชบอร์ดสรุปผล (Dashboard)');
    showToast('เข้าสู่ระบบหลังร้าน (Back Office Management)', 'info', 1800);
    lucide.createIcons();
  }
}

// Switch Sub-tabs inside Back Office
const TAB_LABELS = {
  'dashboard-tab': '📊 1. แดชบอร์ดสรุปผล (Dashboard)',
  'inventory-tab': '📦 2. สต็อกสินค้าคงคลัง (Inventory)',
  'receiving-tab': '🚚 3. รับสินค้าเข้าคลัง (Receiving)',
  'transfer-tab': '🔄 4. โอนย้ายเติมของ (Transfer)',
  'counting-tab': '📋 5. ตรวจนับสต็อก & อนุมัติ (Count)',
  'expiry-tab': '⏳ 6. วันหมดอายุ FEFO & GS1',
  'movements-tab': '📜 7. ประวัติเคลื่อนไหว (Movements)',
  'audit-tab': '🛡️ 8. บันทึกความปลอดภัย (Audit)'
};

function switchBackTab(tabId, customLabel) {
  document.querySelectorAll('.back-tab-content').forEach(el => el.classList.add('hidden'));

  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Update Desktop Sub-Navbar Active State
  document.querySelectorAll('.desktop-nav-tab').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Active Header Label (for Mobile)
  const labelEl = document.getElementById('current-back-tab-label');
  if (labelEl) {
    labelEl.innerText = customLabel || TAB_LABELS[tabId] || 'เมนูระบบหลังร้าน';
  }

  try {
    if (tabId === 'dashboard-tab') renderDashboard();
    if (tabId === 'inventory-tab') renderInventory();
    if (tabId === 'receiving-tab') renderReceiving();
    if (tabId === 'transfer-tab') renderTransfer();
    if (tabId === 'counting-tab') renderCounting();
    if (tabId === 'expiry-tab') renderExpiry();
    if (tabId === 'movements-tab') renderMovements();
    if (tabId === 'audit-tab') renderAudit();
  } catch (err) {
    console.error('Error rendering tab:', tabId, err);
  }

  lucide.createIcons();
}

// Mobile / iPad Drawer Navigation Functions
function openMobileDrawer() {
  const wrapper = document.getElementById('mobile-drawer-wrapper');
  if (wrapper) {
    wrapper.classList.remove('hidden');
    requestAnimationFrame(() => {
      document.body.classList.add('drawer-open');
    });
  }
}

function closeMobileDrawer() {
  const wrapper = document.getElementById('mobile-drawer-wrapper');
  if (wrapper) {
    document.body.classList.remove('drawer-open');
    setTimeout(() => {
      wrapper.classList.add('hidden');
    }, 280);
  }
}

function selectDrawerTab(tabId, label) {
  switchBackTab(tabId, label);
  closeMobileDrawer();
  showToast(`เปิดหน้า: ${label}`, 'info', 1600);
}

// Legacy aliases for backward compatibility
function openHamburgerMenu() { openMobileDrawer(); }
function closeHamburgerMenu() { closeMobileDrawer(); }
function selectHamburgerTab(tabId, label) { selectDrawerTab(tabId, label); }

// Toggle Current User Role (Store Manager vs Cashier)
function toggleUserRole() {
  if (AppState.currentUser.roleKey === 'MANAGER') {
    AppState.currentUser.roleKey = 'CASHIER';
    AppState.currentUser.name = 'วิชัย ใจดี';
    AppState.currentUser.role = 'พนักงานแคชเชียร์ (Cashier)';
    showToast('สลับบทบาทเป็น: พนักงานแคชเชียร์หน้าร้าน', 'info');
  } else {
    AppState.currentUser.roleKey = 'MANAGER';
    AppState.currentUser.name = 'สมศักดิ์ สุขใจ';
    AppState.currentUser.role = 'ผู้จัดการสาขา (Store Manager)';
    showToast('สลับบทบาทเป็น: ผู้จัดการสาขา (Store Manager)', 'success');
  }

  document.getElementById('header-user-role').innerText = AppState.currentUser.role;
  const cashierEl = document.getElementById('pos-cashier-name');
  if (cashierEl) cashierEl.innerText = AppState.currentUser.name;
  AppState.addAudit('ROLE_CHANGE', `สลับผู้ปฏิบัติงานเป็น ${AppState.currentUser.name} (${AppState.currentUser.role})`);
}

// ==========================================
// 5. POS POINT OF SALE MODULE (หน้าร้าน)
// ==========================================
window.currentPosCategory = 'ALL';

function selectPosCategory(category, btnEl) {
  window.currentPosCategory = category;
  document.querySelectorAll('#pos-cat-pills .cat-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderQuickProducts();
}

function renderPOS() {
  renderCart();
  renderQuickProducts();
  updateHeldBillsUI();
}

function renderQuickProducts() {
  const container = document.getElementById('pos-quick-products');
  if (!container) return;
  
  const query = (document.getElementById('pos-search-input')?.value || '').toLowerCase().trim();
  const filterCat = window.currentPosCategory || 'ALL';

  const filtered = AppState.products.filter(p => {
    const matchQ = !query || p.name.toLowerCase().includes(query) || p.barcode.includes(query) || p.sku.toLowerCase().includes(query);
    const matchC = filterCat === 'ALL' || p.category.includes(filterCat);
    return matchQ && matchC;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400">
        <i data-lucide="package-search" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-medium">ไม่พบสินค้าในหมวดหมู่นี้</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isOutOfStock = p.shelf <= 0;
    const isLowStock = !isOutOfStock && (p.shelf <= (p.reorderPoint || p.minStock || 10));
    const isTestExpired = p.testExpired;

    let alertClass = '';
    if (isOutOfStock) alertClass = 'stock-out';
    else if (isLowStock) alertClass = 'stock-warning';

    const defaultImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=350&auto=format&fit=crop&q=70";
    const imgSrc = p.image || defaultImg;

    return `
      <div onclick="posScanProduct('${p.barcode}')" class="neu-box-sm pos-prod-card p-2.5 flex flex-col justify-between cursor-pointer group ${alertClass}">
        <div>
          <!-- Clean Product Image -->
          <div class="prod-img-wrapper mb-2">
            <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='${defaultImg}';">
            ${isOutOfStock ? '<span class="absolute top-1.5 right-1.5 liquid-badge text-[10px] text-red-600 font-bold px-1.5 py-0.5 bg-red-100/90 border border-red-300 shadow-sm">หมดสต็อก</span>' : ''}
            ${isLowStock ? '<span class="absolute top-1.5 right-1.5 liquid-badge text-[10px] text-rose-700 font-bold px-1.5 py-0.5 bg-rose-100/90 border border-rose-300 shadow-sm animate-pulse">เหลือน้อย</span>' : ''}
            ${isTestExpired ? '<span class="absolute top-1.5 left-1.5 liquid-badge text-[10px] text-red-600 font-bold px-1.5 py-0.5 bg-red-100/90 border border-red-300 shadow-sm">EXPIRED</span>' : ''}
          </div>

          <!-- Product Name only (Simple & Clean) -->
          <h4 class="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-tight" title="${p.name}">${p.name}</h4>
        </div>

        <!-- Price and Add Button -->
        <div class="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60">
          <span class="text-sm sm:text-base font-bold font-mono text-slate-900">฿${p.price.toFixed(2)}</span>
          <button class="neu-btn px-2.5 py-1 text-xs text-slate-700 font-bold group-hover:bg-slate-800 group-hover:text-white transition">
            + เพิ่ม
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function posScanProduct(barcodeOrSku) {
  const code = (barcodeOrSku || '').trim();
  if (!code) return;

  const product = AppState.products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
  
  if (!product) {
    SoundFX.error();
    showToast('ไม่พบข้อมูลสินค้ารหัส: ' + code, 'error');
    return;
  }

  // GS1 DataMatrix Expiry Guard
  if (product.testExpired) {
    SoundFX.error();
    showToast(`⚠️ [GS1 Alert] สินค้า "${product.name}" หมดอายุแล้ว! ระบบระงับการขายตามมาตรฐาน 7-Eleven`, 'error', 4500);
    AppState.addAudit('EXPIRED_SALE_BLOCKED', `ระบบบล็อกการขายสินค้าหมดอายุ: ${product.name} (Barcode: ${product.barcode})`);
    return;
  }

  // Stock Check
  const currentInCart = AppState.cart.find(item => item.id === product.id);
  const cartQty = currentInCart ? currentInCart.qty : 0;
  
  if (cartQty + 1 > product.shelf) {
    SoundFX.error();
    showToast(`สต็อกหน้าร้านไม่พอ! คงเหลือบนชั้นวาง: ${product.shelf} ${product.unit}`, 'warning');
    return;
  }

  SoundFX.beep();

  if (currentInCart) {
    currentInCart.qty += 1;
  } else {
    AppState.cart.push({
      id: product.id,
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      cost: product.cost,
      unit: product.unit,
      qty: 1
    });
  }

  const inputEl = document.getElementById('pos-barcode-input');
  if (inputEl) inputEl.value = '';

  renderCart();
  showToast(`ยิงบาร์โค้ด: ${product.name}`, 'info', 1500);
}

function updateCartQty(id, delta) {
  const item = AppState.cart.find(i => i.id === id);
  if (!item) return;

  const prod = AppState.products.find(p => p.id === id);
  const newQty = item.qty + delta;

  if (newQty <= 0) {
    AppState.cart = AppState.cart.filter(i => i.id !== id);
  } else {
    if (prod && newQty > prod.shelf) {
      SoundFX.error();
      showToast(`สินค้าบนชั้นวางมีเพียง ${prod.shelf} ${prod.unit}`, 'warning');
      return;
    }
    item.qty = newQty;
  }
  SoundFX.beep();
  renderCart();
}

function clearCart() {
  if (AppState.cart.length === 0) return;
  if (confirm('ต้องการล้างรายการตะกร้าสินค้าทั้งหมดหรือไม่?')) {
    AppState.cart = [];
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('pos-cart-items');
  const countEl = document.getElementById('pos-cart-count');
  const subtotalEl = document.getElementById('pos-subtotal');
  const vatEl = document.getElementById('pos-vat');
  const grandTotalEl = document.getElementById('pos-grand-total');

  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-gray-400">
        <i data-lucide="shopping-cart" class="w-12 h-12 mb-2 stroke-[1.5]"></i>
        <p class="text-sm">ยังไม่มีรายการสินค้า</p>
        <p class="text-xs text-gray-400 mt-1">ยิงบาร์โค้ดหรือคลิกเลือกสินค้าเพื่อเริ่มคิดเงิน</p>
      </div>
    `;
    if (countEl) countEl.innerText = '0 ชิ้น';
    if (subtotalEl) subtotalEl.innerText = '฿0.00';
    if (vatEl) vatEl.innerText = '฿0.00';
    if (grandTotalEl) grandTotalEl.innerText = '฿0.00';
    lucide.createIcons();
    return;
  }

  let totalQty = 0;
  let totalAmount = 0;

  container.innerHTML = AppState.cart.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    totalQty += item.qty;
    totalAmount += itemTotal;

    return `
      <div class="neu-inset-sm p-3 flex items-center justify-between mb-2">
        <div class="flex-1 pr-2">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-mono">#${idx + 1}</span>
            <h4 class="font-semibold text-gray-800 text-sm">${item.name}</h4>
          </div>
          <div class="text-xs text-gray-500 mt-0.5">
            ฿${item.price.toFixed(2)} × ${item.qty} ${item.unit}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="updateCartQty('${item.id}', -1)" class="neu-btn w-7 h-7 text-xs font-bold text-gray-700">-</button>
          <span class="w-7 text-center font-bold text-sm text-slate-800">${item.qty}</span>
          <button onclick="updateCartQty('${item.id}', 1)" class="neu-btn w-7 h-7 text-xs font-bold text-gray-700">+</button>
        </div>

        <div class="w-20 text-right pl-2">
          <div class="font-bold text-slate-800 text-sm">฿${itemTotal.toFixed(2)}</div>
          <button onclick="updateCartQty('${item.id}', -${item.qty})" class="text-[11px] text-red-500 hover:underline">ลบ</button>
        </div>
      </div>
    `;
  }).join('');

  const vatAmount = totalAmount - (totalAmount / 1.07);
  const subtotalBeforeVat = totalAmount - vatAmount;

  if (countEl) countEl.innerText = `${totalQty} ชิ้น`;
  if (subtotalEl) subtotalEl.innerText = `฿${subtotalBeforeVat.toFixed(2)}`;
  if (vatEl) vatEl.innerText = `฿${vatAmount.toFixed(2)}`;
  if (grandTotalEl) grandTotalEl.innerText = `฿${totalAmount.toFixed(2)}`;

  updateHeldBillsUI();
  lucide.createIcons();
}

// ==========================================
// 5.1 HOLD BILL SYSTEM (ระบบพักบิล)
// ==========================================
function holdCurrentBill() {
  if (!AppState.cart || AppState.cart.length === 0) {
    showToast('ไม่มีรายการสินค้าในตะกร้าที่จะพักบิล', 'warning');
    return;
  }

  const grandTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalQty = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  const heldBill = {
    id: 'HOLD-' + Math.floor(1000 + Math.random() * 9000),
    time: new Date().toLocaleTimeString('th-TH'),
    date: new Date().toLocaleDateString('th-TH'),
    cashier: AppState.currentUser.name,
    items: JSON.parse(JSON.stringify(AppState.cart)),
    total: grandTotal,
    qty: totalQty
  };

  AppState.holdBills.unshift(heldBill);
  AppState.cart = [];
  AppState.save();
  renderCart();
  updateHeldBillsUI();
  SoundFX.beep();
  showToast(`พักบิลสำเร็จ (#${heldBill.id}) คิดเงินให้ลูกค้าคนถัดไปได้ทันที`, 'info', 3000);
}

function updateHeldBillsUI() {
  const btn = document.getElementById('btn-held-bills');
  const countEl = document.getElementById('held-bills-count');
  const count = AppState.holdBills ? AppState.holdBills.length : 0;

  if (countEl) countEl.innerText = count;
  if (btn) {
    if (count > 0) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }
}

function openHeldBillsModal() {
  const modal = document.getElementById('held-bills-modal');
  const container = document.getElementById('held-bills-list');
  const totalCountEl = document.getElementById('held-bills-total-count');

  if (!modal || !container) return;

  const count = AppState.holdBills ? AppState.holdBills.length : 0;
  if (totalCountEl) totalCountEl.innerText = `รวม ${count} บิลที่พักไว้`;

  if (count === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-400">
        <i data-lucide="archive" class="w-8 h-8 mx-auto mb-1 opacity-50"></i>
        <p class="text-xs">ไม่มีรายการบิลที่พักไว้</p>
      </div>
    `;
    lucide.createIcons();
    modal.classList.remove('hidden');
    return;
  }

  container.innerHTML = AppState.holdBills.map((bill) => `
    <div class="neu-box-sm p-3 flex items-center justify-between gap-3">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-bold text-xs text-amber-700 font-mono">#${bill.id}</span>
          <span class="text-[11px] text-slate-400 font-mono">${bill.time}</span>
        </div>
        <p class="text-xs text-slate-700 mt-0.5 line-clamp-1">
          ${bill.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
        </p>
        <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
          <span>รวม ${bill.qty} ชิ้น</span>
          <span class="font-bold text-slate-800 text-xs">฿${bill.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button onclick="recallHeldBill('${bill.id}')" class="neu-btn neu-btn-primary px-3 py-1.5 text-xs font-semibold">
          เรียกคืนบิล
        </button>
        <button onclick="deleteHeldBill('${bill.id}')" class="neu-btn p-1.5 text-slate-400 hover:text-red-500 text-xs" title="ยกเลิกบิลนี้">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  modal.classList.remove('hidden');
}

function closeHeldBillsModal() {
  document.getElementById('held-bills-modal')?.classList.add('hidden');
}

function recallHeldBill(billId) {
  const index = AppState.holdBills.findIndex(b => b.id === billId);
  if (index === -1) return;

  if (AppState.cart.length > 0) {
    if (!confirm('มีสินค้าอยู่ในตะกร้าปัจจุบัน ต้องการพักบิลปัจจุบันก่อนเรียกคืนบิลนี้หรือไม่?')) {
      return;
    }
    holdCurrentBill();
  }

  const bill = AppState.holdBills.splice(index, 1)[0];
  AppState.cart = bill.items;
  AppState.save();
  renderCart();
  updateHeldBillsUI();
  closeHeldBillsModal();
  SoundFX.beep();
  showToast(`เรียกคืนบิล #${bill.id} สำเร็จ`, 'success');
}

function deleteHeldBill(billId) {
  if (!confirm('ยืนยันลบบิลที่พักนี้หรือไม่?')) return;
  AppState.holdBills = AppState.holdBills.filter(b => b.id !== billId);
  AppState.save();
  updateHeldBillsUI();
  openHeldBillsModal();
  showToast('ลบบิลที่พักแล้ว', 'info');
}

// ==========================================
// 5.2 SHIFT REPORT & CASH RECONCILIATION (สรุปปิดกะ)
// ==========================================
function openShiftModal() {
  const modal = document.getElementById('shift-report-modal');
  if (!modal) return;

  let shiftCash = 0;
  let shiftQr = 0;
  let shiftCard = 0;
  let shiftBills = 0;

  AppState.salesHistory.forEach(s => {
    shiftBills += 1;
    if (s.paymentMethod === 'CASH') shiftCash += s.total;
    else if (s.paymentMethod === 'PROMPTPAY_QR') shiftQr += s.total;
    else if (s.paymentMethod === 'CREDIT_CARD') shiftCard += s.total;
  });

  const grossTotal = shiftCash + shiftQr + shiftCard;

  document.getElementById('shift-cashier-display').innerText = AppState.currentUser.name;
  document.getElementById('shift-bills-display').innerText = `รวมยอดขาย ${shiftBills} บิล`;
  document.getElementById('shift-cash-total').innerText = `฿${shiftCash.toFixed(2)}`;
  document.getElementById('shift-qr-total').innerText = `฿${shiftQr.toFixed(2)}`;
  document.getElementById('shift-card-total').innerText = `฿${shiftCard.toFixed(2)}`;
  document.getElementById('shift-gross-total').innerText = `฿${grossTotal.toFixed(2)}`;

  document.getElementById('shift-actual-cash').value = '';
  const diffBadge = document.getElementById('shift-diff-badge');
  diffBadge.className = 'liquid-pill px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 border-slate-300';
  diffBadge.innerText = 'ยังไม่ได้ระบุ';

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeShiftModal() {
  document.getElementById('shift-report-modal')?.classList.add('hidden');
}

function calculateShiftDifference() {
  let shiftCash = 0;
  AppState.salesHistory.forEach(s => {
    if (s.paymentMethod === 'CASH') shiftCash += s.total;
  });

  const actualVal = parseFloat(document.getElementById('shift-actual-cash').value);
  const diffBadge = document.getElementById('shift-diff-badge');

  if (isNaN(actualVal)) {
    diffBadge.className = 'liquid-pill px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 border-slate-300';
    diffBadge.innerText = 'ยังไม่ได้ระบุ';
    return;
  }

  const diff = actualVal - shiftCash;
  if (Math.abs(diff) < 0.01) {
    diffBadge.className = 'liquid-pill px-3 py-2 text-xs font-bold bg-emerald-100 text-emerald-800 border-emerald-300';
    diffBadge.innerText = 'ยอดเงินตรง พอดี ฿0.00';
  } else if (diff > 0) {
    diffBadge.className = 'liquid-pill px-3 py-2 text-xs font-bold bg-blue-100 text-blue-800 border-blue-300';
    diffBadge.innerText = `เงินเกิน +฿${diff.toFixed(2)}`;
  } else {
    diffBadge.className = 'liquid-pill px-3 py-2 text-xs font-bold bg-red-100 text-red-800 border-red-300';
    diffBadge.innerText = `เงินขาด -฿${Math.abs(diff).toFixed(2)}`;
  }
}

function printShiftReport() {
  let shiftCash = 0;
  let shiftQr = 0;
  let shiftCard = 0;
  let shiftBills = 0;

  AppState.salesHistory.forEach(s => {
    shiftBills += 1;
    if (s.paymentMethod === 'CASH') shiftCash += s.total;
    else if (s.paymentMethod === 'PROMPTPAY_QR') shiftQr += s.total;
    else if (s.paymentMethod === 'CREDIT_CARD') shiftCard += s.total;
  });

  const grossTotal = shiftCash + shiftQr + shiftCard;
  const actualVal = parseFloat(document.getElementById('shift-actual-cash').value) || shiftCash;
  const diff = actualVal - shiftCash;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('กรุณาอนุญาตป๊อปอัปเพื่อพิมพ์รายงานปิดกะ', 'warning');
    return;
  }

  printWindow.document.write(`
    <html>
    <head>
      <title>Shift Closing Report - 7-Eleven</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; max-width: 320px; margin: 0 auto; }
        .center { text-align: center; }
        .line { border-bottom: 1px dashed #333; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="center">
        <h2 style="margin:0;">7-ELEVEN</h2>
        <div>สาขา 12489 | เครื่อง POS #01</div>
        <div class="bold" style="margin-top:4px;">*** รายงานสรุปปิดกะ (Z-REPORT) ***</div>
      </div>
      <div class="line"></div>
      <div class="row"><span>วันที่-เวลา:</span><span>${new Date().toLocaleString('th-TH')}</span></div>
      <div class="row"><span>พนักงาน:</span><span>${AppState.currentUser.name}</span></div>
      <div class="row"><span>จำนวนบิลขาย:</span><span>${shiftBills} บิล</span></div>
      <div class="line"></div>
      <div class="row"><span>ยอดเงินสด (Cash):</span><span>฿${shiftCash.toFixed(2)}</span></div>
      <div class="row"><span>ยอด PromptPay QR:</span><span>฿${shiftQr.toFixed(2)}</span></div>
      <div class="row"><span>ยอดบัตรเครดิต EDC:</span><span>฿${shiftCard.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row bold" style="font-size:15px;"><span>ยอดขายรวม:</span><span>฿${grossTotal.toFixed(2)}</span></div>
      <div class="line"></div>
      <div class="row"><span>เงินสดนับจริง:</span><span>฿${actualVal.toFixed(2)}</span></div>
      <div class="row bold"><span>ส่วนต่าง (Diff):</span><span>${diff >= 0 ? '+' : ''}฿${diff.toFixed(2)}</span></div>
      <div class="line"></div>
      <br><br>
      <div class="center">
        <div>ลงชื่อ ..........................................</div>
        <div style="font-size:11px; margin-top:4px;">(${AppState.currentUser.name}) พนักงานแคชเชียร์</div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function closeShiftAndReset() {
  if (!confirm('ยืนยันปิดกะปัจจุบันและบันทึกข้อมูลหรือไม่?')) return;

  AppState.addAudit('SHIFT_CLOSE', `ปิดกะประจำวันที่ ${new Date().toLocaleDateString('th-TH')} โดย ${AppState.currentUser.name}`);
  showToast('ปิดกะและบันทึกข้อมูลเรียบร้อยแล้ว เริ่มต้นกะใหม่', 'success');
  closeShiftModal();
}

// ==========================================
// 6. PAYMENT MODULE (Cash, Dynamic QR, Card)
// ==========================================
let currentPaymentMethod = 'CASH';

function openPaymentModal() {
  if (AppState.cart.length === 0) {
    showToast('กรุณายิงบาร์โค้ดสินค้าก่อนชำระเงิน', 'warning');
    return;
  }

  const grandTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const modal = document.getElementById('payment-modal');
  document.getElementById('modal-pay-amount').innerText = `฿${grandTotal.toFixed(2)}`;
  
  setPaymentMethod('CASH');
  document.getElementById('cash-tendered-input').value = Math.ceil(grandTotal);
  calculateCashChange();

  modal.classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

function setPaymentMethod(method) {
  currentPaymentMethod = method;
  document.querySelectorAll('.pay-tab-btn').forEach(btn => btn.classList.remove('tab-active'));
  document.getElementById('btn-method-' + method.toLowerCase()).classList.add('tab-active');

  document.getElementById('pay-section-cash').classList.toggle('hidden', method !== 'CASH');
  document.getElementById('pay-section-qr').classList.toggle('hidden', method !== 'QR');
  document.getElementById('pay-section-card').classList.toggle('hidden', method !== 'CARD');

  if (method === 'QR') {
    generateDynamicPromptPayQR();
  }
}

function setTenderAmount(amount) {
  const input = document.getElementById('cash-tendered-input');
  input.value = amount;
  calculateCashChange();
}

function calculateCashChange() {
  const grandTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tendered = parseFloat(document.getElementById('cash-tendered-input').value) || 0;
  const change = tendered - grandTotal;

  const changeEl = document.getElementById('cash-change-display');
  const confirmBtn = document.getElementById('btn-confirm-cash-pay');

  if (change < 0) {
    changeEl.innerHTML = `<span class="text-red-500 font-bold">เงินยังขาดอีก ฿${Math.abs(change).toFixed(2)}</span>`;
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    changeEl.innerHTML = `<span class="text-emerald-600 font-bold">฿${change.toFixed(2)}</span>`;
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function generateDynamicPromptPayQR() {
  const grandTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const qrContainer = document.getElementById('promptpay-qr-box');
  const refCode = '711-' + Math.floor(100000 + Math.random() * 900000);
  document.getElementById('qr-ref-code').innerText = refCode;
  document.getElementById('qr-amount-display').innerText = `฿${grandTotal.toFixed(2)}`;

  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: `00020101021229370016A000000677010111011300668912345675802TH5303764540${grandTotal.toFixed(2).length < 10 ? '0' : ''}${grandTotal.toFixed(2).length}${grandTotal.toFixed(2)}6304${refCode}`,
    width: 180,
    height: 180,
    colorDark: "#1a202c",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

function simulateQRPaymentSuccess() {
  showToast('ได้รับคำขอยืนยันยอดเงินจากธนาคาร (PromptPay Webhook)...', 'info');
  setTimeout(() => {
    executeTransaction('PROMPTPAY_QR', 0);
  }, 1000);
}

function confirmCashPayment() {
  const grandTotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tendered = parseFloat(document.getElementById('cash-tendered-input').value) || 0;
  if (tendered < grandTotal) {
    showToast('จำนวนเงินสดไม่เพียงพอ!', 'error');
    return;
  }
  executeTransaction('CASH', tendered);
}

function confirmCardPayment() {
  showToast('ส่งสัญญาณ EDC เครื่องรูดบัตร...', 'info');
  setTimeout(() => {
    executeTransaction('CREDIT_CARD', 0);
  }, 1200);
}

function executeTransaction(method, tendered) {
  if (AppState.cart.length === 0) return;

  const totalAmount = AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vatAmount = totalAmount - (totalAmount / 1.07);
  const subtotalBeforeVat = totalAmount - vatAmount;
  const receiptNo = 'R711-' + Date.now().toString().slice(-8);
  const transId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  // ATOMIC STOCK CUT: ตัดสต็อกสินค้าหน้าร้าน (Shelf)
  for (const cartItem of AppState.cart) {
    const prod = AppState.products.find(p => p.id === cartItem.id);
    if (prod) {
      prod.shelf = Math.max(0, prod.shelf - cartItem.qty);
      AppState.addMovement('SALE', prod.id, -cartItem.qty, receiptNo, `ขายหน้าร้าน POS Terminal #1`);
    }
  }

  const saleRecord = {
    receiptNo: receiptNo,
    transId: transId,
    timestamp: new Date().toLocaleString('th-TH'),
    cashier: AppState.currentUser.name,
    items: JSON.parse(JSON.stringify(AppState.cart)),
    subtotal: subtotalBeforeVat,
    vat: vatAmount,
    total: totalAmount,
    tendered: tendered > 0 ? tendered : totalAmount,
    change: tendered > 0 ? (tendered - totalAmount) : 0,
    paymentMethod: method,
    status: 'SUCCESS'
  };

  AppState.salesHistory.unshift(saleRecord);

  // Update current cashier shift
  if (!AppState.cashierShift) {
    AppState.cashierShift = { startTime: new Date().toLocaleTimeString('th-TH'), billsCount: 0, cashTotal: 0, qrTotal: 0, cardTotal: 0 };
  }
  AppState.cashierShift.billsCount = (AppState.cashierShift.billsCount || 0) + 1;
  if (method === 'CASH') AppState.cashierShift.cashTotal = (AppState.cashierShift.cashTotal || 0) + totalAmount;
  else if (method === 'PROMPTPAY_QR') AppState.cashierShift.qrTotal = (AppState.cashierShift.qrTotal || 0) + totalAmount;
  else if (method === 'CREDIT_CARD') AppState.cashierShift.cardTotal = (AppState.cashierShift.cardTotal || 0) + totalAmount;

  AppState.addAudit('POS_SALE', `ออกใบเสร็จ ${receiptNo} ยอดรวม ฿${totalAmount.toFixed(2)} (${method}) โดย ${AppState.currentUser.name}`);
  AppState.save();

  SoundFX.success();
  closePaymentModal();
  showReceiptModal(saleRecord);

  AppState.cart = [];
  renderCart();
  renderQuickProducts();
}

function showReceiptModal(sale) {
  const container = document.getElementById('receipt-content');
  const modal = document.getElementById('receipt-modal');

  const itemsHtml = sale.items.map(item => `
    <div class="flex justify-between text-xs py-0.5">
      <span class="flex-1">${item.name}</span>
      <span class="w-10 text-center">${item.qty}</span>
      <span class="w-16 text-right">฿${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="text-center pb-3 border-b border-gray-300">
      <h2 class="text-lg font-bold tracking-widest text-gray-900">7-ELEVEN</h2>
      <p class="text-[11px] text-gray-600">สาขา ชุมชนวิศวกรรมไอที (สาขาที่ 12489)</p>
      <p class="text-[10px] text-gray-500">เลขประจำตัวผู้เสียภาษี: 0107542000011</p>
      <p class="text-[10px] text-gray-500">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
    </div>

    <div class="text-[11px] py-2 border-b border-dashed border-gray-300 space-y-0.5">
      <div class="flex justify-between"><span>วันที่:</span><span>${sale.timestamp}</span></div>
      <div class="flex justify-between"><span>เลขที่ใบเสร็จ:</span><span>${sale.receiptNo}</span></div>
      <div class="flex justify-between"><span>Transaction ID:</span><span>${sale.transId}</span></div>
      <div class="flex justify-between"><span>พนักงาน:</span><span>${sale.cashier}</span></div>
      <div class="flex justify-between"><span>ช่องทางชำระ:</span><span>${sale.paymentMethod}</span></div>
    </div>

    <div class="py-2 border-b border-dashed border-gray-300">
      <div class="flex justify-between text-[11px] font-bold pb-1 text-gray-700">
        <span class="flex-1">รายการ</span>
        <span class="w-10 text-center">จน.</span>
        <span class="w-16 text-right">จำนวนเงิน</span>
      </div>
      ${itemsHtml}
    </div>

    <div class="text-[12px] py-2 border-b border-gray-300 space-y-1">
      <div class="flex justify-between"><span>มูลค่าสินค้าก่อนภาษี:</span><span>฿${sale.subtotal.toFixed(2)}</span></div>
      <div class="flex justify-between"><span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span><span>฿${sale.vat.toFixed(2)}</span></div>
      <div class="flex justify-between font-bold text-sm text-gray-900"><span>ยอดรวมทั้งสิ้น:</span><span>฿${sale.total.toFixed(2)}</span></div>
      <div class="flex justify-between"><span>รับเงินมา:</span><span>฿${sale.tendered.toFixed(2)}</span></div>
      <div class="flex justify-between font-bold text-gray-900"><span>เงินทอน:</span><span>฿${sale.change.toFixed(2)}</span></div>
    </div>

    <div class="text-center pt-3 text-[10px] text-gray-500">
      <p>ALL member สะสมแต้มได้ทันที</p>
      <p>ขอบคุณที่ใช้บริการ 7-Eleven</p>
      <div class="mt-2 font-mono text-[9px] tracking-widest text-gray-400">||| | || ||||| || ||| |||| |||</div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeReceiptModal() {
  document.getElementById('receipt-modal').classList.add('hidden');
}

function printReceipt() {
  window.print();
}

// ==========================================
// 7. BACK OFFICE INVENTORY SUB-SYSTEMS
// ==========================================
function renderInventory() {
  const container = document.getElementById('inventory-table-body');
  if (!container) return;

  const searchQ = (document.getElementById('inv-search-input')?.value || '').toLowerCase();
  const catFilter = document.getElementById('inv-cat-filter')?.value || 'ALL';

  const filtered = AppState.products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(searchQ) || p.barcode.includes(searchQ) || p.sku.toLowerCase().includes(searchQ);
    const matchC = catFilter === 'ALL' || p.category.includes(catFilter);
    return matchQ && matchC;
  });

  container.innerHTML = filtered.map(p => {
    const totalQty = p.shelf + p.backroom;
    const isLowStock = totalQty <= p.reorderPoint;

    return `
      <tr class="hover:bg-white/40 transition">
        <td class="font-mono text-xs font-semibold text-slate-600">${p.sku}</td>
        <td class="font-mono text-xs text-gray-500">${p.barcode}</td>
        <td>
          <div class="font-semibold text-gray-800 text-sm">${p.name}</div>
          <div class="text-[11px] text-gray-400">${p.category}</div>
        </td>
        <td class="text-xs text-gray-600">฿${p.cost.toFixed(2)}</td>
        <td class="text-xs font-bold text-slate-800">฿${p.price.toFixed(2)}</td>
        <td class="text-center font-bold text-slate-700 bg-slate-100/50 rounded-lg py-1">${p.shelf} ${p.unit}</td>
        <td class="text-center font-semibold text-gray-600">${p.backroom} ${p.unit}</td>
        <td class="text-center text-xs text-amber-700 font-medium">${p.damaged}</td>
        <td class="text-center text-xs text-red-600 font-medium">${p.expired}</td>
        <td class="text-center font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-800'}">${totalQty}</td>
        <td class="text-center">
          ${isLowStock ? 
            '<span class="liquid-pill text-[10px] text-amber-700 bg-amber-100/80 border-amber-300">ควรสั่งเพิ่ม</span>' : 
            '<span class="liquid-pill text-[10px] text-emerald-700 bg-emerald-100/80 border-emerald-300">ปกติ</span>'
          }
        </td>
        <td class="text-center">
          <button onclick="openEditProductModal('${p.id}')" class="neu-btn px-2.5 py-1 text-xs text-slate-700 font-medium">แก้ไข</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderReceiving() {
  const select = document.getElementById('receive-product-select');
  if (!select) return;

  select.innerHTML = AppState.products.map(p => `
    <option value="${p.id}">${p.sku} - ${p.name} (คงเหลือ: ${p.shelf + p.backroom})</option>
  `).join('');

  document.getElementById('receive-lot-input').value = 'LOT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(10 + Math.random() * 90);
  document.getElementById('receive-mfd-input').value = getRelativeDate(0);
  document.getElementById('receive-exp-input').value = getRelativeDate(30);
}

function submitGoodsReceipt(event) {
  event.preventDefault();
  const prodId = document.getElementById('receive-product-select').value;
  const qty = parseInt(document.getElementById('receive-qty-input').value) || 0;
  const location = document.getElementById('receive-dest-select').value;
  const poNumber = document.getElementById('receive-po-input').value || ('PO-711-' + Math.floor(1000 + Math.random() * 9000));
  const lotNo = document.getElementById('receive-lot-input').value;
  const mfd = document.getElementById('receive-mfd-input').value;
  const exp = document.getElementById('receive-exp-input').value;

  if (qty <= 0) {
    showToast('กรุณาระบุจำนวนสินค้าที่ถูกต้อง', 'warning');
    return;
  }

  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  if (location === 'SHELF') {
    prod.shelf += qty;
  } else {
    prod.backroom += qty;
  }

  AppState.batches.push({
    batchNo: lotNo,
    productId: prod.id,
    mfd: mfd,
    exp: exp,
    qty: qty,
    location: location === 'SHELF' ? 'Shelf หน้าร้าน' : 'Backroom ห้องเก็บของ'
  });

  AppState.addMovement('RECEIVE', prod.id, qty, poNumber, `รับสินค้าเข้า ${location === 'SHELF' ? 'หน้าร้าน' : 'ห้องเก็บของ'} ล็อต ${lotNo}`);
  AppState.addAudit('GOODS_RECEIPT', `รับสินค้า ${prod.name} จำนวน ${qty} ${prod.unit} เลขที่เอกสาร ${poNumber}`);
  AppState.save();

  SoundFX.beep();
  showToast(`บันทึกรับสินค้า ${prod.name} +${qty} สำเร็จ`, 'success');
  renderReceiving();
  document.getElementById('receive-qty-input').value = '';
}

function renderTransfer() {
  const select = document.getElementById('transfer-product-select');
  if (!select) return;

  select.innerHTML = AppState.products.map(p => `
    <option value="${p.id}">${p.sku} - ${p.name} (ในห้องเก็บของ: ${p.backroom} ${p.unit})</option>
  `).join('');

  updateTransferPreview();
}

function updateTransferPreview() {
  const prodId = document.getElementById('transfer-product-select').value;
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  document.getElementById('transfer-backroom-count').innerText = `${prod.backroom} ${prod.unit}`;
  document.getElementById('transfer-shelf-count').innerText = `${prod.shelf} ${prod.unit}`;
}

function submitStockTransfer() {
  const prodId = document.getElementById('transfer-product-select').value;
  const qty = parseInt(document.getElementById('transfer-qty-input').value) || 0;
  const prod = AppState.products.find(p => p.id === prodId);

  if (!prod || qty <= 0) {
    showToast('กรุณาระบุจำนวนสินค้าที่ต้องการเติม', 'warning');
    return;
  }

  if (qty > prod.backroom) {
    SoundFX.error();
    showToast(`สินค้าในห้องเก็บของมีเพียง ${prod.backroom} ${prod.unit}`, 'warning');
    return;
  }

  prod.backroom -= qty;
  prod.shelf += qty;

  AppState.addMovement('TRANSFER', prod.id, qty, 'TR-' + Date.now().toString().slice(-4), `โอนสินค้าจากห้องเก็บของ -> ชั้นวางหน้าร้าน`);
  AppState.addAudit('STOCK_TRANSFER', `เติมสินค้า ${prod.name} จากห้องเก็บของไปหน้าร้าน จำนวน ${qty} ${prod.unit}`);
  AppState.save();

  SoundFX.beep();
  showToast(`เติมสินค้า ${prod.name} สู่หน้าร้าน +${qty} สำเร็จ`, 'success');
  updateTransferPreview();
  document.getElementById('transfer-qty-input').value = '';
}

function renderCounting() {
  const container = document.getElementById('counting-table-body');
  if (!container) return;

  container.innerHTML = AppState.products.map(p => {
    const sysTotal = p.shelf + p.backroom;
    return `
      <tr>
        <td class="font-mono text-xs font-semibold text-slate-600">${p.sku}</td>
        <td>
          <div class="font-semibold text-gray-800 text-sm">${p.name}</div>
          <div class="text-[11px] text-gray-400">ชั้นวาง: ${p.shelf} | สต็อกหลังร้าน: ${p.backroom}</div>
        </td>
        <td class="text-center font-bold text-slate-700">${sysTotal} ${p.unit}</td>
        <td class="text-center">
          <input type="number" id="count-input-${p.id}" value="${sysTotal}" oninput="calcCountDiff('${p.id}', ${sysTotal})" class="neu-input w-24 text-center py-1 text-sm font-semibold" />
        </td>
        <td class="text-center font-bold text-sm" id="count-diff-${p.id}">
          <span class="text-gray-400">0</span>
        </td>
        <td class="text-center">
          <button onclick="approveStockAdjustment('${p.id}')" class="neu-btn px-3 py-1 text-xs text-slate-800 font-semibold">
            อนุมัติปรับยอด
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function calcCountDiff(prodId, sysTotal) {
  const actual = parseInt(document.getElementById('count-input-' + prodId).value) || 0;
  const diff = actual - sysTotal;
  const el = document.getElementById('count-diff-' + prodId);
  if (!el) return;

  if (diff === 0) {
    el.innerHTML = '<span class="text-gray-400">0</span>';
  } else if (diff > 0) {
    el.innerHTML = `<span class="text-emerald-600 font-bold">+${diff}</span>`;
  } else {
    el.innerHTML = `<span class="text-red-500 font-bold">${diff}</span>`;
  }
}

function approveStockAdjustment(prodId) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const actual = parseInt(document.getElementById('count-input-' + prodId).value);
  const currentTotal = prod.shelf + prod.backroom;
  const diff = actual - currentTotal;

  if (isNaN(actual) || actual < 0) {
    showToast('กรุณาระบุจำนวนยอดนับที่ถูกต้อง', 'warning');
    return;
  }

  if (diff === 0) {
    showToast('ยอดนับตรงกับในระบบ ไม่มีการปรับยอด', 'info');
    return;
  }

  if (confirm(`ผู้จัดการยืนยันการอนุมัติปรับยอดสินค้า "${prod.name}" จากเดิม ${currentTotal} เป็น ${actual} (ส่วนต่าง ${diff > 0 ? '+' : ''}${diff}) หรือไม่?`)) {
    prod.shelf = Math.max(0, prod.shelf + diff);
    AppState.addMovement('ADJUST', prod.id, diff, 'ADJ-APPRV', `ผู้จัดการอนุมัติปรับยอดผลต่างการตรวจนับสต็อก`);
    AppState.addAudit('STOCK_ADJUSTMENT', `อนุมัติปรับยอด ${prod.name} ส่วนต่าง ${diff} (เดิม: ${currentTotal}, ใหม่: ${actual})`);
    AppState.save();

    SoundFX.beep();
    showToast(`ปรับยอดสต็อก ${prod.name} สำเร็จ`, 'success');
    renderCounting();
  }
}

function renderExpiry() {
  const container = document.getElementById('expiry-table-body');
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = AppState.batches.map((b, idx) => {
    const prod = AppState.products.find(p => p.id === b.productId);
    const isExpired = b.exp <= today;
    const diffTime = new Date(b.exp) - new Date(today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `
      <tr class="hover:bg-white/40">
        <td class="font-mono text-xs font-semibold text-slate-600">${b.batchNo}</td>
        <td>
          <div class="font-semibold text-gray-800 text-sm">${prod ? prod.name : b.productId}</div>
          <div class="text-[11px] text-gray-400">ตำแหน่ง: ${b.location}</div>
        </td>
        <td class="text-xs text-gray-600">${b.mfd}</td>
        <td class="text-xs font-bold ${isExpired ? 'text-red-600' : 'text-slate-800'}">${b.exp}</td>
        <td class="text-center font-bold text-sm">${b.qty}</td>
        <td class="text-center">
          ${isExpired ? 
            '<span class="liquid-pill text-[10px] text-red-700 bg-red-100/90 border-red-300 font-bold">หมดอายุแล้ว (ห้ามขาย)</span>' :
            (diffDays <= 7 ? 
              `<span class="liquid-pill text-[10px] text-amber-700 bg-amber-100/90 border-amber-300 font-bold">ใกล้หมดอายุ (${diffDays} วัน)</span>` :
              '<span class="liquid-pill text-[10px] text-emerald-700 bg-emerald-100/90 border-emerald-300 font-bold">ยังไม่หมดอายุ</span>'
            )
          }
        </td>
        <td class="text-center">
          <button onclick="writeOffExpiredBatch(${idx})" class="neu-btn px-2.5 py-1 text-xs text-red-600 font-semibold hover:bg-red-500 hover:text-white">
            ตัดจำหน่าย / ย้ายทิ้ง
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function writeOffExpiredBatch(batchIndex) {
  const batch = AppState.batches[batchIndex];
  if (!batch) return;
  const prod = AppState.products.find(p => p.id === batch.productId);

  if (confirm(`ต้องการตัดจำหน่ายสินค้าล็อต ${batch.batchNo} (${batch.qty} ชิ้น) ออกจากสต็อกหรือไม่?`)) {
    if (prod) {
      prod.expired = (prod.expired || 0) + batch.qty;
      prod.shelf = Math.max(0, prod.shelf - batch.qty);
      AppState.addMovement('EXPIRED', prod.id, -batch.qty, 'WO-' + batch.batchNo, 'ตัดจำหน่ายสินค้าหมดอายุ');
    }
    AppState.batches.splice(batchIndex, 1);
    AppState.addAudit('EXPIRED_WRITEOFF', `ตัดจำหน่ายล็อตหมดอายุ ${batch.batchNo}`);
    AppState.save();

    SoundFX.beep();
    showToast('บันทึกการตัดจำหน่ายเรียบร้อยแล้ว', 'success');
    renderExpiry();
  }
}

function renderMovements() {
  const container = document.getElementById('movements-table-body');
  if (!container) return;

  const typeFilter = document.getElementById('movement-type-filter')?.value || 'ALL';
  const filtered = AppState.movements.filter(m => typeFilter === 'ALL' || m.type === typeFilter);

  container.innerHTML = filtered.map(m => {
    let typeBadge = '';
    if (m.type === 'RECEIVE') typeBadge = '<span class="liquid-pill text-[10px] text-emerald-700 bg-emerald-100 border-emerald-300">รับสินค้าเข้า</span>';
    else if (m.type === 'SALE') typeBadge = '<span class="liquid-pill text-[10px] text-blue-700 bg-blue-100 border-blue-300">ขายหน้าร้าน</span>';
    else if (m.type === 'TRANSFER') typeBadge = '<span class="liquid-pill text-[10px] text-purple-700 bg-purple-100 border-purple-300">โอนย้ายสต็อก</span>';
    else if (m.type === 'ADJUST') typeBadge = '<span class="liquid-pill text-[10px] text-amber-700 bg-amber-100 border-amber-300">ปรับยอดสต็อก</span>';
    else if (m.type === 'EXPIRED') typeBadge = '<span class="liquid-pill text-[10px] text-red-700 bg-red-100 border-red-300">ตัดสินค้าหมดอายุ</span>';
    else typeBadge = `<span class="liquid-pill text-[10px] text-gray-700">${m.type}</span>`;

    return `
      <tr>
        <td class="font-mono text-xs text-gray-500">${m.id}</td>
        <td class="text-xs text-gray-600">${m.date}</td>
        <td class="text-center">${typeBadge}</td>
        <td>
          <div class="font-semibold text-gray-800 text-sm">${m.productName}</div>
          <div class="text-[11px] text-gray-400 font-mono">${m.ref}</div>
        </td>
        <td class="text-center font-bold text-sm ${m.qty > 0 ? 'text-emerald-600' : 'text-slate-800'}">
          ${m.qty > 0 ? '+' : ''}${m.qty}
        </td>
        <td class="text-xs text-gray-600">${m.operator}</td>
        <td class="text-xs text-gray-500">${m.note}</td>
      </tr>
    `;
  }).join('');
}

function renderAudit() {
  const container = document.getElementById('audit-table-body');
  if (!container) return;

  container.innerHTML = AppState.auditLogs.map(log => `
    <tr>
      <td class="text-xs text-gray-500 font-mono whitespace-nowrap">${log.timestamp}</td>
      <td class="text-xs font-semibold text-slate-700 whitespace-nowrap">${log.user}</td>
      <td class="text-center">
        <span class="liquid-badge px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800 bg-slate-200/60">${log.action}</span>
      </td>
      <td class="text-xs text-gray-700">${log.details}</td>
    </tr>
  `).join('');
}

function renderDashboard() {
  const totalSales = AppState.salesHistory.reduce((sum, s) => sum + s.total, 0);
  const totalBills = AppState.salesHistory.length;
  const lowStockCount = AppState.products.filter(p => (p.shelf + p.backroom) <= p.reorderPoint).length;
  const today = new Date().toISOString().split('T')[0];
  const expiredCount = AppState.batches.filter(b => b.exp <= today).length;

  document.getElementById('dash-total-sales').innerText = `฿${totalSales.toFixed(2)}`;
  document.getElementById('dash-bill-count').innerText = `${totalBills} บิล`;
  document.getElementById('dash-lowstock-count').innerText = `${lowStockCount} รายการ`;
  document.getElementById('dash-expired-count').innerText = `${expiredCount} รายการ`;

  const recentSalesEl = document.getElementById('dash-recent-sales');
  if (recentSalesEl) {
    if (AppState.salesHistory.length === 0) {
      recentSalesEl.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">ยังไม่มียอดขายในระบบ</p>';
    } else {
      recentSalesEl.innerHTML = AppState.salesHistory.slice(0, 5).map(s => `
        <div class="neu-inset-sm p-2.5 flex items-center justify-between text-xs mb-1.5">
          <div>
            <span class="font-mono font-bold text-slate-700">${s.receiptNo}</span>
            <span class="text-gray-400 ml-2">(${s.paymentMethod})</span>
            <div class="text-[10px] text-gray-500">${s.timestamp}</div>
          </div>
          <div class="font-bold text-sm text-slate-800">฿${s.total.toFixed(2)}</div>
        </div>
      `).join('');
    }
  }

  const lowStockListEl = document.getElementById('dash-lowstock-list');
  if (lowStockListEl) {
    const lowProds = AppState.products.filter(p => (p.shelf + p.backroom) <= p.reorderPoint);
    if (lowProds.length === 0) {
      lowStockListEl.innerHTML = '<p class="text-xs text-emerald-600 text-center py-4">สต็อกสินค้าทุกรายการอยู่ในเกณฑ์ปกติ</p>';
    } else {
      lowStockListEl.innerHTML = lowProds.map(p => `
        <div class="flex items-center justify-between py-2 border-b border-gray-200/40 text-xs">
          <div>
            <span class="font-semibold text-gray-800">${p.name}</span>
            <span class="text-gray-400 text-[11px] block font-mono">คงเหลือรวม: ${p.shelf + p.backroom} (ขั้นต่ำ: ${p.reorderPoint})</span>
          </div>
          <button onclick="switchBackTab('transfer-tab')" class="neu-btn px-2 py-1 text-[11px] text-slate-700">เติมของ</button>
        </div>
      `).join('');
    }
  }
}

// Product Edit/Add Modal
function setSampleProductImage() {
  const category = document.getElementById('prod-form-category')?.value || '';
  const samples = {
    'เครื่องดื่ม': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=350&auto=format&fit=crop&q=70',
    'อาหารพร้อมรับประทาน': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=350&auto=format&fit=crop&q=70',
    'เบเกอรี่': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=350&auto=format&fit=crop&q=70',
    'ขนมขบเคี้ยว': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=350&auto=format&fit=crop&q=70',
    'ของใช้ส่วนตัว': 'https://images.unsplash.com/photo-1559591937-e1032b4b4556?w=350&auto=format&fit=crop&q=70',
    'อาหารแห้ง': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=350&auto=format&fit=crop&q=70'
  };
  const url = samples[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=350&auto=format&fit=crop&q=70';
  const imgInput = document.getElementById('prod-form-image');
  if (imgInput) imgInput.value = url;
}

function openAddProductModal() {
  document.getElementById('product-modal-title').innerText = 'เพิ่มสินค้าใหม่';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-sku').value = 'SKU-' + Math.floor(100 + Math.random() * 900);
  document.getElementById('prod-form-barcode').value = '8850' + Math.floor(100000000 + Math.random() * 900000000);
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-category').value = 'เครื่องดื่ม';
  document.getElementById('prod-form-cost').value = '10.00';
  document.getElementById('prod-form-price').value = '15.00';
  document.getElementById('prod-form-unit').value = 'ชิ้น';
  document.getElementById('prod-form-shelf').value = '20';
  document.getElementById('prod-form-backroom').value = '50';
  document.getElementById('prod-form-reorder').value = '25';
  
  const imgInput = document.getElementById('prod-form-image');
  if (imgInput) imgInput.value = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=350&auto=format&fit=crop&q=70';

  document.getElementById('product-edit-modal').classList.remove('hidden');
}

function openEditProductModal(id) {
  const prod = AppState.products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('product-modal-title').innerText = 'แก้ไขข้อมูลสินค้า';
  document.getElementById('prod-form-id').value = prod.id;
  document.getElementById('prod-form-sku').value = prod.sku;
  document.getElementById('prod-form-barcode').value = prod.barcode;
  document.getElementById('prod-form-name').value = prod.name;
  document.getElementById('prod-form-category').value = prod.category;
  document.getElementById('prod-form-cost').value = prod.cost;
  document.getElementById('prod-form-price').value = prod.price;
  document.getElementById('prod-form-unit').value = prod.unit;
  document.getElementById('prod-form-shelf').value = prod.shelf;
  document.getElementById('prod-form-backroom').value = prod.backroom;
  document.getElementById('prod-form-reorder').value = prod.reorderPoint;
  
  const imgInput = document.getElementById('prod-form-image');
  if (imgInput) imgInput.value = prod.image || '';

  document.getElementById('product-edit-modal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-edit-modal').classList.add('hidden');
}

function saveProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('prod-form-id').value;
  const sku = document.getElementById('prod-form-sku').value.trim();
  const barcode = document.getElementById('prod-form-barcode').value.trim();
  const name = document.getElementById('prod-form-name').value.trim();
  const category = document.getElementById('prod-form-category').value;
  const image = (document.getElementById('prod-form-image')?.value || '').trim();
  const cost = parseFloat(document.getElementById('prod-form-cost').value) || 0;
  const price = parseFloat(document.getElementById('prod-form-price').value) || 0;
  const unit = document.getElementById('prod-form-unit').value.trim();
  const shelf = parseInt(document.getElementById('prod-form-shelf').value) || 0;
  const backroom = parseInt(document.getElementById('prod-form-backroom').value) || 0;
  const reorder = parseInt(document.getElementById('prod-form-reorder').value) || 0;

  if (!sku || !barcode || !name) {
    showToast('กรุณากรอกข้อมูลสินค้าให้ครบถ้วน', 'warning');
    return;
  }

  const finalImg = image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=350&auto=format&fit=crop&q=70';

  if (id) {
    const prod = AppState.products.find(p => p.id === id);
    if (prod) {
      prod.sku = sku;
      prod.barcode = barcode;
      prod.name = name;
      prod.category = category;
      prod.image = finalImg;
      prod.cost = cost;
      prod.price = price;
      prod.unit = unit;
      prod.shelf = shelf;
      prod.backroom = backroom;
      prod.reorderPoint = reorder;
      AppState.addAudit('PRODUCT_UPDATE', `แก้ไขข้อมูลสินค้า ${name} (${sku})`);
    }
  } else {
    const newProd = {
      id: 'P' + Date.now().toString().slice(-4),
      sku: sku,
      barcode: barcode,
      name: name,
      category: category,
      image: finalImg,
      cost: cost,
      price: price,
      unit: unit,
      shelf: shelf,
      backroom: backroom,
      damaged: 0,
      expired: 0,
      minStock: Math.floor(reorder / 2),
      reorderPoint: reorder,
      status: 'ACTIVE',
      isFood: category.includes('อาหาร')
    };
    AppState.products.push(newProd);
    AppState.addAudit('PRODUCT_CREATE', `เพิ่มสินค้าใหม่ ${name} (${sku})`);
  }

  AppState.save();
  closeProductModal();
  renderInventory();
  renderQuickProducts();
  showToast('บันทึกข้อมูลสินค้าเรียบร้อย', 'success');
}

// Toast System
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let borderColor = 'rgba(255,255,255,0.8)';
  let iconName = 'info';
  let textColor = 'text-slate-800';

  if (type === 'error') {
    borderColor = 'rgba(229, 62, 62, 0.7)';
    iconName = 'alert-triangle';
    textColor = 'text-red-700';
  } else if (type === 'success') {
    borderColor = 'rgba(56, 161, 105, 0.7)';
    iconName = 'check-circle';
    textColor = 'text-emerald-800';
  } else if (type === 'warning') {
    borderColor = 'rgba(221, 107, 32, 0.7)';
    iconName = 'alert-circle';
    textColor = 'text-amber-800';
  }

  toast.className = `liquid-pill px-4 py-2.5 shadow-lg border text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 bg-white/85 ${textColor}`;
  toast.style.borderColor = borderColor;
  toast.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i> <span>${message}</span>`;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// 8. INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  switchSystemMode('FRONT');

  // Load from Central Backend if available
  AppState.initSync();

  const barcodeInput = document.getElementById('pos-barcode-input');
  if (barcodeInput) {
    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        posScanProduct(barcodeInput.value);
      }
    });
  }

  // Update clock every second
  setInterval(() => {
    const clockEl = document.getElementById('header-clock');
    if (clockEl) {
      clockEl.innerText = new Date().toLocaleTimeString('th-TH');
    }
  }, 1000);

  // Soft background sync every 10 seconds for real-time multi-device sync
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      AppState.initSync();
    }
  }, 10000);
});
