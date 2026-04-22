/**
 * Integrated Payment System — Cart Management
 */

const cart = {
  _userId() {
    const s = auth.getSession();
    return s ? s.id : null;
  },

  get() {
    const uid = this._userId();
    if (!uid) return [];
    return db.query('cart', r => r.customer_id === uid);
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.quantity, 0);
  },

  add(productId, quantity = 1, size = '') {
    const uid = this._userId();
    if (!uid) { utils.toast('Please login to add items to cart.', 'error'); return false; }

    const product = db.find('products', productId);
    if (!product) return false;

    const inv = db.findOne('inventory', r => r.product_id === productId);
    const available = inv ? (inv.stock_qty - inv.reserved_qty) : product.stock_qty;
    if (quantity > available) { utils.toast('Insufficient stock.', 'error'); return false; }

    const existing = db.findOne('cart', r => r.customer_id === uid && r.product_id === productId && r.size === size);
    if (existing) {
      db.update('cart', existing.id, {
        quantity: existing.quantity + quantity,
        subtotal_bdt: parseFloat(((existing.quantity + quantity) * product.price_bdt).toFixed(2))
      });
    } else {
      db.insert('cart', {
        customer_id: uid,
        product_id: productId,
        quantity,
        size,
        unit_price_bdt: product.price_bdt,
        subtotal_bdt: parseFloat((quantity * product.price_bdt).toFixed(2))
      });
    }

    // Reserve in inventory
    if (inv) db.update('inventory', inv.id, { reserved_qty: (inv.reserved_qty || 0) + quantity });

    this._updateBadge();
    utils.toast('Added to cart!', 'success');
    return true;
  },

  updateQty(cartItemId, quantity) {
    const item = db.find('cart', cartItemId);
    if (!item) return;
    const product = db.find('products', item.product_id);
    const diff = quantity - item.quantity;

    db.update('cart', cartItemId, {
      quantity,
      subtotal_bdt: parseFloat((quantity * item.unit_price_bdt).toFixed(2))
    });

    const inv = db.findOne('inventory', r => r.product_id === item.product_id);
    if (inv) db.update('inventory', inv.id, { reserved_qty: Math.max(0, (inv.reserved_qty || 0) + diff) });

    this._updateBadge();
  },

  remove(cartItemId) {
    const item = db.find('cart', cartItemId);
    if (!item) return;
    const inv = db.findOne('inventory', r => r.product_id === item.product_id);
    if (inv) db.update('inventory', inv.id, { reserved_qty: Math.max(0, (inv.reserved_qty || 0) - item.quantity) });
    db.delete('cart', cartItemId);
    this._updateBadge();
  },

  clear() {
    const items = this.get();
    items.forEach(item => {
      const inv = db.findOne('inventory', r => r.product_id === item.product_id);
      if (inv) db.update('inventory', inv.id, { reserved_qty: Math.max(0, (inv.reserved_qty || 0) - item.quantity) });
      db.delete('cart', item.id);
    });
    this._updateBadge();
  },

  totals() {
    const items = this.get();
    const subtotal = items.reduce((s, i) => s + parseFloat(i.subtotal_bdt), 0);
    const commissionFee = commission.calculateForCart(items);
    const total = subtotal + commissionFee;
    return { subtotal: parseFloat(subtotal.toFixed(2)), commissionFee: parseFloat(commissionFee.toFixed(2)), total: parseFloat(total.toFixed(2)) };
  },

  _updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) { const c = this.count(); badge.textContent = c; badge.style.display = c > 0 ? 'flex' : 'none'; }
  }
};
