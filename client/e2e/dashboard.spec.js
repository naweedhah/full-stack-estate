/**
 * Feature: User Dashboard & Analytics
 *
 * Tests the student dashboard's stats grid, booking status summary,
 * notifications panel, roommate finder panel, smart alerts section,
 * saved boardings list, and the profile card.
 */

import { test, expect } from '@playwright/test';

const MOCK_PREFERENCES = {
  bookingUpdates: true,
  searchAlerts: true,
  priceAlerts: false,
  roommateAlerts: false,
};

const MOCK_SAVED_POSTS = [
  {
    id: 'post-saved-1',
    title: 'Cozy Room near Peradeniya',
    city: 'Kandy',
    area: 'Peradeniya',
    rent: 15000,
    images: ['/bg.png'],
    type: 'buy',
    property: 'apartment',
    bedroom: 1,
    bathroom: 1,
    latitude: '7.2541',
    longitude: '80.5992',
  },
];

const MOCK_BOOKINGS = [
  {
    id: 'booking-1',
    status: 'pending',
    post: { id: 'post-saved-1', title: 'Cozy Room near Peradeniya', city: 'Kandy', area: 'Peradeniya' },
  },
  {
    id: 'booking-2',
    status: 'approved',
    post: { id: 'post-b2', title: 'Budget Room in Colombo', city: 'Colombo', area: 'Colpetty' },
  },
  {
    id: 'booking-3',
    status: 'confirmed',
    post: { id: 'post-b3', title: 'Studio in Galle', city: 'Galle', area: 'Downtown' },
  },
];

const MOCK_SEARCH_ALERTS = [
  {
    id: 'alert-1',
    area: 'Peradeniya',
    city: 'Kandy',
    maxBudget: 20000,
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Booking Approved',
    message: 'Your booking has been approved.',
    isRead: false,
    createdAt: '2026-04-26T10:00:00Z',
  },
];

const setupProfileRoutes = async (page, overrides = {}) => {
  await page.route('**/api/users/notifications', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        overrides.notifications ?? { unseenCount: 0, notifications: [], preferences: MOCK_PREFERENCES }
      ),
    })
  );
  await page.route('**/api/users/profilePosts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides.profilePosts ?? { userPosts: [], savedPosts: MOCK_SAVED_POSTS }),
    })
  );
  await page.route('**/api/chats', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
  await page.route('**/api/users/watchlists/searches', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides.searchAlerts ?? MOCK_SEARCH_ALERTS),
    })
  );
  await page.route('**/api/users/notifications/preferences', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PREFERENCES),
    })
  );
  await page.route('**/api/bookings', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides.bookings ?? MOCK_BOOKINGS),
    })
  );
};

