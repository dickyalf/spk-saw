module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  // setupFilesAfterEnv jalan SETELAH framework siap → afterEach() tersedia
  setupFilesAfterEnv: ['<rootDir>/tests/setup/clearDB.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/setup/'],
  // Tampilkan setiap test name
  verbose: true,
  // Tutup async handles agar Jest tidak hang
  forceExit: true,
};
