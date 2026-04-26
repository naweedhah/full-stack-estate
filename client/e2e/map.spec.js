/**
 * Feature: Map Integration
 *
 * Tests the interactive Leaflet map on the listing page and single property page,
 * including rendering, tile layer, property pins, and OpenStreetMap attribution.
 */

import { test, expect } from '@playwright/test';

const MOCK_POSTS = [
  {
    id: 'post-map-1',
    title: 'Cozy Room near Peradeniya',
    city: 'Kandy',
    area: 'Peradeniya',
    rent: 15000,
    latitude: '7.2541',
    longitude: '80.5992',
    images: ['/bg.png'],
    type: 'buy',
    property: 'apartment',
    bedroom: 1,
    bathroom: 1,
  },
  {
    id: 'post-map-2',
    title: 'Affordable Room in Colombo',
    city: 'Colombo',
    area: 'Colpetty',
    rent: 22000,
    latitude: '6.9000',
    longitude: '79.8600',
    images: ['/bg.png'],
    type: 'buy',
    property: 'house',
    bedroom: 2,
    bathroom: 1,
  },
];

const MOCK_DEMAND = {
  highDemandAreas: [],
  lowDemandAreas: [],
  allAreas: [],
};

const MOCK_POST_SINGLE = {
  id: 'post-map-1',
  title: 'Cozy Room near Peradeniya',
  city: 'Kandy',
  area: 'Peradeniya',
  rent: 15000,
  latitude: '7.2541',
  longitude: '80.5992',
  images: ['/bg.png'],
  type: 'buy',
  property: 'apartment',
  bedroom: 1,
  bathroom: 1,
  description: 'A comfortable room close to the university.',
  address: 'No 12, Temple Road, Peradeniya',
  user: { id: 'owner-1', username: 'landlord1', avatar: null },
};

test.describe('Map Integration', () => {
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

  test('map container is visible on the listing page', async ({ page }) => {
    await page.goto('/list');
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible({ timeout: 10_000 });
  });

  test('map tile pane is rendered inside the container', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const tilePane = page.locator('.leaflet-tile-pane');
    await expect(tilePane).toBeAttached();
  });

  test('map overlay pane exists for markers and shapes', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const overlayPane = page.locator('.leaflet-overlay-pane');
    await expect(overlayPane).toBeAttached();
  });

  test('OpenStreetMap attribution is displayed on the map', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const attribution = page.locator('.leaflet-control-attribution');
    await expect(attribution).toBeVisible();
    await expect(attribution).toContainText('OpenStreetMap');
  });

  test('map zoom controls are present', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();
  });

  test('marker pane is attached when listings with coordinates exist', async ({ page }) => {
    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
    const markerPane = page.locator('.leaflet-marker-pane');
    await expect(markerPane).toBeAttached();
  });

  test('map still renders when there are no listings', async ({ page }) => {
    await page.route('**/api/posts?*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    await page.goto('/list');
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  });

  test('single property page renders a focused map', async ({ page }) => {
    await page.route('**/api/posts/post-map-1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_POST_SINGLE),
      })
    );
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api/posts/post-map-1/reviews', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/post-map-1');
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible({ timeout: 10_000 });
  });

  test('listing page map container is not empty', async ({ page }) => {
    await page.goto('/list');
    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible({ timeout: 10_000 });
    const mapContent = await map.innerHTML();
    expect(mapContent.length).toBeGreaterThan(0);
  });
});
