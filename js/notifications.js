/**
 * Integrated Payment System — Notifications
 */

const notifications = {
  send(type, recipientType, recipientId, message) {
    return db.insert('notifications', {
      type,
      recipient_type: recipientType,
      recipient_id: recipientId,
      message,
      sent_at: new Date().toISOString(),
      status: 'sent'
    });
  },

  getFor(recipientType, recipientId) {
    return db.query('notifications', r =>
      r.recipient_type === recipientType && r.recipient_id === recipientId
    ).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  },

  getUnread(recipientType, recipientId) {
    return this.getFor(recipientType, recipientId).filter(n => n.status !== 'read');
  },

  markRead(id) {
    db.update('notifications', id, { status: 'read' });
  },

  markAllRead(recipientType, recipientId) {
    const items = this.getFor(recipientType, recipientId);
    items.forEach(n => db.update('notifications', n.id, { status: 'read' }));
  }
};
