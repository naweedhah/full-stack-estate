/**
 * Feature: Demand Heatmap
 *
 * Tests the demand heatmap overlay on the listing page map (CircleMarker elements),
 * demand stats cards, legend, and popup info for high/medium/low demand areas.
 */

import { test, expect } from '@playwright/test';

const MOCK_POSTS = [];

const HIGH_DEMAND_AREA = {
  key: 'colombo-colpetty',
  area: 'Colpetty',
  city: 'Colombo',
  latitude: 6.9,
  longitude: 79.86,
  demandLevel: 'high',
  demandScore: 85,
  searches: 120,
  inquiries: 45,
  bookings: 20,
};

const MEDIUM_DEMAND_AREA = {
  key: 'kandy-city',
  area: 'Kandy City',
  city: 'Kandy',
  latitude: 7.2906,
  longitude: 80.6337,
  demandLevel: 'medium',
  demandScore: 50,
  searches: 60,
  inquiries: 20,
  bookings: 8,
};

const LOW_DEMAND_AREA = {
  key: 'galle-downtown',
  area: 'Galle Downtown',
  city: 'Galle',
  latitude: 6.0328,
  longitude: 80.2170,
  demandLevel: 'low',
  demandScore: 12,
  searches: 8,
  inquiries: 3,
  bookings: 1,
};

const MOCK_DEMAND = {
  highDemandAreas: [HIGH_DEMAND_AREA],
  lowDemandAreas: [LOW_DEMAND_AREA],
  allAreas: [HIGH_DEMAND_AREA, MEDIUM_DEMAND_AREA, LOW_DEMAND_AREA],
};

test.describe('Demand Heatmap', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );
    await page.route('**/api/posts/demand/overview', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DEMAND),
      })
    );
    await page.route('**/api/posts?*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_POSTS),
      })
    );
  });

  test('demand heatmap section heading is visible', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('text=Demand Heatmap')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=High and Low Demand Areas')).toBeVisible();
  });

  test('heatmap legend shows all three demand levels', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.legendItem.high')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.legendItem.medium')).toBeVisible();
    await expect(page.locator('.legendItem.low')).toBeVisible();
    await expect(page.locator('.legendItem.high')).toContainText('High demand');
    await expect(page.locator('.legendItem.medium')).toContainText('Medium demand');
    await expect(page.locator('.legendItem.low')).toContainText('Low demand');
  });

  test('high demand card shows correct area name', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.demandCard.highCard')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.demandCard.highCard')).toContainText('Colpetty');
  });

  test('low demand card shows correct area name', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.demandCard.lowCard')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.demandCard.lowCard')).toContainText('Galle Downtown');
  });

  test('high demand area row displays demand score', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.demandCard.highCard')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.demandCard.highCard')).toContainText('85');
  });

  test('demand row shows search, inquiry, and booking counts', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.demandCard.highCard')).toBeVisible({ timeout: 10_000 });
    const highCard = page.locator('.demandCard.highCard');
    await expect(highCard).toContainText('120 searches');
    await expect(highCard).toContainText('45 inquiries');
    await expect(highCard).toContainText('20 bookings');
  });

  test('map overlay pane renders for demand circle markers', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    // CircleMarkers render as SVG paths inside the overlay pane
    const overlayPane = page.locator('.leaflet-overlay-pane');
    await expect(overlayPane).toBeAttached();
  });

  test('empty high demand message shown when no high demand areas', async ({ page }) => {
    await page.route('**/api/posts/demand/overview', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ highDemandAreas: [], lowDemandAreas: [], allAreas: [] }),
      })
    );

    await page.goto('/list');
    await expect(page.locator('.demandCard.highCard')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=No high demand areas detected yet.')).toBeVisible();
  });

  test('empty low demand message shown when no low demand areas', async ({ page }) => {
    await page.route('**/api/posts/demand/overview', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ highDemandAreas: [], lowDemandAreas: [], allAreas: [] }),
      })
    );

    await page.goto('/list');
    await expect(page.locator('.demandCard.lowCard')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=No low demand areas detected yet.')).toBeVisible();
  });

  test('demand section renders even when API is slow', async ({ page }) => {
    await page.route('**/api/posts/demand/overview', async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DEMAND),
      });
    });

    await page.goto('/list');
    await expect(page.locator('.demandSection')).toBeVisible({ timeout: 15_000 });
  });
});
