/**
 * Jalan SETELAH setiap test selesai: hapus semua collection
 * supaya test berikutnya mulai dengan database bersih.
 */
const mongoose = require('mongoose');

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const collections = mongoose.connection.collections;
  for (const k in collections) {
    await collections[k].deleteMany({});
  }
});
