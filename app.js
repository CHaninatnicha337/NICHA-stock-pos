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
    category: "เครื่องดื่ม / นม",
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
    name: "ข้าวผัดไส้กรอก (ล็อตทดสอบหมดอายุ GS1)",
    category: "อาหารพร้อมรับประทาน",
    cost: 26.0,
    price: 39.0,
    unit: "กล่อง",
    shelf: 3,
    backroom: 0,
    damaged: 0,
    expired: 2,
    minStock: 5,
    reorderPoint: 15,
    status: "ACTIVE",
    isFood: true,
    testExpired: true
  },
  {
    id: "P006",
    sku: "B006",
    barcode: "8850123456064",
    name: "ขนมปังแซนด์วิช ฟาร์มเฮ้าส์",
    category: "เบเกอรี่",
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
    batchNo: "LOT-202611-EXPIRED",
    productId: "P005",
    mfd: getRelativeDate(-10),
    exp: getRelativeDate(-1),
    qty: 5,
    location: "Shelf & Expired Bin"
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
  }

  resetAllData() {
    localStorage.removeItem('seven_products');
    localStorage.removeItem('seven_batches');
    localStorage.removeItem('seven_movements');
    localStorage.removeItem('seven_sales');
    localStorage.removeItem('seven_audit');
    this.loadState();
    this.cart = [];
    this.save();
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
    frontView.classList.remove('hidden');
    backView.classList.add('hidden');
    btnFront.classList.add('mode-switch-active');
    btnBack.classList.remove('mode-switch-active');
    renderPOS();
    showToast('เข้าสู่ระบบหน้าร้าน: เครื่อง POS คิดเงิน', 'info', 1800);
  } else {
    // Check permission: If user is Cashier, give a security hint
    if (AppState.currentUser.roleKey === 'CASHIER') {
      const pin = prompt('ระบบหลังร้าน (Back Office) ต้องใช้รหัสยืนยันผู้จัดการ (PIN ผู้จัดการเริ่มต้นคือ 1234):');
      if (pin !== '1234') {
        SoundFX.error();
        showToast('รหัสผ่านไม่ถูกต้อง! ปฏิเสธการเข้าถึงระบบหลังร้าน', 'error');
        return;
      }
      showToast('ยืนยันสิทธิ์ผู้จัดการสำเร็จ เข้าสู่ระบบหลังร้าน', 'success');
      AppState.addAudit('MANAGER_OVERRIDE', 'พนักงานแคชเชียร์ใช้ PIN ผู้จัดการเข้าสู่ระบบหลังร้าน');
    }

    frontView.classList.add('hidden');
    backView.classList.remove('hidden');
    btnFront.classList.remove('mode-switch-active');
    btnBack.classList.add('mode-switch-active');
    switchBackTab('dashboard-tab');
    showToast('เข้าสู่ระบบหลังร้าน (Back Office Management)', 'info', 1800);
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
  if (target) target.classList.remove('hidden');

  // Update Active Header Label
  const labelEl = document.getElementById('current-back-tab-label');
  if (labelEl) {
    labelEl.innerText = customLabel || TAB_LABELS[tabId] || 'เมนูระบบหลังร้าน';
  }

  if (tabId === 'dashboard-tab') renderDashboard();
  if (tabId === 'inventory-tab') renderInventory();
  if (tabId === 'receiving-tab') renderReceiving();
  if (tabId === 'transfer-tab') renderTransfer();
  if (tabId === 'counting-tab') renderCounting();
  if (tabId === 'expiry-tab') renderExpiry();
  if (tabId === 'movements-tab') renderMovements();
  if (tabId === 'audit-tab') renderAudit();
}

// Hamburger Menu Navigation Functions
function openHamburgerMenu() {
  const modal = document.getElementById('hamburger-menu-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeHamburgerMenu() {
  const modal = document.getElementById('hamburger-menu-modal');
  if (modal) modal.classList.add('hidden');
}

function selectHamburgerTab(tabId, label) {
  switchBackTab(tabId, label);
  closeHamburgerMenu();
  showToast(`เปิดหน้า: ${label}`, 'info', 1800);
}

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
function renderPOS() {
  renderCart();
  renderQuickProducts();
}

function renderQuickProducts() {
  const container = document.getElementById('pos-quick-products');
  if (!container) return;
  
  const query = (document.getElementById('pos-search-input')?.value || '').toLowerCase();
  const filterCat = document.getElementById('pos-cat-filter')?.value || 'ALL';

  const filtered = AppState.products.filter(p => {
    const matchQ = p.name.toLowerCase().includes(query) || p.barcode.includes(query) || p.sku.toLowerCase().includes(query);
    const matchC = filterCat === 'ALL' || p.category.includes(filterCat);
    return matchQ && matchC;
  });

  container.innerHTML = filtered.map(p => {
    const isOutOfStock = p.shelf <= 0;
    const isTestExpired = p.testExpired;

    return `
      <div onclick="posScanProduct('${p.barcode}')" class="neu-box-sm p-3 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition relative group ${isOutOfStock ? 'opacity-50' : ''}">
        ${isTestExpired ? '<span class="absolute top-2 right-2 liquid-badge text-[10px] text-red-600 font-bold px-1.5 py-0.5 bg-red-100/70 border border-red-300">GS1 EXPIRED</span>' : ''}
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-500 font-mono">${p.sku}</span>
            <span class="liquid-pill text-[11px] font-semibold text-slate-700 bg-white/70">หน้าร้าน: ${p.shelf} ${p.unit}</span>
          </div>
          <h4 class="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight">${p.name}</h4>
          <p class="text-[11px] text-gray-500 mt-1 font-mono">${p.barcode}</p>
        </div>
        <div class="mt-3 flex items-center justify-between pt-2 border-t border-gray-200/50">
          <span class="text-base font-bold text-slate-800">฿${p.price.toFixed(2)}</span>
          <button class="neu-btn px-2.5 py-1 text-xs text-slate-700 font-semibold group-hover:bg-slate-700 group-hover:text-white transition">
            + ยิงขาย
          </button>
        </div>
      </div>
    `;
  }).join('');
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

  lucide.createIcons();
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

  if (id) {
    const prod = AppState.products.find(p => p.id === id);
    if (prod) {
      prod.sku = sku;
      prod.barcode = barcode;
      prod.name = name;
      prod.category = category;
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

  const barcodeInput = document.getElementById('pos-barcode-input');
  if (barcodeInput) {
    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        posScanProduct(barcodeInput.value);
      }
    });
  }

  setInterval(() => {
    const clockEl = document.getElementById('header-clock');
    if (clockEl) {
      clockEl.innerText = new Date().toLocaleTimeString('th-TH');
    }
  }, 1000);
});
