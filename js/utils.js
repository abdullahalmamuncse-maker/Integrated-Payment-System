/**
 * Integrated Payment System — Utility Functions
 */

const utils = {
  formatBDT(amount) {
    const n = parseFloat(amount) || 0;
    return '৳ ' + n.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatUSD(amount) {
    const n = parseFloat(amount) || 0;
    return '$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  },

  formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
  },

  statusBadge(status) {
    const map = {
      pending:    { color: '#f59e0b', bg: '#fef3c7' },
      processing: { color: '#3b82f6', bg: '#dbeafe' },
      confirmed:  { color: '#8b5cf6', bg: '#ede9fe' },
      shipped:    { color: '#06b6d4', bg: '#cffafe' },
      delivered:  { color: '#10b981', bg: '#d1fae5' },
      cancelled:  { color: '#ef4444', bg: '#fee2e2' },
      paid:       { color: '#10b981', bg: '#d1fae5' },
      failed:     { color: '#ef4444', bg: '#fee2e2' },
      refunded:   { color: '#6b7280', bg: '#f3f4f6' },
      active:     { color: '#10b981', bg: '#d1fae5' },
      inactive:   { color: '#6b7280', bg: '#f3f4f6' },
    };
    const s = (status || 'pending').toLowerCase();
    const style = map[s] || { color: '#6b7280', bg: '#f3f4f6' };
    return `<span class="badge" style="color:${style.color};background:${style.bg};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${s.charAt(0).toUpperCase()+s.slice(1)}</span>`;
  },

  generateTxnId() {
    return 'IPS-' + Math.random().toString(36).substr(2,9).toUpperCase();
  },

  generateSKU(prefix) {
    return (prefix || 'PRD') + '-' + Date.now().toString().slice(-6);
  },

  getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  toast(message, type = 'success') {
    let t = document.getElementById('ips-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ips-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 22px;border-radius:10px;color:#fff;font-weight:600;font-size:14px;z-index:9999;opacity:0;transition:opacity 0.3s;box-shadow:0 4px 20px rgba(0,0,0,0.15);';
      document.body.appendChild(t);
    }
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#4f46e5' };
    t.style.background = colors[type] || colors.info;
    t.textContent = message;
    t.style.opacity = '1';
    setTimeout(() => { t.style.opacity = '0'; }, 3000);
  },

  confirm(message) {
    return window.confirm(message);
  },

  stars(rating) {
    const r = Math.round(parseFloat(rating) || 0);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  },

  imgPath(filename, depth = 0) {
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    return prefix + 'images/' + filename;
  },

  getDepth() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/admin/') || p.includes('/supplier/')) return 1;
    return 0;
  }
};
