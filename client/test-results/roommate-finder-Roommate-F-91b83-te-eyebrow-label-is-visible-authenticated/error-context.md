# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roommate-finder.spec.js >> Roommate Finder — Page Structure >> "Find Roommate" eyebrow label is visible
- Location: e2e/roommate-finder.spec.js:50:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.eyebrow').filter({ hasText: 'Find Roommate' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.eyebrow').filter({ hasText: 'Find Roommate' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e5]:
    - generic [ref=e6]:
      - link "BoardingFinder" [ref=e7] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: BoardingFinder
      - generic [ref=e9]:
        - link "Home" [ref=e10] [cursor=pointer]:
          - /url: /
        - link "Find Boardings" [ref=e11] [cursor=pointer]:
          - /url: /list
        - link "Find Roommate" [ref=e12] [cursor=pointer]:
          - /url: /roommates
        - link "Watchlist" [ref=e13] [cursor=pointer]:
          - /url: /watchlist
        - link "About" [ref=e14] [cursor=pointer]:
          - /url: /
    - generic [ref=e15]:
      - generic [ref=e16]:
        - button "Open alerts" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - generic [ref=e23]:
          - strong [ref=e24]: teststudent
          - generic [ref=e25]: student
        - link "Dashboard" [ref=e26] [cursor=pointer]:
          - /url: /profile
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: Menu
          - button "Close" [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - link "Home" [ref=e32] [cursor=pointer]:
            - /url: /
          - link "Find Boardings" [ref=e33] [cursor=pointer]:
            - /url: /list
          - link "Find Roommate" [ref=e34] [cursor=pointer]:
            - /url: /roommates
          - link "Watchlist" [ref=e35] [cursor=pointer]:
            - /url: /watchlist
          - link "About" [ref=e36] [cursor=pointer]:
            - /url: /
        - generic [ref=e37]:
          - generic [ref=e39]:
            - strong [ref=e40]: teststudent
            - generic [ref=e41]: student
          - link "Alerts" [ref=e42] [cursor=pointer]:
            - /url: /profile#notifications
          - link "Dashboard" [ref=e43] [cursor=pointer]:
            - /url: /profile
  - paragraph [ref=e45]: Failed to load roommate page!
```

# Test source

```ts
  1   | /**
  2   |  * Feature: Roommate Finder
  3   |  *
  4   |  * Tests the roommate profile questionnaire, form validation, successful
  5   |  * save flow, and the matched roommate cards displayed after saving.
  6   |  */
  7   | 
  8   | import { test, expect } from '@playwright/test';
  9   | 
  10  | const MOCK_MATCH = {
  11  |   score: 87,
  12  |   reasons: ['Same city preference', 'Similar budget range', 'Matching sleep schedule'],
  13  |   user: {
  14  |     id: 'match-user-1',
  15  |     username: 'roommateuser',
  16  |     fullName: 'Roommate User',
  17  |     avatar: null,
  18  |     university: 'University of Peradeniya',
  19  |     preferredCity: 'Kandy',
  20  |     budgetMin: 12000,
  21  |     budgetMax: 20000,
  22  |     faculty: 'Engineering',
  23  |   },
  24  | };
  25  | 
  26  | test.describe('Roommate Finder — Page Structure', () => {
  27  |   test.beforeEach(async ({ page }) => {
  28  |     await page.route('**/api/users/notifications', (route) =>
  29  |       route.fulfill({
  30  |         status: 200,
  31  |         contentType: 'application/json',
  32  |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
  33  |       })
  34  |     );
  35  |     await page.route('**/api/users/roommate-profile', (route) =>
  36  |       route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'No profile' }) })
  37  |     );
  38  |     await page.route('**/api/users/roommate-matches', (route) =>
  39  |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  40  |     );
  41  |   });
  42  | 
  43  |   test('roommate page renders the hero heading', async ({ page }) => {
  44  |     await page.goto('/roommates');
  45  |     await expect(page.locator('h1')).toContainText('Match with students who fit your lifestyle.', {
  46  |       timeout: 10_000,
  47  |     });
  48  |   });
  49  | 
  50  |   test('"Find Roommate" eyebrow label is visible', async ({ page }) => {
  51  |     await page.goto('/roommates');
> 52  |     await expect(page.locator('.eyebrow', { hasText: 'Find Roommate' })).toBeVisible({ timeout: 10_000 });
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  53  |   });
  54  | 
  55  |   test('active match count shows 0 when there are no matches', async ({ page }) => {
  56  |     await page.goto('/roommates');
  57  |     const summaryCard = page.locator('.summaryCard');
  58  |     await expect(summaryCard).toBeVisible({ timeout: 10_000 });
  59  |     await expect(summaryCard.locator('strong')).toContainText('0');
  60  |   });
  61  | 
  62  |   test('questionnaire form is rendered with all sections', async ({ page }) => {
  63  |     await page.goto('/roommates');
  64  |     const form = page.locator('.roommateForm');
  65  |     await expect(form).toBeVisible({ timeout: 10_000 });
  66  |     await expect(page.locator('text=Location & Budget')).toBeVisible();
  67  |     await expect(page.locator('text=Study & Routine')).toBeVisible();
  68  |     await expect(page.locator('text=Lifestyle Preferences')).toBeVisible();
  69  |   });
  70  | 
  71  |   test('all required dropdowns are present in the form', async ({ page }) => {
  72  |     await page.goto('/roommates');
  73  |     await expect(page.locator('select[name="preferredCity"]')).toBeVisible({ timeout: 10_000 });
  74  |     await expect(page.locator('select[name="university"]')).toBeVisible();
  75  |     await expect(page.locator('select[name="yearOfStudy"]')).toBeVisible();
  76  |     await expect(page.locator('select[name="sleepSchedule"]')).toBeVisible();
  77  |     await expect(page.locator('select[name="studyHabit"]')).toBeVisible();
  78  |     await expect(page.locator('select[name="cleanlinessLevel"]')).toBeVisible();
  79  |     await expect(page.locator('select[name="sociabilityLevel"]')).toBeVisible();
  80  |     await expect(page.locator('select[name="smokingAllowed"]')).toBeVisible();
  81  |     await expect(page.locator('select[name="petsAllowed"]')).toBeVisible();
  82  |     await expect(page.locator('select[name="foodPreference"]')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('city dropdown contains Sri Lankan cities', async ({ page }) => {
  86  |     await page.goto('/roommates');
  87  |     const citySelect = page.locator('select[name="preferredCity"]');
  88  |     await expect(citySelect).toBeVisible({ timeout: 10_000 });
  89  |     await expect(citySelect.locator('option', { hasText: 'Colombo' })).toBeAttached();
  90  |     await expect(citySelect.locator('option', { hasText: 'Kandy' })).toBeAttached();
  91  |     await expect(citySelect.locator('option', { hasText: 'Galle' })).toBeAttached();
  92  |   });
  93  | 
  94  |   test('university dropdown contains valid options', async ({ page }) => {
  95  |     await page.goto('/roommates');
  96  |     const uniSelect = page.locator('select[name="university"]');
  97  |     await expect(uniSelect).toBeVisible({ timeout: 10_000 });
  98  |     await expect(uniSelect.locator('option', { hasText: 'University of Peradeniya' })).toBeAttached();
  99  |     await expect(uniSelect.locator('option', { hasText: 'University of Colombo' })).toBeAttached();
  100 |   });
  101 | 
  102 |   test('"Back to Dashboard" and "View Watchlist" hero buttons are present', async ({ page }) => {
  103 |     await page.goto('/roommates');
  104 |     await expect(page.locator('button', { hasText: 'Back to Dashboard' })).toBeVisible({ timeout: 10_000 });
  105 |     await expect(page.locator('button', { hasText: 'View Watchlist' })).toBeVisible();
  106 |   });
  107 | 
  108 |   test('empty matches state message is shown when no profile exists', async ({ page }) => {
  109 |     await page.goto('/roommates');
  110 |     const emptyState = page.locator('.emptyState');
  111 |     await expect(emptyState).toBeVisible({ timeout: 10_000 });
  112 |     await expect(emptyState).toContainText('No roommate matches yet');
  113 |   });
  114 | });
  115 | 
  116 | test.describe('Roommate Finder — Form Validation', () => {
  117 |   test.beforeEach(async ({ page }) => {
  118 |     await page.route('**/api/users/notifications', (route) =>
  119 |       route.fulfill({
  120 |         status: 200,
  121 |         contentType: 'application/json',
  122 |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
  123 |       })
  124 |     );
  125 |     await page.route('**/api/users/roommate-profile', (route) =>
  126 |       route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  127 |     );
  128 |     await page.route('**/api/users/roommate-matches', (route) =>
  129 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  130 |     );
  131 |   });
  132 | 
  133 |   test('submitting an empty form shows validation errors', async ({ page }) => {
  134 |     await page.goto('/roommates');
  135 |     await page.locator('button[type="submit"]').click();
  136 |     await expect(page.locator('small', { hasText: 'Please select a preferred city.' })).toBeVisible({ timeout: 5_000 });
  137 |     await expect(page.locator('small', { hasText: 'Preferred area is required.' })).toBeVisible();
  138 |     await expect(page.locator('small', { hasText: 'Minimum budget is required.' })).toBeVisible();
  139 |     await expect(page.locator('small', { hasText: 'Maximum budget is required.' })).toBeVisible();
  140 |   });
  141 | 
  142 |   test('age validation rejects values below 16', async ({ page }) => {
  143 |     await page.goto('/roommates');
  144 |     await page.locator('input[name="age"]').fill('10');
  145 |     await page.locator('input[name="age"]').blur();
  146 |     await expect(page.locator('small', { hasText: 'Age must be between 16 and 60.' })).toBeVisible({ timeout: 5_000 });
  147 |   });
  148 | 
  149 |   test('age validation rejects values above 60', async ({ page }) => {
  150 |     await page.goto('/roommates');
  151 |     await page.locator('input[name="age"]').fill('65');
  152 |     await page.locator('input[name="age"]').blur();
```