/**
 * Integrated Payment System — Data Seeder
 * Runs once on first load to populate all tables
 */

function seedDatabase() {
  if (localStorage.getItem('ips_seeded') === 'true') return;

  // ── Admins ──────────────────────────────────────────────
  db.insert('admins', { id:1, name:'System Admin', email:'admin@ips.com', password_hash: auth._hash('admin123'), role:'superadmin' });

  // ── Suppliers ───────────────────────────────────────────
  db.insert('suppliers', { id:1, name:'FashionHub Ltd.', contact_email:'supplier@ips.com', password_hash: auth._hash('supplier123'), api_endpoint:'https://api.fashionhub.com', vendor_code:'VND-FH001' });
  db.insert('suppliers', { id:2, name:'SportGear Pro', contact_email:'sportgear@ips.com',  password_hash: auth._hash('sport123'),    api_endpoint:'https://api.sportgear.com',  vendor_code:'VND-SG002' });

  // ── FX Rates ────────────────────────────────────────────
  db.insert('fx_rates', { id:1, currency_code:'USD', rate_to_bdt:110.00, source:'Bangladesh Bank', effective_at: new Date().toISOString() });

  // ── Commissions ─────────────────────────────────────────
  db.insert('commissions', { id:1, supplier_id:1, percentage:8.0,  fixed_fee_bdt:50,  effective_from:'2024-01-01T00:00:00.000Z', effective_to:'2099-12-31T23:59:59.000Z' });
  db.insert('commissions', { id:2, supplier_id:2, percentage:10.0, fixed_fee_bdt:100, effective_from:'2024-01-01T00:00:00.000Z', effective_to:'2099-12-31T23:59:59.000Z' });

  // ── Products (12 from RedStore catalog) ─────────────────
  const fxRate = 110.0;
  const products = [
    { id:1,  supplier_id:1, sku:'TSHRT-001', title:'Red Printed T-Shirt',     description:'Bold red graphic tee, 100% cotton, perfect for casual wear.',        price_usd:15,  category:'Tops',       image:'product-1.jpg',  stock_qty:50, rating:4.5 },
    { id:2,  supplier_id:1, sku:'SHIRT-002', title:'Casual Blue Shirt',        description:'Classic blue cotton shirt, slim fit, ideal for everyday styling.',   price_usd:18,  category:'Tops',       image:'product-2.jpg',  stock_qty:40, rating:4.2 },
    { id:3,  supplier_id:2, sku:'SHOE-003',  title:'Sport Running Shoes',      description:'Lightweight running shoes with superior grip and cushioning.',        price_usd:45,  category:'Footwear',   image:'product-3.jpg',  stock_qty:30, rating:4.7 },
    { id:4,  supplier_id:2, sku:'SNKR-004',  title:'Classic White Sneakers',   description:'Timeless white sneakers that match any outfit effortlessly.',        price_usd:55,  category:'Footwear',   image:'product-4.jpg',  stock_qty:25, rating:4.4 },
    { id:5,  supplier_id:1, sku:'JEAN-005',  title:'Slim Fit Denim Jeans',     description:'Premium denim jeans with a modern slim fit and stretch comfort.',    price_usd:35,  category:'Bottoms',    image:'product-5.jpg',  stock_qty:60, rating:4.3 },
    { id:6,  supplier_id:1, sku:'DRES-006',  title:'Floral Summer Dress',      description:'Light floral dress made for warm days and breezy evenings.',         price_usd:28,  category:'Dresses',    image:'product-6.jpg',  stock_qty:35, rating:4.6 },
    { id:7,  supplier_id:2, sku:'JCKT-007',  title:'Leather Biker Jacket',     description:'Full-grain leather jacket with quilted lining and side zippers.',    price_usd:120, category:'Outerwear',  image:'product-7.jpg',  stock_qty:15, rating:4.8 },
    { id:8,  supplier_id:1, sku:'HOOD-008',  title:'Pullover Hoodie',          description:'Cozy cotton-blend hoodie with kangaroo pocket and ribbed cuffs.',    price_usd:40,  category:'Tops',       image:'product-8.jpg',  stock_qty:45, rating:4.5 },
    { id:9,  supplier_id:1, sku:'POLO-009',  title:'Cotton Polo Shirt',        description:'Classic polo shirt in premium pique cotton for a polished look.',    price_usd:22,  category:'Tops',       image:'product-9.jpg',  stock_qty:55, rating:4.1 },
    { id:10, supplier_id:2, sku:'SHRT-010',  title:'Athletic Shorts',          description:'Moisture-wicking athletic shorts with elastic waistband and drawstring.', price_usd:20, category:'Bottoms', image:'product-10.jpg', stock_qty:70, rating:4.3 },
    { id:11, supplier_id:2, sku:'BLZR-011',  title:'Formal Slim Blazer',       description:'Tailored slim-fit blazer in premium wool-blend fabric.',             price_usd:85,  category:'Outerwear',  image:'product-11.jpg', stock_qty:20, rating:4.7 },
    { id:12, supplier_id:2, sku:'TRAK-012',  title:'Track Suit Set',           description:'Matching track jacket and pants in breathable polyester fabric.',    price_usd:65,  category:'Activewear', image:'product-12.jpg', stock_qty:30, rating:4.4 },
  ];

  products.forEach(p => {
    db.insert('products', {
      ...p,
      price_bdt: parseFloat((p.price_usd * fxRate).toFixed(2)),
      fx_rate_id: 1,
      commission_id: p.supplier_id === 1 ? 1 : 2,
      last_synced_at: new Date().toISOString()
    });
    // Inventory record
    db.insert('inventory', {
      product_id: p.id,
      supplier_id: p.supplier_id,
      stock_qty: p.stock_qty,
      reserved_qty: 0,
      updated_at: new Date().toISOString()
    });
    // Sync log
    db.insert('product_sync_logs', {
      supplier_id: p.supplier_id,
      product_id: p.id,
      action: 'initial_sync',
      old_price: 0,
      new_price: p.price_usd,
      old_stock: 0,
      new_stock: p.stock_qty,
      sync_time: new Date().toISOString(),
      notes: 'Initial product seeding'
    });
  });

  // ── Sample Customer ──────────────────────────────────────
  db.insert('customers', { id:1, name:'Demo Customer', email:'customer@ips.com', password_hash: auth._hash('customer123'), phone:'01700000000', billing_address:'123 Dhaka, Bangladesh' });

  // ── Sample Order ─────────────────────────────────────────
  const now = new Date().toISOString();
  db.insert('orders', { id:1, customer_id:1, total_amount_bdt:3300.00, status:'delivered', created_at:now, confirmed_at:now });
  db.insert('order_items', { id:1, order_id:1, product_id:1, quantity:2, unit_price_bdt:1650.00, subtotal_bdt:3300.00 });
  db.insert('payments', { id:1, order_id:1, amount_bdt:3300.00, method:'Mobile Banking', status:'paid', provider_transaction_id: utils.generateTxnId(), paid_at: now });
  db.insert('transactions', { id:1, payment_id:1, transaction_type:'charge', amount_bdt:3300.00, status:'success', created_at: now });

  // ── Welcome Notifications ────────────────────────────────
  db.insert('notifications', { type:'welcome', recipient_type:'customer', recipient_id:1, message:'Welcome to Integrated Payment System! Start shopping now.', sent_at: now, status:'sent' });
  db.insert('notifications', { type:'welcome', recipient_type:'admin',    recipient_id:1, message:'System seeded successfully. All tables ready.', sent_at: now, status:'sent' });

  localStorage.setItem('ips_seeded', 'true');
  console.log('[IPS] Database seeded successfully.');
}
