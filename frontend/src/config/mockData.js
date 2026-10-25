// ─────────────────────────────────────────────────────────────────────────────
// PRADEEP ENTERPRISES — DEMO MOCK DATA
// All sample data for interview / offline demo mode
// ─────────────────────────────────────────────────────────────────────────────

const today = new Date();
const d = (offsetDays) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString();
};

// ── STAFF / USERS ────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { _id: 'staff_001', name: 'Ravi Kumar',    phone: '9876543210', role: 'Staff', area: 'PENNAGARAM',      base_salary: 18000, advanceOutstanding: 2000, createdAt: d(-60) },
  { _id: 'staff_002', name: 'Meena Devi',    phone: '9865432101', role: 'Staff', area: 'PALACODE',        base_salary: 16000, advanceOutstanding: 0,    createdAt: d(-90) },
  { _id: 'staff_003', name: 'Suresh Babu',   phone: '9754321098', role: 'Staff', area: 'HARUR',           base_salary: 20000, advanceOutstanding: 5000, createdAt: d(-120) },
  { _id: 'staff_004', name: 'Kavitha R',     phone: '9643210987', role: 'Staff', area: 'HOSUR',           base_salary: 17500, advanceOutstanding: 1500, createdAt: d(-45) },
  { _id: 'staff_005', name: 'Murugan S',     phone: '9532109876', role: 'Staff', area: 'THOPPUR',         base_salary: 19000, advanceOutstanding: 0,    createdAt: d(-75) },
  { _id: 'staff_006', name: 'Lakshmi P',     phone: '9421098765', role: 'Staff', area: 'K-GIRI',          base_salary: 15000, advanceOutstanding: 3000, createdAt: d(-30) },
  { _id: 'admin_001', name: 'Pradeep Admin', phone: '7010425239', role: 'Admin', area: '',                base_salary: 0,     advanceOutstanding: 0,    createdAt: d(-365) },
];

