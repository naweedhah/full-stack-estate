# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.js >> Notification Preferences — Student Dashboard >> toggling a preference calls the update API
- Location: e2e/notifications.spec.js:261:3

# Error details

```
Error: locator.check: Clicking the checkbox did not change its state
Call log:
  - waiting for locator('.preferenceToggle').filter({ hasText: 'Price drops' }).locator('input[type="checkbox"]')
    - locator resolved to <input type="checkbox" name="priceAlerts"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

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
  - generic [ref=e45]:
    - generic [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]:
          - paragraph [ref=e50]: Student Dashboard
          - heading "Welcome back, Test Student" [level=1] [ref=e51]
          - paragraph [ref=e52]: Track your saved boardings, booking activity, messages, alerts, and roommate preferences from one place.
          - generic [ref=e53]:
            - link "Find Boardings" [ref=e54] [cursor=pointer]:
              - /url: /list
              - button "Find Boardings" [ref=e55]
            - link "Update Profile" [ref=e56] [cursor=pointer]:
              - /url: /profile/update
              - button "Update Profile" [ref=e57]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - heading "teststudent" [level=2] [ref=e60]
            - generic [ref=e61]: test@university.lk
            - generic [ref=e62]: Add your phone number
          - generic [ref=e63]:
            - generic [ref=e64]: student
            - generic [ref=e65]: male
            - generic [ref=e66]: Verified
          - button "Logout" [ref=e67] [cursor=pointer]
      - generic [ref=e68]:
        - article [ref=e69]:
          - heading "0" [level=2] [ref=e70]
          - paragraph [ref=e71]: Saved Boardings
        - article [ref=e72]:
          - heading "0" [level=2] [ref=e73]
          - paragraph [ref=e74]: Pending Requests
        - article [ref=e75]:
          - heading "0" [level=2] [ref=e76]
          - paragraph [ref=e77]: Confirmed Bookings
        - article [ref=e78]:
          - heading "0" [level=2] [ref=e79]
          - paragraph [ref=e80]: Roommate Matches
      - generic [ref=e81]:
        - article [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - paragraph [ref=e85]: Requests
              - heading "Booking Requests" [level=3] [ref=e86]
            - link "Browse" [ref=e87] [cursor=pointer]:
              - /url: /list
          - generic [ref=e88]:
            - generic [ref=e89]:
              - strong [ref=e90]: "0"
              - generic [ref=e91]: Pending
            - generic [ref=e92]:
              - strong [ref=e93]: "0"
              - generic [ref=e94]: Approved
            - generic [ref=e95]:
              - strong [ref=e96]: "0"
              - generic [ref=e97]: Payment Due
          - paragraph [ref=e98]: Once you request a boarding, the owner's decision and payment step will show up here.
        - article [ref=e99]:
          - generic [ref=e101]:
            - paragraph [ref=e102]: Alerts
            - heading "Notifications" [level=3] [ref=e103]
          - generic [ref=e104]:
            - generic [ref=e105]:
              - strong [ref=e106]: No unseen alerts
              - generic [ref=e107]: Your notification feed is up to date right now.
            - generic [ref=e108]:
              - strong [ref=e109]: Booking updates
              - generic [ref=e110]: Approvals, rejections, and payment reminders will appear here.
            - generic [ref=e111]:
              - strong [ref=e112]: Watchlist alerts
              - generic [ref=e113]: We will surface newly available boardings that match your filters.
        - article [ref=e114]:
          - generic [ref=e116]:
            - paragraph [ref=e117]: Watchlist
            - heading "Tracked Boardings" [level=3] [ref=e118]
          - paragraph [ref=e119]: Save boardings or filter-based watchlists to receive availability alerts here.
        - article [ref=e120]:
          - generic [ref=e121]:
            - generic [ref=e122]:
              - paragraph [ref=e123]: Matching
              - heading "Roommate Finder" [level=3] [ref=e124]
            - link "Open Finder" [ref=e125] [cursor=pointer]:
              - /url: /roommates
          - paragraph [ref=e126]: Add your lifestyle and budget preferences to unlock same-gender roommate suggestions and compatibility scores.
        - article [ref=e127]:
          - generic [ref=e128]:
            - generic [ref=e129]:
              - paragraph [ref=e130]: Intelligence
              - heading "Smart Alerts" [level=3] [ref=e131]
            - link "Open Watchlist" [ref=e132] [cursor=pointer]:
              - /url: /watchlist
          - paragraph [ref=e134]: Notification preferences updated.
          - generic [ref=e135]:
            - generic [ref=e136]:
              - generic [ref=e137]:
                - strong [ref=e138]: Booking updates
                - text: Live right now
              - checkbox "Booking updates Live right now" [checked] [ref=e139]
            - generic [ref=e140]:
              - generic [ref=e141]:
                - strong [ref=e142]: Search alerts
                - text: Live right now
              - checkbox "Search alerts Live right now" [checked] [ref=e143]
            - generic [ref=e144]:
              - generic [ref=e145]:
                - strong [ref=e146]: Price drops
                - text: Live right now
              - checkbox "Price drops Live right now" [checked] [ref=e147]
            - generic [ref=e148]:
              - generic [ref=e149]:
                - strong [ref=e150]: Roommate matches
                - text: Currently paused
              - checkbox "Roommate matches Currently paused" [ref=e151]
          - generic [ref=e152]:
            - generic [ref=e153]:
              - strong [ref=e154]: Saved Search Alerts
              - generic [ref=e155]: 0 active
            - paragraph [ref=e156]: Create saved searches from the watchlist page to get live alerts for new matching boardings, price drops, and demand spikes.
          - generic [ref=e157]:
            - generic [ref=e158]:
              - strong [ref=e159]: SMTP Test
              - generic [ref=e160]: Send a test notification email to your account to verify the email channel is working.
            - button "Send Test Email" [ref=e161] [cursor=pointer]
      - generic [ref=e162]:
        - generic [ref=e163]:
          - generic [ref=e164]:
            - paragraph [ref=e165]: Shortlist
            - heading "Saved Boardings" [level=3] [ref=e166]
          - link "Explore More" [ref=e167] [cursor=pointer]:
            - /url: /list
        - generic [ref=e168]:
          - paragraph [ref=e169]: You have not saved any boardings yet. Start browsing and save the ones you want to revisit.
          - link "Browse Boardings" [ref=e170] [cursor=pointer]:
            - /url: /list
            - button "Browse Boardings" [ref=e171]
    - generic [ref=e174]:
      - generic [ref=e175]:
        - generic [ref=e176]:
          - paragraph [ref=e177]: Conversations
          - heading "Messages" [level=3] [ref=e178]
        - generic [ref=e179]:
          - generic [ref=e180]: 0 chats
          - button "Expand" [ref=e181] [cursor=pointer]
      - generic [ref=e182]:
        - strong [ref=e183]: Chat panel hidden
        - paragraph [ref=e184]: Reopen messages whenever you want to reply to owners or roommate matches.
```

