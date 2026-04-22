/**
 * Integrated Payment System — Authentication
 */

const auth = {
  _hash(password) {
    // Simple deterministic hash for demo (not for production)
    let h = 0;
    const str = password + 'ips_salt_2024';
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return h.toString(16);
  },

  register(name, email, password, role = 'customer') {
    // Check email not already taken
    const tables = { customer: 'customers', admin: 'admins', supplier: 'suppliers' };
    const table = tables[role] || 'customers';

    const exists = db.findOne(table, r => r.email === email);
    if (exists) return { ok: false, msg: 'Email already registered.' };

    const record = {
      name,
      email,
      password_hash: this._hash(password),
      phone: '',
      billing_address: '',
      role
    };

    if (role === 'customer') {
      record.billing_address = '';
    } else if (role === 'supplier') {
      record.contact_email = email;
      record.api_endpoint = '';
      record.vendor_code = utils.generateSKU('VND');
    }

    const newUser = db.insert(table, record);
    return { ok: true, user: newUser };
  },

  login(email, password) {
    const hash = this._hash(password);
    const tables = ['admins', 'customers', 'suppliers'];

    for (const table of tables) {
      const user = db.findOne(table, r => r.email === email && r.password_hash === hash);
      if (user) {
        const roleMap = { admins: 'admin', customers: 'customer', suppliers: 'supplier' };
        const session = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleMap[table],
          table
        };
        localStorage.setItem('ips_session', JSON.stringify(session));
        return { ok: true, session };
      }
    }
    return { ok: false, msg: 'Invalid email or password.' };
  },

  logout() {
    localStorage.removeItem('ips_session');
    window.location.href = this._basePath() + 'account.html';
  },

  getSession() {
    try { return JSON.parse(localStorage.getItem('ips_session') || 'null'); }
    catch(e) { return null; }
  },

  isLoggedIn() { return !!this.getSession(); },

  requireRole(role) {
    const session = this.getSession();
    if (!session) {
      window.location.href = this._basePath() + 'account.html';
      return false;
    }
    if (role && session.role !== role) {
      utils.toast('Access denied. Redirecting...', 'error');
      setTimeout(() => { window.location.href = this._basePath() + 'index.html'; }, 1000);
      return false;
    }
    return true;
  },

  requireAny(...roles) {
    const session = this.getSession();
    if (!session || !roles.includes(session.role)) {
      window.location.href = this._basePath() + 'account.html';
      return false;
    }
    return true;
  },

  _basePath() {
    const p = window.location.pathname.replace(/\\/g, '/');
    return (p.includes('/admin/') || p.includes('/supplier/')) ? '../' : '';
  }
};
