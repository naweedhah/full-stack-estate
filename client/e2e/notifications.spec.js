/**
 * Feature: Notification System (In-System & Email)
 *
 * Tests the notification bell in the navbar, unread count badge,
 * notification dropdown, mark-read behaviour, notification preference
 * toggles in the student dashboard, and the test-email trigger.
 */

import { test, expect } from '@playwright/test';

const UNREAD_NOTIFICATION = {
  id: 'notif-1',
  type: 'booking',
  title: 'Booking Approved',
  message: 'Your booking for Cozy Room in Kandy has been approved.',
  isRead: false,
  createdAt: '2026-04-26T10:00:00Z',
};

const READ_NOTIFICATION = {
  id: 'notif-2',
  type: 'watchlist',
  title: 'New Boarding Available',
  message: 'A new boarding matching your watchlist criteria is available.',
  isRead: true,
  createdAt: '2026-04-25T09:00:00Z',
};

const MOCK_PREFERENCES = {
  bookingUpdates: true,
  searchAlerts: true,
  priceAlerts: false,
  roommateAlerts: false,
};

const profileRoutes = async (page) => {
  await page.route('**/api/users/profilePosts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ userPosts: [], savedPosts: [] }),
    })
  );
  await page.route('**/api/chats', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
  await page.route('**/api/users/watchlists/searches', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
  await page.route('**/api/users/notifications/preferences', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PREFERENCES),
    })
  );
  await page.route('**/api/bookings', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
};

test.describe('Notification Bell — Navbar', () => {
  test('notification bell button is visible when logged in', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );

    await page.goto('/');
    const bell = page.locator('button[aria-label="Open alerts"]');
    await expect(bell).toBeVisible({ timeout: 10_000 });
  });

  test('unread count badge appears when there are unseen notifications', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 2,
          notifications: [UNREAD_NOTIFICATION, READ_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/');
    const badge = page.locator('.notifications .notification');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toContainText('2');
  });

  test('badge is hidden when there are no unseen notifications', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );

    await page.goto('/');
    await expect(page.locator('button[aria-label="Open alerts"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.notifications .notification')).not.toBeVisible();
  });

  test('clicking the bell opens the alerts dropdown', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    await expect(page.locator('.alertsDropdown')).toBeVisible({ timeout: 5_000 });
  });

  test('alerts dropdown shows notification title and message', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    const dropdown = page.locator('.alertsDropdown');
    await expect(dropdown).toContainText('Booking Approved');
    await expect(dropdown).toContainText('Your booking for Cozy Room in Kandy has been approved.');
  });

  test('dropdown header shows unseen count', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    await expect(page.locator('.alertsHeader')).toContainText('1 unseen');
  });

  test('"Mark all read" button appears when there are unseen notifications', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    await expect(page.locator('.alertsMeta button', { hasText: 'Mark all read' })).toBeVisible();
  });

  test('"Mark all read" calls the API and clears the badge', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    let markAllReadCalled = false;
    await page.route('**/api/users/notifications/read-all', (route) => {
      markAllReadCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    await page.locator('.alertsMeta button', { hasText: 'Mark all read' }).click();

    expect(markAllReadCalled).toBe(true);
    await expect(page.locator('.notifications .notification')).not.toBeVisible({ timeout: 5_000 });
  });

  test('empty state message shown when there are no notifications', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );

    await page.goto('/');
    await page.locator('button[aria-label="Open alerts"]').click();
    await expect(page.locator('.alertsEmpty')).toBeVisible();
    await expect(page.locator('.alertsEmpty')).toContainText('No alerts yet.');
  });
});

test.describe('Notification Preferences — Student Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: MOCK_PREFERENCES }),
      })
    );
    await profileRoutes(page);
  });

  test('smart alerts panel is visible on the student dashboard', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.smartAlertsPanel')).toBeVisible({ timeout: 15_000 });
  });

  test('notification preference toggles are rendered', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.preferenceToggle')).toHaveCount(4, { timeout: 15_000 });
  });

  test('"Booking updates" toggle is checked when preference is enabled', async ({ page }) => {
    await page.goto('/profile');
    const bookingToggle = page.locator('.preferenceToggle').filter({ hasText: 'Booking updates' }).locator('input[type="checkbox"]');
    await expect(bookingToggle).toBeChecked({ timeout: 15_000 });
  });

  test('"Price drops" toggle is unchecked when preference is disabled', async ({ page }) => {
    await page.goto('/profile');
    const priceToggle = page.locator('.preferenceToggle').filter({ hasText: 'Price drops' }).locator('input[type="checkbox"]');
    await expect(priceToggle).not.toBeChecked({ timeout: 15_000 });
  });

  test('toggling a preference calls the update API', async ({ page }) => {
    let prefUpdateCalled = false;
    await page.route('**/api/users/notifications/preferences', async (route) => {
      if (route.request().method() === 'PUT') {
        prefUpdateCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_PREFERENCES, priceAlerts: true }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_PREFERENCES),
        });
      }
    });

    await page.goto('/profile');
    const priceToggle = page.locator('.preferenceToggle').filter({ hasText: 'Price drops' }).locator('input[type="checkbox"]');
    await priceToggle.waitFor({ state: 'visible', timeout: 15_000 });
    await priceToggle.check();

    expect(prefUpdateCalled).toBe(true);
  });

  test('"Send Test Email" button is visible', async ({ page }) => {
    await page.goto('/profile');
    const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
    await expect(testEmailBtn).toBeVisible({ timeout: 15_000 });
  });

  test('"Send Test Email" calls the test-email API', async ({ page }) => {
    let testEmailCalled = false;
    await page.route('**/api/users/notifications/test-email', (route) => {
      testEmailCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Test email sent successfully.' }),
      });
    });

    await page.goto('/profile');
    const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
    await testEmailBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await testEmailBtn.click();

    expect(testEmailCalled).toBe(true);
  });

  test('success message shown after test email is sent', async ({ page }) => {
    await page.route('**/api/users/notifications/test-email', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Test email sent successfully.' }),
      })
    );

    await page.goto('/profile');
    const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
    await testEmailBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await testEmailBtn.click();

    await expect(page.locator('.dashboardSuccess')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.dashboardSuccess')).toContainText('Test email sent');
  });

  test('notifications panel shows unread items from the store', async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          unseenCount: 1,
          notifications: [UNREAD_NOTIFICATION, READ_NOTIFICATION],
          preferences: MOCK_PREFERENCES,
        }),
      })
    );

    await page.goto('/profile');
    const notifPanel = page.locator('#notifications');
    await expect(notifPanel).toBeVisible({ timeout: 15_000 });
    await expect(notifPanel).toContainText('Booking Approved');
    await expect(notifPanel).toContainText('New Boarding Available');
  });
});
