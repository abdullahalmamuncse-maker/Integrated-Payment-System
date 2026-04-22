/**
 * Integrated Payment System — Shared Navigation
 * Injects navbar into every page dynamically
 */

function initNav() {
  const session = auth.getSession();
  const isSubpage = window.location.pathname.replace(/\\/g, '/').match(/\/(admin|supplier)\//);
  const base = isSubpage ? '../' : '';

  const cartCount = session && session.role === 'customer' ? cart.count() : 0;
  const cartBadgeStyle = cartCount > 0 ? 'display:flex' : 'display:none';

  let userMenu = '';
  if (session) {
    const dashLink = session.role === 'admin'
      ? `${base}admin/index.html`
      : session.role === 'supplier'
        ? `${base}supplier/index.html`
        : `${base}orders.html`;

    userMenu = `
      <span class="nav-user">
        <span class="nav-role-badge role-${session.role}">${session.role}</span>
        <span class="nav-username">${session.name}</span>
      </span>
      <a href="${dashLink}" class="nav-link">Dashboard</a>
      <a href="#" onclick="auth.logout();return false;" class="nav-link nav-logout">Logout</a>
    `;
  } else {
    userMenu = `<a href="${base}account.html" class="nav-link">Login / Register</a>`;
  }

  const html = `
    <nav class="ips-nav">
      <div class="nav-container">
        <a href="${base}index.html" class="nav-brand">
          <span class="brand-icon">💳</span>
          <span class="brand-name">Integrated Payment System</span>
        </a>
        <div class="nav-links" id="navLinks">
          <a href="${base}index.html"    class="nav-link">Home</a>
          <a href="${base}products.html" class="nav-link">Products</a>
          ${session && session.role === 'customer' ? `
            <a href="${base}orders.html"   class="nav-link">My Orders</a>
          ` : ''}
          <a href="${base}account.html"  class="nav-link">Account</a>
          ${userMenu}
          ${session && session.role === 'customer' ? `
            <a href="${base}cart.html" class="nav-cart-btn">
              🛒 Cart
              <span id="cart-badge" class="cart-badge" style="${cartBadgeStyle}">${cartCount}</span>
            </a>
          ` : ''}
        </div>
        <button class="nav-toggle" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button>
      </div>
    </nav>
  `;

  const container = document.getElementById('nav-container');
  if (container) container.innerHTML = html;
}

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Load DB + seed
  if (typeof seedDatabase === 'function') seedDatabase();
  // Init nav
  initNav();
});