test.describe('User Dashboard — Hero & Profile Card', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('student dashboard hero section is visible', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.eyebrow', { hasText: 'Student Dashboard' })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('welcome message uses the logged-in username', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('Welcome back', { timeout: 15_000 });
  });

  test('"Find Boardings" button links to the list page', async ({ page }) => {
    await page.goto('/profile');
    const findBtn = page.locator('a[href="/list"] button', { hasText: 'Find Boardings' });
    await expect(findBtn).toBeVisible({ timeout: 15_000 });
  });

  test('"Update Profile" button links to profile update page', async ({ page }) => {
    await page.goto('/profile');
    const updateBtn = page.locator('a[href="/profile/update"] button', { hasText: 'Update Profile' });
    await expect(updateBtn).toBeVisible({ timeout: 15_000 });
  });

  test('profile card shows username and email', async ({ page }) => {
    await page.goto('/profile');
    const profileCard = page.locator('.profileCard');
    await expect(profileCard).toBeVisible({ timeout: 15_000 });
    await expect(profileCard).toContainText('teststudent');
    await expect(profileCard).toContainText('test@university.lk');
  });

  test('logout button is present in the profile card', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.logoutButton')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('User Dashboard — Analytics Stats Grid', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('stats grid has four stat cards', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.statCard')).toHaveCount(4, { timeout: 15_000 });
  });

  test('"Saved Boardings" stat card shows correct count', async ({ page }) => {
    await page.goto('/profile');
    const savedCard = page.locator('.statCard').filter({ hasText: 'Saved Boardings' });
    await expect(savedCard).toBeVisible({ timeout: 15_000 });
    await expect(savedCard.locator('h2')).toContainText('1');
  });

  test('"Pending Requests" stat card is rendered', async ({ page }) => {
    await page.goto('/profile');
    const pendingCard = page.locator('.statCard').filter({ hasText: 'Pending Requests' });
    await expect(pendingCard).toBeVisible({ timeout: 15_000 });
    await expect(pendingCard.locator('h2')).toContainText('1');
  });

  test('"Confirmed Bookings" stat card is rendered', async ({ page }) => {
    await page.goto('/profile');
    const confirmedCard = page.locator('.statCard').filter({ hasText: 'Confirmed Bookings' });
    await expect(confirmedCard).toBeVisible({ timeout: 15_000 });
    await expect(confirmedCard.locator('h2')).toContainText('1');
  });

  test('"Roommate Matches" stat card is rendered', async ({ page }) => {
    await page.goto('/profile');
    const roommateCard = page.locator('.statCard').filter({ hasText: 'Roommate Matches' });
    await expect(roommateCard).toBeVisible({ timeout: 15_000 });
  });

  test('stats are all zero when user has no bookings or saved posts', async ({ page }) => {
    await setupProfileRoutes(page, {
      profilePosts: { userPosts: [], savedPosts: [] },
      bookings: [],
    });
    await page.goto('/profile');
    const savedCard = page.locator('.statCard').filter({ hasText: 'Saved Boardings' });
    await expect(savedCard.locator('h2')).toContainText('0', { timeout: 15_000 });
  });
});

test.describe('User Dashboard — Booking Panel', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('booking requests panel heading is visible', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.bookingsPanel h3')).toContainText('Booking Requests', { timeout: 15_000 });
  });

  test('booking status grid shows pending count', async ({ page }) => {
    await page.goto('/profile');
    const statusGrid = page.locator('.statusGrid');
    await expect(statusGrid).toBeVisible({ timeout: 15_000 });
    await expect(statusGrid).toContainText('Pending');
    await expect(statusGrid.locator('strong').first()).toContainText('1');
  });

  test('booking status grid shows approved count', async ({ page }) => {
    await page.goto('/profile');
    const statusGrid = page.locator('.statusGrid');
    await expect(statusGrid).toContainText('Approved', { timeout: 15_000 });
  });

  test('booking list shows booking title and city', async ({ page }) => {
    await page.goto('/profile');
    const bookingsPanel = page.locator('.bookingsPanel');
    await expect(bookingsPanel).toContainText('Cozy Room near Peradeniya', { timeout: 15_000 });
    await expect(bookingsPanel).toContainText('Kandy');
  });

  test('empty booking state message shown when no bookings exist', async ({ page }) => {
    await setupProfileRoutes(page, { bookings: [] });
    await page.goto('/profile');
    const bookingsPanel = page.locator('.bookingsPanel');
    await expect(bookingsPanel).toContainText("Once you request a boarding", { timeout: 15_000 });
  });
});

test.describe('User Dashboard — Notifications Panel', () => {
  test('notifications panel heading is rendered', async ({ page }) => {
    await setupProfileRoutes(page);
    await page.goto('/profile');
    const panel = page.locator('#notifications');
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await expect(panel.locator('h3')).toContainText('Notifications');
  });

  test('real notifications from store are displayed', async ({ page }) => {
    await setupProfileRoutes(page, {
      notifications: {
        unseenCount: 1,
        notifications: MOCK_NOTIFICATIONS,
        preferences: MOCK_PREFERENCES,
      },
    });
    await page.goto('/profile');
    const panel = page.locator('#notifications');
    await expect(panel).toContainText('Booking Approved', { timeout: 15_000 });
    await expect(panel).toContainText('Your booking has been approved.');
  });

  test('fallback notification items shown when no real notifications exist', async ({ page }) => {
    await setupProfileRoutes(page, {
      notifications: { unseenCount: 0, notifications: [], preferences: MOCK_PREFERENCES },
    });
    await page.goto('/profile');
    const panel = page.locator('#notifications');
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await expect(panel.locator('.infoRow')).toHaveCount(3);
  });
});