// ── TASKS ────────────────────────────────────────────────────────────────────
export const MOCK_TASKS = [
  { _id: 'task_001', clientName: 'Sri Lakshmi Traders',       notes: 'Pipe fitting and valve replacement at main unit',   status: 'Completed',   priority: 'Normal', date: d(-2),  completedAt: d(-1), updatedAt: d(-1), assignedTo: { _id: 'staff_001', name: 'Ravi Kumar'  }, area: 'PENNAGARAM' },
  { _id: 'task_002', clientName: 'Krishna Rice Mills',         notes: 'Motor pump installation — 5HP motor setup',         status: 'In Progress', priority: 'Urgent', date: d(0),   completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_002', name: 'Meena Devi'  }, area: 'PALACODE'  },
  { _id: 'task_003', clientName: 'Annamalai Constructions',    notes: 'Electrical panel inspection and rewiring',           status: 'Pending',     priority: 'Normal', date: d(1),   completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_003', name: 'Suresh Babu' }, area: 'HARUR'     },
  { _id: 'task_004', clientName: 'Murugan Cold Storage',       notes: 'Cooling unit servicing and refrigerant top-up',      status: 'Completed',   priority: 'Normal', date: d(-5),  completedAt: d(-4), updatedAt: d(-4), assignedTo: { _id: 'staff_004', name: 'Kavitha R'   }, area: 'HOSUR'     },
  { _id: 'task_005', clientName: 'Durgadevi Textiles',         notes: 'Generator maintenance and oil change',               status: 'Completed',   priority: 'Normal', date: d(-8),  completedAt: d(-7), updatedAt: d(-7), assignedTo: { _id: 'staff_005', name: 'Murugan S'   }, area: 'THOPPUR'   },
  { _id: 'task_006', clientName: 'Selva Granite Works',        notes: 'Water pump alignment and pressure check',            status: 'In Progress', priority: 'Normal', date: d(0),   completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_006', name: 'Lakshmi P'   }, area: 'K-GIRI'   },
  { _id: 'task_007', clientName: 'Bharath Flour Mill',         notes: 'Belt drive replacement and lubrication',             status: 'Pending',     priority: 'Urgent', date: d(2),   completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_001', name: 'Ravi Kumar'  }, area: 'PENNAGARAM' },
  { _id: 'task_008', clientName: 'Vignesh Poultry Farm',       notes: 'Borewell motor rewinding and testing',               status: 'Completed',   priority: 'Normal', date: d(-12), completedAt: d(-11),updatedAt: d(-11),assignedTo: { _id: 'staff_003', name: 'Suresh Babu' }, area: 'HARUR'     },
  { _id: 'task_009', clientName: 'GVK Hotel Supplies',         notes: 'CCTV and intercom system installation',              status: 'Pending',     priority: 'Normal', date: d(3),   completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_002', name: 'Meena Devi'  }, area: 'PALACODE'  },
  { _id: 'task_010', clientName: 'Sun Fiber Products',         notes: 'Transformer inspection and earthing check',          status: 'In Progress', priority: 'Normal', date: d(-1),  completedAt: null,  updatedAt: d(0),  assignedTo: { _id: 'staff_005', name: 'Murugan S'   }, area: 'THOPPUR'   },
  { _id: 'task_011', clientName: 'SKM Egg Products',           notes: 'Cooling tower repair and pipe leak fix',             status: 'Completed',   priority: 'Normal', date: d(-14), completedAt: d(-13),updatedAt: d(-13),assignedTo: { _id: 'staff_004', name: 'Kavitha R'   }, area: 'HOSUR'     },
  { _id: 'task_012', clientName: 'Ponni Rice Industry',        notes: 'Panel wiring and load balancing',                   status: 'Completed',   priority: 'Normal', date: d(-20), completedAt: d(-19),updatedAt: d(-19),assignedTo: { _id: 'staff_006', name: 'Lakshmi P'   }, area: 'K-GIRI'   },
];

// ── ATTENDANCE ───────────────────────────────────────────────────────────────
export const MOCK_ATTENDANCE = [
  // Today
  { _id: 'att_001', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, status: 'Present', location: { lat: 12.2253, lng: 78.1584 }, createdAt: d(0)  },
  { _id: 'att_002', userId: { _id: 'staff_002', name: 'Meena Devi'  }, status: 'Present', location: { lat: 12.0195, lng: 78.2451 }, createdAt: d(0)  },
  { _id: 'att_003', userId: { _id: 'staff_003', name: 'Suresh Babu' }, status: 'Absent',  location: null,                           createdAt: d(0)  },
  { _id: 'att_004', userId: { _id: 'staff_004', name: 'Kavitha R'   }, status: 'Present', location: { lat: 12.7358, lng: 77.8251 }, createdAt: d(0)  },
  { _id: 'att_005', userId: { _id: 'staff_005', name: 'Murugan S'   }, status: 'Present', location: { lat: 11.6834, lng: 78.5612 }, createdAt: d(0)  },
  { _id: 'att_006', userId: { _id: 'staff_006', name: 'Lakshmi P'   }, status: 'Present', location: { lat: 12.3915, lng: 78.2153 }, createdAt: d(0)  },
  // Yesterday
  { _id: 'att_007', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, status: 'Present', location: { lat: 12.2253, lng: 78.1584 }, createdAt: d(-1) },
  { _id: 'att_008', userId: { _id: 'staff_002', name: 'Meena Devi'  }, status: 'Present', location: { lat: 12.0195, lng: 78.2451 }, createdAt: d(-1) },
  { _id: 'att_009', userId: { _id: 'staff_003', name: 'Suresh Babu' }, status: 'Present', location: { lat: 12.1621, lng: 78.3789 }, createdAt: d(-1) },
  { _id: 'att_010', userId: { _id: 'staff_004', name: 'Kavitha R'   }, status: 'Absent',  location: null,                           createdAt: d(-1) },
  { _id: 'att_011', userId: { _id: 'staff_005', name: 'Murugan S'   }, status: 'Present', location: { lat: 11.6834, lng: 78.5612 }, createdAt: d(-1) },
  { _id: 'att_012', userId: { _id: 'staff_006', name: 'Lakshmi P'   }, status: 'Present', location: { lat: 12.3915, lng: 78.2153 }, createdAt: d(-1) },
  // 2 days ago
  { _id: 'att_013', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, status: 'Present', location: { lat: 12.2253, lng: 78.1584 }, createdAt: d(-2) },
  { _id: 'att_014', userId: { _id: 'staff_002', name: 'Meena Devi'  }, status: 'Absent',  location: null,                           createdAt: d(-2) },
  { _id: 'att_015', userId: { _id: 'staff_003', name: 'Suresh Babu' }, status: 'Present', location: { lat: 12.1621, lng: 78.3789 }, createdAt: d(-2) },
  { _id: 'att_016', userId: { _id: 'staff_004', name: 'Kavitha R'   }, status: 'Present', location: { lat: 12.7358, lng: 77.8251 }, createdAt: d(-2) },
  { _id: 'att_017', userId: { _id: 'staff_005', name: 'Murugan S'   }, status: 'Present', location: { lat: 11.6834, lng: 78.5612 }, createdAt: d(-2) },
  { _id: 'att_018', userId: { _id: 'staff_006', name: 'Lakshmi P'   }, status: 'Present', location: { lat: 12.3915, lng: 78.2153 }, createdAt: d(-2) },
];

// ── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  { _id: 'txn_001', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, type: 'Salary',     amount: 18000, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_002', userId: { _id: 'staff_002', name: 'Meena Devi'  }, type: 'Salary',     amount: 16000, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_003', userId: { _id: 'staff_003', name: 'Suresh Babu' }, type: 'Advance',    amount: 5000,  description: 'Medical advance',                      createdAt: d(-10) },
  { _id: 'txn_004', userId: { _id: 'staff_004', name: 'Kavitha R'   }, type: 'Salary',     amount: 17500, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_005', userId: { _id: 'staff_005', name: 'Murugan S'   }, type: 'Salary',     amount: 19000, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_006', userId: { _id: 'staff_006', name: 'Lakshmi P'   }, type: 'Advance',    amount: 3000,  description: 'House rent advance',                   createdAt: d(-15) },
  { _id: 'txn_007', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, type: 'Incentive',  amount: 2500,  description: 'Best performance - September',         createdAt: d(-3)  },
  { _id: 'txn_008', userId: { _id: 'staff_002', name: 'Meena Devi'  }, type: 'Collection', amount: 45000, description: 'Client payment - Krishna Rice Mills',  createdAt: d(-2)  },
  { _id: 'txn_009', userId: { _id: 'staff_005', name: 'Murugan S'   }, type: 'Incentive',  amount: 1500,  description: 'Field target achieved',                createdAt: d(-1)  },
  { _id: 'txn_010', userId: { _id: 'staff_004', name: 'Kavitha R'   }, type: 'Collection', amount: 32000, description: 'Client payment - Murugan Cold Storage',createdAt: d(-4)  },
  { _id: 'txn_011', userId: { _id: 'staff_003', name: 'Suresh Babu' }, type: 'Salary',     amount: 20000, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_012', userId: { _id: 'staff_006', name: 'Lakshmi P'   }, type: 'Salary',     amount: 15000, description: 'October 2025 salary',                  createdAt: d(-5)  },
  { _id: 'txn_013', userId: { _id: 'staff_001', name: 'Ravi Kumar'  }, type: 'Collection', amount: 28000, description: 'Client payment - Bharath Flour Mill',  createdAt: d(-7)  },
  { _id: 'txn_014', userId: { _id: 'staff_004', name: 'Kavitha R'   }, type: 'Incentive',  amount: 2000,  description: 'Monthly target bonus',                 createdAt: d(-2)  },
];

// ── INVENTORY ────────────────────────────────────────────────────────────────
export const MOCK_INVENTORY = [
  { _id: 'inv_001', name: 'Copper Wire 2.5mm',    category: 'Electrical',   quantity: 250, unit: 'meters',  minQty: 50,  price: 85,   supplier: 'Vijaya Electricals',  updatedAt: d(-2) },
  { _id: 'inv_002', name: 'PVC Pipe 1 inch',      category: 'Plumbing',     quantity: 80,  unit: 'pieces',  minQty: 20,  price: 120,  supplier: 'Raja Plumbing Stores',updatedAt: d(-3) },
  { _id: 'inv_003', name: 'Motor Bearings 6205',  category: 'Mechanical',   quantity: 12,  unit: 'pieces',  minQty: 15,  price: 350,  supplier: 'SKF Bearings India',  updatedAt: d(-1) },
  { _id: 'inv_004', name: 'MCB 32A Single Pole',  category: 'Electrical',   quantity: 35,  unit: 'pieces',  minQty: 10,  price: 280,  supplier: 'Legrand India',       updatedAt: d(-5) },
  { _id: 'inv_005', name: 'Gate Valve 2 inch',    category: 'Plumbing',     quantity: 8,   unit: 'pieces',  minQty: 5,   price: 650,  supplier: 'Kirloskar Brothers',  updatedAt: d(-4) },
  { _id: 'inv_006', name: 'V-Belt A42',           category: 'Mechanical',   quantity: 20,  unit: 'pieces',  minQty: 10,  price: 180,  supplier: 'Gates India',         updatedAt: d(-2) },
  { _id: 'inv_007', name: 'Lubrication Oil 5L',   category: 'Consumables',  quantity: 6,   unit: 'cans',    minQty: 10,  price: 420,  supplier: 'Castrol India',       updatedAt: d(-1) },
  { _id: 'inv_008', name: 'Cable Ties 300mm',     category: 'Electrical',   quantity: 500, unit: 'pieces',  minQty: 100, price: 5,    supplier: 'Local Supplier',      updatedAt: d(-7) },
  { _id: 'inv_009', name: 'PVC Conduit 20mm',     category: 'Electrical',   quantity: 150, unit: 'meters',  minQty: 30,  price: 22,   supplier: 'Finolex Industries',  updatedAt: d(-3) },
  { _id: 'inv_010', name: 'Grease Cartridge',     category: 'Consumables',  quantity: 18,  unit: 'pieces',  minQty: 5,   price: 95,   supplier: 'CRC Industries',      updatedAt: d(-6) },
];

// ── TODAY ATTENDANCE SUMMARY ─────────────────────────────────────────────────
export const MOCK_STAFF_STOCK_SUMMARY = { totalStaff: 6, presentToday: 5 };
export const MOCK_TODAY_SUMMARY = { totalStaff: 6, presentToday: 5 };

// ── STAFF PROFILE (for staff portal demo) ───────────────────────────────────
export const MOCK_STAFF_PROFILE = {
  _id: 'staff_001', name: 'Ravi Kumar', phone: '9876543210',
  role: 'Staff', area: 'PENNAGARAM', base_salary: 18000,
  advanceOutstanding: 2000, token: 'demo_token_staff_001',
};

// ── STAFF-SPECIFIC DATA ──────────────────────────────────────────────────────
export const MOCK_STAFF_TASKS        = MOCK_TASKS.filter(t => t.assignedTo._id === 'staff_001');
export const MOCK_STAFF_ATTENDANCE   = MOCK_ATTENDANCE.filter(a => a.userId._id === 'staff_001');
export const MOCK_STAFF_TRANSACTIONS = MOCK_TRANSACTIONS.filter(t => t.userId._id === 'staff_001');

// ── STOCK BAGS ───────────────────────────────────────────────────────────────
export const MOCK_STOCK_BAGS = [
  { _id: 'bag_001', staffId: 'staff_001', items: [
    { name: 'Copper Wire 2.5mm', qty: 20, unit: 'meters' },
    { name: 'MCB 32A Single Pole', qty: 3, unit: 'pieces' },
    { name: 'Cable Ties 300mm', qty: 50, unit: 'pieces' },
  ], updatedAt: d(-1) },
];

// ── STAFF HOLDINGS ───────────────────────────────────────────────────────────
export const MOCK_STAFF_HOLDINGS = [
  { _id: 'staff_001', name: 'Ravi Kumar',  area: 'PENNAGARAM', holdingValue: 4800, items: [{ name: 'Copper Wire 2.5mm', qty: 20, unit: 'meters' }, { name: 'MCB 32A', qty: 2, unit: 'pieces' }] },
  { _id: 'staff_002', name: 'Meena Devi',  area: 'PALACODE',   holdingValue: 3200, items: [{ name: 'PVC Pipe 1 inch',   qty: 8,  unit: 'pieces' }, { name: 'Gate Valve 2 inch', qty: 1, unit: 'pieces' }] },
  { _id: 'staff_003', name: 'Suresh Babu', area: 'HARUR',      holdingValue: 6100, items: [{ name: 'Motor Bearings 6205', qty: 4, unit: 'pieces' }, { name: 'V-Belt A42', qty: 3, unit: 'pieces' }] },
  { _id: 'staff_004', name: 'Kavitha R',   area: 'HOSUR',      holdingValue: 2700, items: [{ name: 'PVC Conduit 20mm', qty: 30, unit: 'meters' }] },
  { _id: 'staff_005', name: 'Murugan S',   area: 'THOPPUR',    holdingValue: 5400, items: [{ name: 'Lubrication Oil 5L', qty: 2, unit: 'cans' }, { name: 'Grease Cartridge', qty: 5, unit: 'pieces' }] },
  { _id: 'staff_006', name: 'Lakshmi P',   area: 'K-GIRI',     holdingValue: 1500, items: [{ name: 'Cable Ties 300mm', qty: 100, unit: 'pieces' }] },
];

// ── LOCATION TRACKING ────────────────────────────────────────────────────────
export const MOCK_LOCATIONS = [
  { userId: 'staff_001', name: 'Ravi Kumar',  area: 'PENNAGARAM', lat: 12.2953, lng: 78.1784, lastSeen: d(0) },
  { userId: 'staff_002', name: 'Meena Devi',  area: 'PALACODE',   lat: 12.0395, lng: 78.2651, lastSeen: d(0) },
  { userId: 'staff_003', name: 'Suresh Babu', area: 'HARUR',      lat: 12.1821, lng: 78.3989, lastSeen: d(0) },
  { userId: 'staff_004', name: 'Kavitha R',   area: 'HOSUR',      lat: 12.7558, lng: 77.8451, lastSeen: d(0) },
  { userId: 'staff_005', name: 'Murugan S',   area: 'THOPPUR',    lat: 11.7034, lng: 78.5812, lastSeen: d(0) },
  { userId: 'staff_006', name: 'Lakshmi P',   area: 'K-GIRI',     lat: 12.4115, lng: 78.2353, lastSeen: d(0) },
];
