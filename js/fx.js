/**
 * Integrated Payment System — FX Rate & Commission Helpers
 */

const fx = {
  getActive() {
    const rates = db.get('fx_rates').sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
    return rates[0] || { rate_to_bdt: 110, currency_code: 'USD' };
  },

  toUSD(bdt) {
    const rate = this.getActive().rate_to_bdt;
    return parseFloat((parseFloat(bdt) / rate).toFixed(2));
  },

  toBDT(usd) {
    const rate = this.getActive().rate_to_bdt;
    return parseFloat((parseFloat(usd) * rate).toFixed(2));
  },

  currentRate() {
    return this.getActive().rate_to_bdt;
  }
};

const commission = {
  getForSupplier(supplierId) {
    const now = new Date();
    const rules = db.query('commissions', r =>
      r.supplier_id === supplierId &&
      new Date(r.effective_from) <= now &&
      new Date(r.effective_to) >= now
    );
    return rules[0] || null;
  },

  calculate(supplierId, subtotalBDT) {
    const rule = this.getForSupplier(supplierId);
    if (!rule) return 0;
    const pctFee  = parseFloat(subtotalBDT) * (rule.percentage / 100);
    const fixedFee = parseFloat(rule.fixed_fee_bdt);
    return parseFloat((pctFee + fixedFee).toFixed(2));
  },

  calculateForCart(cartItems) {
    let total = 0;
    cartItems.forEach(item => {
      const product = db.find('products', item.product_id);
      if (product) total += this.calculate(product.supplier_id, item.subtotal_bdt);
    });
    return parseFloat(total.toFixed(2));
  }
};