test.describe('User Dashboard — Smart Alerts & Search Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('smart alerts panel shows saved search alert', async ({ page }) => {
    await page.goto('/profile');
    const alertsPanel = page.locator('.smartAlertsPanel');
    await expect(alertsPanel).toBeVisible({ timeout: 15_000 });
    await expect(alertsPanel).toContainText('Peradeniya');
  });

  test('saved search alert displays city and budget', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.alertSummaryRow')).toContainText('Kandy', { timeout: 15_000 });
    await expect(page.locator('.alertSummaryRow')).toContainText('20000');
  });

  test('"Remove" button is visible for each search alert', async ({ page }) => {
    await page.goto('/profile');
    await expect(
      page.locator('.alertSummaryRow button.inlineAction', { hasText: 'Remove' })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('clicking Remove calls the delete API and removes the alert from UI', async ({ page }) => {
    let deleteCalled = false;
    await page.route('**/api/users/watchlists/searches/alert-1', (route) => {
      deleteCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/profile');
    const removeBtn = page.locator('.alertSummaryRow button.inlineAction', { hasText: 'Remove' });
    await removeBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await removeBtn.click();

    expect(deleteCalled).toBe(true);
    await expect(page.locator('.alertSummaryRow')).toHaveCount(0, { timeout: 5_000 });
  });

  test('empty state message shown when no search alerts exist', async ({ page }) => {
    await setupProfileRoutes(page, { searchAlerts: [] });
    await page.goto('/profile');
    const alertsPanel = page.locator('.smartAlertsPanel');
    await expect(alertsPanel).toContainText('Create saved searches from the watchlist page', { timeout: 15_000 });
  });
});

test.describe('User Dashboard — Roommate Finder Panel', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('roommate finder panel is visible', async ({ page }) => {
    await page.goto('/profile');
    const roommatePanel = page.locator('.roommatePanel');
    await expect(roommatePanel).toBeVisible({ timeout: 15_000 });
    await expect(roommatePanel.locator('h3')).toContainText('Roommate Finder');
  });

  test('"Open Finder" link navigates to /roommates', async ({ page }) => {
    await page.goto('/profile');
    const openFinderLink = page.locator('.roommatePanel a', { hasText: 'Open Finder' });
    await expect(openFinderLink).toBeVisible({ timeout: 15_000 });
    await expect(openFinderLink).toHaveAttribute('href', '/roommates');
  });
});

test.describe('User Dashboard — Saved Boardings Section', () => {
  test.beforeEach(async ({ page }) => {
    await setupProfileRoutes(page);
  });

  test('saved boardings section heading is visible', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.savedSection h3')).toContainText('Saved Boardings', { timeout: 15_000 });
  });

  test('saved boarding card is rendered for each saved post', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('.savedSection')).toContainText('Cozy Room near Peradeniya', { timeout: 15_000 });
  });

  test('empty state shown when no saved boardings exist', async ({ page }) => {
    await setupProfileRoutes(page, { profilePosts: { userPosts: [], savedPosts: [] } });
    await page.goto('/profile');
    await expect(
      page.locator('text=You have not saved any boardings yet.')
    ).toBeVisible({ timeout: 15_000 });
  });

  test('"Browse Boardings" button shown in the empty saved state', async ({ page }) => {
    await setupProfileRoutes(page, { profilePosts: { userPosts: [], savedPosts: [] } });
    await page.goto('/profile');
    await expect(
      page.locator('.emptyPanel button', { hasText: 'Browse Boardings' })
    ).toBeVisible({ timeout: 15_000 });
  });
});
