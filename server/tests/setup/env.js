// Set env vars sebelum modul lain di-load
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_jangan_dipakai_produksi';
process.env.JWT_EXPIRES_IN = '1d';
process.env.CLIENT_URL = 'http://localhost:5173';
// Tidak set GEMINI_API_KEY → service fallback ke regex parser
// Tidak set SMTP → emailService di-skip