# Test source

```ts
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
  207 |     expect(markAllReadCalled).toBe(true);
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
> 283 |     await priceToggle.check();
      |                       ^ Error: locator.check: Clicking the checkbox did not change its state
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
  308 |     await testEmailBtn.click();
  309 | 
  310 |     expect(testEmailCalled).toBe(true);
  311 |   });
  312 | 
  313 |   test('success message shown after test email is sent', async ({ page }) => {
  314 |     await page.route('**/api/users/notifications/test-email', (route) =>
  315 |       route.fulfill({
  316 |         status: 200,
  317 |         contentType: 'application/json',
  318 |         body: JSON.stringify({ message: 'Test email sent successfully.' }),
  319 |       })
  320 |     );
  321 | 
  322 |     await page.goto('/profile');
  323 |     const testEmailBtn = page.locator('button', { hasText: 'Send Test Email' });
  324 |     await testEmailBtn.waitFor({ state: 'visible', timeout: 15_000 });
  325 |     await testEmailBtn.click();
  326 | 
  327 |     await expect(page.locator('.dashboardSuccess')).toBeVisible({ timeout: 5_000 });
  328 |     await expect(page.locator('.dashboardSuccess')).toContainText('Test email sent');
  329 |   });
  330 | 
  331 |   test('notifications panel shows unread items from the store', async ({ page }) => {
  332 |     await page.route('**/api/users/notifications', (route) =>
  333 |       route.fulfill({
  334 |         status: 200,
  335 |         contentType: 'application/json',
  336 |         body: JSON.stringify({
  337 |           unseenCount: 1,
  338 |           notifications: [UNREAD_NOTIFICATION, READ_NOTIFICATION],
  339 |           preferences: MOCK_PREFERENCES,
  340 |         }),
  341 |       })
  342 |     );
  343 | 
  344 |     await page.goto('/profile');
  345 |     const notifPanel = page.locator('#notifications');
  346 |     await expect(notifPanel).toBeVisible({ timeout: 15_000 });
  347 |     await expect(notifPanel).toContainText('Booking Approved');
  348 |     await expect(notifPanel).toContainText('New Boarding Available');
  349 |   });
  350 | });
  351 | 
```