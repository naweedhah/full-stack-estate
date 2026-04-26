# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.js >> Notification Bell — Navbar >> "Mark all read" calls the API and clears the badge
- Location: e2e/notifications.spec.js:184:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
        - generic [ref=e17]:
          - button "Open alerts" [ref=e18] [cursor=pointer]:
            - img [ref=e19]
          - generic [ref=e22]:
            - generic [ref=e23]:
              - strong [ref=e24]: Notifications
              - generic [ref=e26]: 0 unseen
            - button "booking Booking Approved Your booking for Cozy Room in Kandy has been approved." [ref=e28] [cursor=pointer]:
              - generic [ref=e29]: booking
              - strong [ref=e30]: Booking Approved
              - generic [ref=e31]: Your booking for Cozy Room in Kandy has been approved.
        - generic [ref=e33]:
          - strong [ref=e34]: teststudent
          - generic [ref=e35]: student
        - link "Dashboard" [ref=e36] [cursor=pointer]:
          - /url: /profile
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]: Menu
          - button "Close" [ref=e40] [cursor=pointer]
        - generic [ref=e41]:
          - link "Home" [ref=e42] [cursor=pointer]:
            - /url: /
          - link "Find Boardings" [ref=e43] [cursor=pointer]:
            - /url: /list
          - link "Find Roommate" [ref=e44] [cursor=pointer]:
            - /url: /roommates
          - link "Watchlist" [ref=e45] [cursor=pointer]:
            - /url: /watchlist
          - link "About" [ref=e46] [cursor=pointer]:
            - /url: /
        - generic [ref=e47]:
          - generic [ref=e49]:
            - strong [ref=e50]: teststudent
            - generic [ref=e51]: student
          - link "Alerts" [ref=e52] [cursor=pointer]:
            - /url: /profile#notifications
          - link "Dashboard" [ref=e53] [cursor=pointer]:
            - /url: /profile
  - generic [ref=e57]:
    - heading "Find Safe, Smart Boarding Near Your Campus" [level=1] [ref=e58]
    - paragraph [ref=e59]: Discover student-friendly boarding places, compare amenities, shortlist the right stay, and connect with owners without losing the familiar experience of the current app.
    - generic [ref=e60]:
      - generic [ref=e61]:
        - button "Any" [ref=e62] [cursor=pointer]
        - button "Male" [ref=e63] [cursor=pointer]
        - button "Female" [ref=e64] [cursor=pointer]
      - generic [ref=e65]:
        - textbox "City" [ref=e66]
        - textbox "Area" [ref=e67]
        - spinbutton [ref=e68]
        - spinbutton [ref=e69]
        - link [ref=e70] [cursor=pointer]:
          - /url: /list?preferredTenantGender=any&city=&area=&minPrice=0&maxPrice=0
          - button [ref=e71]
    - generic [ref=e72]:
      - generic [ref=e73]:
        - heading "500+" [level=1] [ref=e74]
        - heading "Boardings Listed" [level=2] [ref=e75]
      - generic [ref=e76]:
        - heading "24/7" [level=1] [ref=e77]
        - heading "Smart Alerts" [level=2] [ref=e78]
      - generic [ref=e79]:
        - heading "1000+" [level=1] [ref=e80]
        - heading "Students Helped" [level=2] [ref=e81]
