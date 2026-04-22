/**
 * Integrated Payment System — Database Engine
 * Simulates a relational database using localStorage
 */

const TABLES = {
  customers:        'ips_customers',
  admins:           'ips_admins',
  suppliers:        'ips_suppliers',
  products:         'ips_products',
  inventory:        'ips_inventory',
  orders:           'ips_orders',
  order_items:      'ips_order_items',
  payments:         'ips_payments',
  transactions:     'ips_transactions',
  fx_rates:         'ips_fx_rates',
  commissions:      'ips_commissions',
  product_sync_logs:'ips_product_sync_logs',
  notifications:    'ips_notifications',
  cart:             'ips_cart'
};

const db = {
  get(table) {
    try { return JSON.parse(localStorage.getItem(TABLES[table]) || '[]'); }
    catch(e) { return []; }
  },

  _set(table, data) {
    localStorage.setItem(TABLES[table], JSON.stringify(data));
  },

  _nextId(table) {
    const data = this.get(table);
    if (!data.length) return 1;
    return Math.max(...data.map(r => r.id || 0)) + 1;
  },

  insert(table, record) {
    const data = this.get(table);
    const newRecord = {
      id: record.id || this._nextId(table),
      ...record,
      created_at: record.created_at || new Date().toISOString()
    };
    data.push(newRecord);
    this._set(table, data);
    return newRecord;
  },

  update(table, id, fields) {
    const data = this.get(table);
    const idx = data.findIndex(r => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...fields, updated_at: new Date().toISOString() };
    this._set(table, data);
    return data[idx];
  },

  delete(table, id) {
    this._set(table, this.get(table).filter(r => r.id !== id));
  },

  find(table, id) {
    return this.get(table).find(r => r.id === id) || null;
  },

  findOne(table, filterFn) {
    return this.get(table).find(filterFn) || null;
  },

  query(table, filterFn) {
    return this.get(table).filter(filterFn);
  },

  count(table, filterFn = null) {
    const data = this.get(table);
    return filterFn ? data.filter(filterFn).length : data.length;
  },

  sum(table, field, filterFn = null) {
    const data = filterFn ? this.get(table).filter(filterFn) : this.get(table);
    return data.reduce((s, r) => s + (parseFloat(r[field]) || 0), 0);
  },

  clear(table) { localStorage.removeItem(TABLES[table]); },

  clearAll() {
    Object.values(TABLES).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('ips_seeded');
    localStorage.removeItem('ips_session');
  }
};
