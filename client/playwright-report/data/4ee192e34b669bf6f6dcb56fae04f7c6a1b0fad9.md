# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roommate-finder.spec.js >> Roommate Finder — Form Validation >> age validation rejects values below 16
- Location: e2e/roommate-finder.spec.js:142:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="age"]')

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
  44  |     await page.goto('/roommates');
  45  |     await expect(page.locator('h1')).toContainText('Match with students who fit your lifestyle.', {
  46  |       timeout: 10_000,
  47  |     });
  48  |   });
  49  | 
  50  |   test('"Find Roommate" eyebrow label is visible', async ({ page }) => {
  51  |     await page.goto('/roommates');
  52  |     await expect(page.locator('.eyebrow', { hasText: 'Find Roommate' })).toBeVisible({ timeout: 10_000 });
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
> 144 |     await page.locator('input[name="age"]').fill('10');
      |                                             ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  145 |     await page.locator('input[name="age"]').blur();
  146 |     await expect(page.locator('small', { hasText: 'Age must be between 16 and 60.' })).toBeVisible({ timeout: 5_000 });
  147 |   });
  148 | 
  149 |   test('age validation rejects values above 60', async ({ page }) => {
  150 |     await page.goto('/roommates');
  151 |     await page.locator('input[name="age"]').fill('65');
  152 |     await page.locator('input[name="age"]').blur();
  153 |     await expect(page.locator('small', { hasText: 'Age must be between 16 and 60.' })).toBeVisible({ timeout: 5_000 });
  154 |   });
  155 | 
  156 |   test('budget min below 5000 shows an error', async ({ page }) => {
  157 |     await page.goto('/roommates');
  158 |     await page.locator('input[name="budgetMin"]').fill('3000');
  159 |     await page.locator('input[name="budgetMin"]').blur();
  160 |     await expect(
  161 |       page.locator('small', { hasText: 'Minimum budget must be at least LKR 5,000.' })
  162 |     ).toBeVisible({ timeout: 5_000 });
  163 |   });
  164 | 
  165 |   test('budget max less than budget min shows an error', async ({ page }) => {
  166 |     await page.goto('/roommates');
  167 |     await page.locator('input[name="budgetMin"]').fill('20000');
  168 |     await page.locator('input[name="budgetMax"]').fill('10000');
  169 |     await page.locator('input[name="budgetMax"]').blur();
  170 |     await expect(
  171 |       page.locator('small', { hasText: 'Maximum budget must be greater than or equal to minimum budget.' })
  172 |     ).toBeVisible({ timeout: 5_000 });
  173 |   });
  174 | 
  175 |   test('notes exceeding 300 characters shows an error', async ({ page }) => {
  176 |     await page.goto('/roommates');
  177 |     const longNote = 'A'.repeat(301);
  178 |     await page.locator('textarea[name="notes"]').fill(longNote);
  179 |     await page.locator('textarea[name="notes"]').blur();
  180 |     await expect(page.locator('small', { hasText: 'Notes must stay within 300 characters.' })).toBeVisible({ timeout: 5_000 });
  181 |   });
  182 | 
  183 |   test('preferred area shorter than 2 characters shows an error', async ({ page }) => {
  184 |     await page.goto('/roommates');
  185 |     await page.locator('input[name="preferredArea"]').fill('X');
  186 |     await page.locator('input[name="preferredArea"]').blur();
  187 |     await expect(
  188 |       page.locator('small', { hasText: 'Preferred area must be at least 2 characters.' })
  189 |     ).toBeVisible({ timeout: 5_000 });
  190 |   });
  191 | });
  192 | 
  193 | test.describe('Roommate Finder — Save and Matches', () => {
  194 |   test.beforeEach(async ({ page }) => {
  195 |     await page.route('**/api/users/notifications', (route) =>
  196 |       route.fulfill({
  197 |         status: 200,
  198 |         contentType: 'application/json',
  199 |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
  200 |       })
  201 |     );
  202 |     await page.route('**/api/users/roommate-profile', (route) =>
  203 |       route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  204 |     );
  205 |     await page.route('**/api/users/roommate-matches', (route) =>
  206 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  207 |     );
  208 |   });
  209 | 
  210 |   test('filling and submitting valid form calls the save API', async ({ page }) => {
  211 |     let saveCalled = false;
  212 |     await page.route('**/api/users/roommate-profile', async (route) => {
  213 |       if (route.request().method() === 'PUT') {
  214 |         saveCalled = true;
  215 |         await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  216 |       } else {
  217 |         await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  218 |       }
  219 |     });
  220 |     await page.route('**/api/users/roommate-matches', (route) =>
  221 |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_MATCH]) })
  222 |     );
  223 | 
  224 |     await page.goto('/roommates');
  225 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
  226 |     await page.locator('input[name="preferredArea"]').fill('Peradeniya');
  227 |     await page.locator('input[name="budgetMin"]').fill('10000');
  228 |     await page.locator('input[name="budgetMax"]').fill('20000');
  229 |     await page.locator('select[name="university"]').selectOption('University of Peradeniya');
  230 |     await page.locator('input[name="faculty"]').fill('Engineering');
  231 |     await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
  232 |     await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
  233 |     await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
  234 |     await page.locator('input[name="age"]').fill('22');
  235 |     await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
  236 |     await page.locator('select[name="sociabilityLevel"]').selectOption('3');
  237 |     await page.locator('select[name="smokingAllowed"]').selectOption('false');
  238 |     await page.locator('select[name="petsAllowed"]').selectOption('false');
  239 |     await page.locator('select[name="foodPreference"]').selectOption('No special preference');
  240 | 
  241 |     await page.locator('button[type="submit"]').click();
  242 |     await expect(page.locator('.successText')).toBeVisible({ timeout: 10_000 });
  243 |     expect(saveCalled).toBe(true);
  244 |   });
```