```

# Test source

```ts
  107 |     await expect(page.locator('.notifications .notification')).not.toBeVisible();
  108 |   });
  109 | 
  110 |   test('clicking the bell opens the alerts dropdown', async ({ page }) => {
  111 |     await page.route('**/api/users/notifications', (route) =>
  112 |       route.fulfill({
  113 |         status: 200,
  114 |         contentType: 'application/json',
  115 |         body: JSON.stringify({
  116 |           unseenCount: 1,
  117 |           notifications: [UNREAD_NOTIFICATION],
  118 |           preferences: MOCK_PREFERENCES,
  119 |         }),
  120 |       })
  121 |     );
  122 | 
  123 |     await page.goto('/');
  124 |     await page.locator('button[aria-label="Open alerts"]').click();
  125 |     await expect(page.locator('.alertsDropdown')).toBeVisible({ timeout: 5_000 });
  126 |   });
  127 | 
  128 |   test('alerts dropdown shows notification title and message', async ({ page }) => {
  129 |     await page.route('**/api/users/notifications', (route) =>
  130 |       route.fulfill({
  131 |         status: 200,
  132 |         contentType: 'application/json',
  133 |         body: JSON.stringify({
  134 |           unseenCount: 1,
  135 |           notifications: [UNREAD_NOTIFICATION],
  136 |           preferences: MOCK_PREFERENCES,
  137 |         }),
  138 |       })
  139 |     );
  140 | 
  141 |     await page.goto('/');
  142 |     await page.locator('button[aria-label="Open alerts"]').click();
  143 |     const dropdown = page.locator('.alertsDropdown');
  144 |     await expect(dropdown).toContainText('Booking Approved');
  145 |     await expect(dropdown).toContainText('Your booking for Cozy Room in Kandy has been approved.');
  146 |   });
  147 | 
  148 |   test('dropdown header shows unseen count', async ({ page }) => {
  149 |     await page.route('**/api/users/notifications', (route) =>
  150 |       route.fulfill({
  151 |         status: 200,
  152 |         contentType: 'application/json',
  153 |         body: JSON.stringify({
  154 |           unseenCount: 1,
  155 |           notifications: [UNREAD_NOTIFICATION],
  156 |           preferences: MOCK_PREFERENCES,
  157 |         }),
  158 |       })
  159 |     );
  160 | 
  161 |     await page.goto('/');
  162 |     await page.locator('button[aria-label="Open alerts"]').click();
  163 |     await expect(page.locator('.alertsHeader')).toContainText('1 unseen');
  164 |   });
  165 | 
  166 |   test('"Mark all read" button appears when there are unseen notifications', async ({ page }) => {
  167 |     await page.route('**/api/users/notifications', (route) =>
  168 |       route.fulfill({
  169 |         status: 200,
  170 |         contentType: 'application/json',
  171 |         body: JSON.stringify({
  172 |           unseenCount: 1,
  173 |           notifications: [UNREAD_NOTIFICATION],
  174 |           preferences: MOCK_PREFERENCES,
  175 |         }),
  176 |       })
  177 |     );
  178 | 
  179 |     await page.goto('/');
  180 |     await page.locator('button[aria-label="Open alerts"]').click();
  181 |     await expect(page.locator('.alertsMeta button', { hasText: 'Mark all read' })).toBeVisible();
  182 |   });
  183 | 
  184 |   test('"Mark all read" calls the API and clears the badge', async ({ page }) => {
  185 |     await page.route('**/api/users/notifications', (route) =>
  186 |       route.fulfill({
  187 |         status: 200,
  188 |         contentType: 'application/json',
  189 |         body: JSON.stringify({
  190 |           unseenCount: 1,
  191 |           notifications: [UNREAD_NOTIFICATION],
  192 |           preferences: MOCK_PREFERENCES,
  193 |         }),
  194 |       })
  195 |     );
  196 | 
  197 |     let markAllReadCalled = false;
  198 |     await page.route('**/api/users/notifications/read-all', (route) => {
  199 |       markAllReadCalled = true;
  200 |       route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  201 |     });
  202 | 
  203 |     await page.goto('/');
  204 |     await page.locator('button[aria-label="Open alerts"]').click();
  205 |     await page.locator('.alertsMeta button', { hasText: 'Mark all read' }).click();
  206 | 
> 207 |     expect(markAllReadCalled).toBe(true);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  208 |     await expect(page.locator('.notifications .notification')).not.toBeVisible({ timeout: 5_000 });
  209 |   });
  210 | 
  211 |   test('empty state message shown when there are no notifications', async ({ page }) => {
  212 |     await page.route('**/api/users/notifications', (route) =>
  213 |       route.fulfill({
  214 |         status: 200,
  215 |         contentType: 'application/json',
  216 |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
  217 |       })
  218 |     );
  219 | 
  220 |     await page.goto('/');
  221 |     await page.locator('button[aria-label="Open alerts"]').click();
  222 |     await expect(page.locator('.alertsEmpty')).toBeVisible();
  223 |     await expect(page.locator('.alertsEmpty')).toContainText('No alerts yet.');
  224 |   });
  225 | });
  226 | 
  227 | test.describe('Notification Preferences — Student Dashboard', () => {
  228 |   test.beforeEach(async ({ page }) => {
  229 |     await page.route('**/api/users/notifications', (route) =>
  230 |       route.fulfill({
  231 |         status: 200,
  232 |         contentType: 'application/json',
  233 |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: MOCK_PREFERENCES }),
  234 |       })
  235 |     );
  236 |     await profileRoutes(page);
  237 |   });
  238 | 
  239 |   test('smart alerts panel is visible on the student dashboard', async ({ page }) => {
  240 |     await page.goto('/profile');
  241 |     await expect(page.locator('.smartAlertsPanel')).toBeVisible({ timeout: 15_000 });
  242 |   });
  243 | 
  244 |   test('notification preference toggles are rendered', async ({ page }) => {
  245 |     await page.goto('/profile');
  246 |     await expect(page.locator('.preferenceToggle')).toHaveCount(4, { timeout: 15_000 });
  247 |   });
  248 | 
  249 |   test('"Booking updates" toggle is checked when preference is enabled', async ({ page }) => {
  250 |     await page.goto('/profile');
  251 |     const bookingToggle = page.locator('.preferenceToggle').filter({ hasText: 'Booking updates' }).locator('input[type="checkbox"]');
  252 |     await expect(bookingToggle).toBeChecked({ timeout: 15_000 });
  253 |   });
  254 | 
  255 |   test('"Price drops" toggle is unchecked when preference is disabled', async ({ page }) => {
  256 |     await page.goto('/profile');
  257 |     const priceToggle = page.locator('.preferenceToggle').filter({ hasText: 'Price drops' }).locator('input[type="checkbox"]');
  258 |     await expect(priceToggle).not.toBeChecked({ timeout: 15_000 });
  259 |   });
  260 | 
  261 |   test('toggling a preference calls the update API', async ({ page }) => {
  262 |     let prefUpdateCalled = false;
  263 |     await page.route('**/api/users/notifications/preferences', async (route) => {
  264 |       if (route.request().method() === 'PUT') {
  265 |         prefUpdateCalled = true;
  266 |         await route.fulfill({
  267 |           status: 200,
  268 |           contentType: 'application/json',
  269 |           body: JSON.stringify({ ...MOCK_PREFERENCES, priceAlerts: true }),
  270 |         });
  271 |       } else {
  272 |         await route.fulfill({
  273 |           status: 200,
  274 |           contentType: 'application/json',
  275 |           body: JSON.stringify(MOCK_PREFERENCES),
  276 |         });
  277 |       }
  278 |     });
  279 | 
  280 |     await page.goto('/profile');
  281 |     const priceToggle = page.locator('.preferenceToggle').filter({ hasText: 'Price drops' }).locator('input[type="checkbox"]');
  282 |     await priceToggle.waitFor({ state: 'visible', timeout: 15_000 });
  283 |     await priceToggle.check();
  284 | 
  285 |     expect(prefUpdateCalled).toBe(true);
  286 |   });
  287 | 
  288 |   test('"Send Test Email" button is visible', async ({ page }) => {
  289 |     await page.goto('/profile');
  290 |     const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
  291 |     await expect(testEmailBtn).toBeVisible({ timeout: 15_000 });
  292 |   });
  293 | 
  294 |   test('"Send Test Email" calls the test-email API', async ({ page }) => {
  295 |     let testEmailCalled = false;
  296 |     await page.route('**/api/users/notifications/test-email', (route) => {
  297 |       testEmailCalled = true;
  298 |       route.fulfill({
  299 |         status: 200,
  300 |         contentType: 'application/json',
  301 |         body: JSON.stringify({ message: 'Test email sent successfully.' }),
  302 |       });
  303 |     });
  304 | 
  305 |     await page.goto('/profile');
  306 |     const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
  307 |     await testEmailBtn.waitFor({ state: 'visible', timeout: 15_000 });
```