/**
 * Integrated Payment System — Simulated Payment (Option B)
 */

const payment = {
  process(orderId, amountBDT, method) {
    return new Promise(resolve => {
      // Simulate network delay
      setTimeout(() => {
        const txnId = utils.generateTxnId();
        const now = new Date().toISOString();

        // Create PAYMENT record
        const pay = db.insert('payments', {
          order_id: orderId,
          amount_bdt: amountBDT,
          method: method,
          status: 'paid',
          provider_transaction_id: txnId,
          paid_at: now
        });

        // Create TRANSACTION record
        db.insert('transactions', {
          payment_id: pay.id,
          transaction_type: 'charge',
          amount_bdt: amountBDT,
          status: 'success',
          created_at: now
        });

        // Update order status
        db.update('orders', orderId, { status: 'confirmed', confirmed_at: now });

        // Deduct stock from inventory
        const orderItems = db.query('order_items', r => r.order_id === orderId);
        orderItems.forEach(item => {
          const inv = db.findOne('inventory', r => r.product_id === item.product_id);
          if (inv) {
            db.update('inventory', inv.id, {
              stock_qty: Math.max(0, inv.stock_qty - item.quantity),
              reserved_qty: Math.max(0, (inv.reserved_qty || 0) - item.quantity)
            });
          }
          // Also update product stock
          const prod = db.find('products', item.product_id);
          if (prod) db.update('products', item.product_id, { stock_qty: Math.max(0, prod.stock_qty - item.quantity) });
        });

        // Notification to customer
        const order = db.find('orders', orderId);
        if (order) {
          notifications.send('payment_confirmed', 'customer', order.customer_id,
            `Your payment of ${utils.formatBDT(amountBDT)} (Txn: ${txnId}) was successful! Order #${orderId} confirmed.`);
          notifications.send('new_order', 'admin', 1,
            `New order #${orderId} paid via ${method}. Total: ${utils.formatBDT(amountBDT)}`);
        }

        resolve({ ok: true, txnId, paymentId: pay.id });
      }, 2000); // 2-second simulated processing
    });
  },

  createOrder(session, billingAddress, cartItems, totals) {
    const now = new Date().toISOString();
    const order = db.insert('orders', {
      customer_id: session.id,
      total_amount_bdt: totals.total,
      billing_address: billingAddress,
      status: 'pending',
      created_at: now,
      confirmed_at: null
    });

    cartItems.forEach(item => {
      db.insert('order_items', {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_bdt: item.unit_price_bdt,
        subtotal_bdt: item.subtotal_bdt
      });
    });

    return order;
  }
};
