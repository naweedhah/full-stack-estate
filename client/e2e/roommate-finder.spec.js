/**
 * Feature: Roommate Finder
 *
 * Tests the roommate profile questionnaire, form validation, successful
 * save flow, and the matched roommate cards displayed after saving.
 */

import { test, expect } from '@playwright/test';

const MOCK_MATCH = {
  score: 87,
  reasons: ['Same city preference', 'Similar budget range', 'Matching sleep schedule'],
  user: {
    id: 'match-user-1',
    username: 'roommateuser',
    fullName: 'Roommate User',
    avatar: null,
    university: 'University of Peradeniya',
    preferredCity: 'Kandy',
    budgetMin: 12000,
    budgetMax: 20000,
    faculty: 'Engineering',
  },
};

test.describe('Roommate Finder — Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );
    await page.route('**/api/users/roommate-profile', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'No profile' }) })
    );
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
  });

  test('roommate page renders the hero heading', async ({ page }) => {
    await page.goto('/roommates');
    await expect(page.locator('h1')).toContainText('Match with students who fit your lifestyle.', {
      timeout: 10_000,
    });
  });

  test('"Find Roommate" eyebrow label is visible', async ({ page }) => {
    await page.goto('/roommates');
    await expect(page.locator('.eyebrow', { hasText: 'Find Roommate' })).toBeVisible({ timeout: 10_000 });
  });

  test('active match count shows 0 when there are no matches', async ({ page }) => {
    await page.goto('/roommates');
    const summaryCard = page.locator('.summaryCard');
    await expect(summaryCard).toBeVisible({ timeout: 10_000 });
    await expect(summaryCard.locator('strong')).toContainText('0');
  });

  test('questionnaire form is rendered with all sections', async ({ page }) => {
    await page.goto('/roommates');
    const form = page.locator('.roommateForm');
    await expect(form).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Location & Budget')).toBeVisible();
    await expect(page.locator('text=Study & Routine')).toBeVisible();
    await expect(page.locator('text=Lifestyle Preferences')).toBeVisible();
  });

  test('all required dropdowns are present in the form', async ({ page }) => {
    await page.goto('/roommates');
    await expect(page.locator('select[name="preferredCity"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('select[name="university"]')).toBeVisible();
    await expect(page.locator('select[name="yearOfStudy"]')).toBeVisible();
    await expect(page.locator('select[name="sleepSchedule"]')).toBeVisible();
    await expect(page.locator('select[name="studyHabit"]')).toBeVisible();
    await expect(page.locator('select[name="cleanlinessLevel"]')).toBeVisible();
    await expect(page.locator('select[name="sociabilityLevel"]')).toBeVisible();
    await expect(page.locator('select[name="smokingAllowed"]')).toBeVisible();
    await expect(page.locator('select[name="petsAllowed"]')).toBeVisible();
    await expect(page.locator('select[name="foodPreference"]')).toBeVisible();
  });

  test('city dropdown contains Sri Lankan cities', async ({ page }) => {
    await page.goto('/roommates');
    const citySelect = page.locator('select[name="preferredCity"]');
    await expect(citySelect).toBeVisible({ timeout: 10_000 });
    await expect(citySelect.locator('option', { hasText: 'Colombo' })).toBeAttached();
    await expect(citySelect.locator('option', { hasText: 'Kandy' })).toBeAttached();
    await expect(citySelect.locator('option', { hasText: 'Galle' })).toBeAttached();
  });

  test('university dropdown contains valid options', async ({ page }) => {
    await page.goto('/roommates');
    const uniSelect = page.locator('select[name="university"]');
    await expect(uniSelect).toBeVisible({ timeout: 10_000 });
    await expect(uniSelect.locator('option', { hasText: 'University of Peradeniya' })).toBeAttached();
    await expect(uniSelect.locator('option', { hasText: 'University of Colombo' })).toBeAttached();
  });

  test('"Back to Dashboard" and "View Watchlist" hero buttons are present', async ({ page }) => {
    await page.goto('/roommates');
    await expect(page.locator('button', { hasText: 'Back to Dashboard' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('button', { hasText: 'View Watchlist' })).toBeVisible();
  });

  test('empty matches state message is shown when no profile exists', async ({ page }) => {
    await page.goto('/roommates');
    const emptyState = page.locator('.emptyState');
    await expect(emptyState).toBeVisible({ timeout: 10_000 });
    await expect(emptyState).toContainText('No roommate matches yet');
  });
});

test.describe('Roommate Finder — Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );
    await page.route('**/api/users/roommate-profile', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
  });

  test('submitting an empty form shows validation errors', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('small', { hasText: 'Please select a preferred city.' })).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('small', { hasText: 'Preferred area is required.' })).toBeVisible();
    await expect(page.locator('small', { hasText: 'Minimum budget is required.' })).toBeVisible();
    await expect(page.locator('small', { hasText: 'Maximum budget is required.' })).toBeVisible();
  });

  test('age validation rejects values below 16', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('input[name="age"]').fill('10');
    await page.locator('input[name="age"]').blur();
    await expect(page.locator('small', { hasText: 'Age must be between 16 and 60.' })).toBeVisible({ timeout: 5_000 });
  });

  test('age validation rejects values above 60', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('input[name="age"]').fill('65');
    await page.locator('input[name="age"]').blur();
    await expect(page.locator('small', { hasText: 'Age must be between 16 and 60.' })).toBeVisible({ timeout: 5_000 });
  });

  test('budget min below 5000 shows an error', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('input[name="budgetMin"]').fill('3000');
    await page.locator('input[name="budgetMin"]').blur();
    await expect(
      page.locator('small', { hasText: 'Minimum budget must be at least LKR 5,000.' })
    ).toBeVisible({ timeout: 5_000 });
  });

  test('budget max less than budget min shows an error', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('input[name="budgetMin"]').fill('20000');
    await page.locator('input[name="budgetMax"]').fill('10000');
    await page.locator('input[name="budgetMax"]').blur();
    await expect(
      page.locator('small', { hasText: 'Maximum budget must be greater than or equal to minimum budget.' })
    ).toBeVisible({ timeout: 5_000 });
  });

  test('notes exceeding 300 characters shows an error', async ({ page }) => {
    await page.goto('/roommates');
    const longNote = 'A'.repeat(301);
    await page.locator('textarea[name="notes"]').fill(longNote);
    await page.locator('textarea[name="notes"]').blur();
    await expect(page.locator('small', { hasText: 'Notes must stay within 300 characters.' })).toBeVisible({ timeout: 5_000 });
  });

  test('preferred area shorter than 2 characters shows an error', async ({ page }) => {
    await page.goto('/roommates');
    await page.locator('input[name="preferredArea"]').fill('X');
    await page.locator('input[name="preferredArea"]').blur();
    await expect(
      page.locator('small', { hasText: 'Preferred area must be at least 2 characters.' })
    ).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Roommate Finder — Save and Matches', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/notifications', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
      })
    );
    await page.route('**/api/users/roommate-profile', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
  });

  test('filling and submitting valid form calls the save API', async ({ page }) => {
    let saveCalled = false;
    await page.route('**/api/users/roommate-profile', async (route) => {
      if (route.request().method() === 'PUT') {
        saveCalled = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
    });
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_MATCH]) })
    );

    await page.goto('/roommates');
    await page.locator('select[name="preferredCity"]').selectOption('Kandy');
    await page.locator('input[name="preferredArea"]').fill('Peradeniya');
    await page.locator('input[name="budgetMin"]').fill('10000');
    await page.locator('input[name="budgetMax"]').fill('20000');
    await page.locator('select[name="university"]').selectOption('University of Peradeniya');
    await page.locator('input[name="faculty"]').fill('Engineering');
    await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
    await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
    await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
    await page.locator('input[name="age"]').fill('22');
    await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
    await page.locator('select[name="sociabilityLevel"]').selectOption('3');
    await page.locator('select[name="smokingAllowed"]').selectOption('false');
    await page.locator('select[name="petsAllowed"]').selectOption('false');
    await page.locator('select[name="foodPreference"]').selectOption('No special preference');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.successText')).toBeVisible({ timeout: 10_000 });
    expect(saveCalled).toBe(true);
  });

  test('success message appears after saving preferences', async ({ page }) => {
    await page.route('**/api/users/roommate-profile', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
    });
    await page.route('**/api/users/roommate-matches', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    await page.goto('/roommates');
    await page.locator('select[name="preferredCity"]').selectOption('Kandy');
    await page.locator('input[name="preferredArea"]').fill('Peradeniya');
    await page.locator('input[name="budgetMin"]').fill('10000');
    await page.locator('input[name="budgetMax"]').fill('20000');
    await page.locator('select[name="university"]').selectOption('University of Peradeniya');
    await page.locator('input[name="faculty"]').fill('Engineering');
    await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
    await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
    await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
    await page.locator('input[name="age"]').fill('22');
    await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
    await page.locator('select[name="sociabilityLevel"]').selectOption('3');
    await page.locator('select[name="smokingAllowed"]').selectOption('false');
    await page.locator('select[name="petsAllowed"]').selectOption('false');
    await page.locator('select[name="foodPreference"]').selectOption('No special preference');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.successText')).toContainText(
      'Roommate preferences saved. Your latest matches are ready.',
      { timeout: 10_000 }
    );
  });

  test('match card is displayed after successful save', async ({ page }) => {
    await page.route('**/api/users/roommate-profile', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
    });

    let matchCallCount = 0;
    await page.route('**/api/users/roommate-matches', (route) => {
      matchCallCount++;
      const body = matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]';
      route.fulfill({ status: 200, contentType: 'application/json', body });
    });

    await page.goto('/roommates');
    await page.locator('select[name="preferredCity"]').selectOption('Kandy');
    await page.locator('input[name="preferredArea"]').fill('Peradeniya');
    await page.locator('input[name="budgetMin"]').fill('10000');
    await page.locator('input[name="budgetMax"]').fill('20000');
    await page.locator('select[name="university"]').selectOption('University of Peradeniya');
    await page.locator('input[name="faculty"]').fill('Engineering');
    await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
    await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
    await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
    await page.locator('input[name="age"]').fill('22');
    await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
    await page.locator('select[name="sociabilityLevel"]').selectOption('3');
    await page.locator('select[name="smokingAllowed"]').selectOption('false');
    await page.locator('select[name="petsAllowed"]').selectOption('false');
    await page.locator('select[name="foodPreference"]').selectOption('No special preference');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.matchCard')).toBeVisible({ timeout: 10_000 });
  });

  test('match card shows compatibility score badge', async ({ page }) => {
    await page.route('**/api/users/roommate-profile', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
    });
    let matchCallCount = 0;
    await page.route('**/api/users/roommate-matches', (route) => {
      matchCallCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]',
      });
    });

    await page.goto('/roommates');
    await page.locator('select[name="preferredCity"]').selectOption('Kandy');
    await page.locator('input[name="preferredArea"]').fill('Peradeniya');
    await page.locator('input[name="budgetMin"]').fill('10000');
    await page.locator('input[name="budgetMax"]').fill('20000');
    await page.locator('select[name="university"]').selectOption('University of Peradeniya');
    await page.locator('input[name="faculty"]').fill('Engineering');
    await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
    await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
    await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
    await page.locator('input[name="age"]').fill('22');
    await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
    await page.locator('select[name="sociabilityLevel"]').selectOption('3');
    await page.locator('select[name="smokingAllowed"]').selectOption('false');
    await page.locator('select[name="petsAllowed"]').selectOption('false');
    await page.locator('select[name="foodPreference"]').selectOption('No special preference');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.scoreBadge')).toContainText('87%', { timeout: 10_000 });
  });

  test('match card shows match reasons', async ({ page }) => {
    await page.route('**/api/users/roommate-profile', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      }
    });
    let matchCallCount = 0;
    await page.route('**/api/users/roommate-matches', (route) => {
      matchCallCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]',
      });
    });

    await page.goto('/roommates');
    await page.locator('select[name="preferredCity"]').selectOption('Kandy');
    await page.locator('input[name="preferredArea"]').fill('Peradeniya');
    await page.locator('input[name="budgetMin"]').fill('10000');
    await page.locator('input[name="budgetMax"]').fill('20000');
    await page.locator('select[name="university"]').selectOption('University of Peradeniya');
    await page.locator('input[name="faculty"]').fill('Engineering');
    await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
    await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
    await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
    await page.locator('input[name="age"]').fill('22');
    await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
    await page.locator('select[name="sociabilityLevel"]').selectOption('3');
    await page.locator('select[name="smokingAllowed"]').selectOption('false');
    await page.locator('select[name="petsAllowed"]').selectOption('false');
    await page.locator('select[name="foodPreference"]').selectOption('No special preference');

    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.reasonList')).toContainText('Same city preference', { timeout: 10_000 });
    await expect(page.locator('.reasonList')).toContainText('Similar budget range');
  });
});
