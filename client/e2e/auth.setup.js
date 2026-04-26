import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const authDir = path.join(__dirname, '.auth');
const authFile = path.join(authDir, 'user.json');

const MOCK_USER = {
  id: 'user-test-001',
  username: 'teststudent',
  fullName: 'Test Student',
  email: 'test@university.lk',
  role: 'student',
  gender: 'male',
  isVerified: true,
  avatar: null,
  phone: null,
};

setup('save authenticated storage state', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Mock the notifications endpoint so the navbar doesn't error on load
  await page.route('**/api/users/notifications', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
    });
  });

  await page.goto('/');

  // Inject mock user directly into localStorage — auth context reads this on mount
  await page.evaluate((user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }, MOCK_USER);

  await page.context().storageState({ path: authFile });
});
