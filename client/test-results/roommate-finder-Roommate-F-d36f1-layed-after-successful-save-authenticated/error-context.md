# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roommate-finder.spec.js >> Roommate Finder — Save and Matches >> match card is displayed after successful save
- Location: e2e/roommate-finder.spec.js:282:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select[name="preferredCity"]')

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
  245 | 
  246 |   test('success message appears after saving preferences', async ({ page }) => {
  247 |     await page.route('**/api/users/roommate-profile', async (route) => {
  248 |       if (route.request().method() === 'PUT') {
  249 |         await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  250 |       } else {
  251 |         await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  252 |       }
  253 |     });
  254 |     await page.route('**/api/users/roommate-matches', (route) =>
  255 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  256 |     );
  257 | 
  258 |     await page.goto('/roommates');
  259 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
  260 |     await page.locator('input[name="preferredArea"]').fill('Peradeniya');
  261 |     await page.locator('input[name="budgetMin"]').fill('10000');
  262 |     await page.locator('input[name="budgetMax"]').fill('20000');
  263 |     await page.locator('select[name="university"]').selectOption('University of Peradeniya');
  264 |     await page.locator('input[name="faculty"]').fill('Engineering');
  265 |     await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
  266 |     await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
  267 |     await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
  268 |     await page.locator('input[name="age"]').fill('22');
  269 |     await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
  270 |     await page.locator('select[name="sociabilityLevel"]').selectOption('3');
  271 |     await page.locator('select[name="smokingAllowed"]').selectOption('false');
  272 |     await page.locator('select[name="petsAllowed"]').selectOption('false');
  273 |     await page.locator('select[name="foodPreference"]').selectOption('No special preference');
  274 | 
  275 |     await page.locator('button[type="submit"]').click();
  276 |     await expect(page.locator('.successText')).toContainText(
  277 |       'Roommate preferences saved. Your latest matches are ready.',
  278 |       { timeout: 10_000 }
  279 |     );
  280 |   });
  281 | 
  282 |   test('match card is displayed after successful save', async ({ page }) => {
  283 |     await page.route('**/api/users/roommate-profile', (route) => {
  284 |       if (route.request().method() === 'PUT') {
  285 |         route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  286 |       } else {
  287 |         route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  288 |       }
  289 |     });
  290 | 
  291 |     let matchCallCount = 0;
  292 |     await page.route('**/api/users/roommate-matches', (route) => {
  293 |       matchCallCount++;
  294 |       const body = matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]';
  295 |       route.fulfill({ status: 200, contentType: 'application/json', body });
  296 |     });
  297 | 
  298 |     await page.goto('/roommates');
> 299 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
      |                                                        ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  300 |     await page.locator('input[name="preferredArea"]').fill('Peradeniya');
  301 |     await page.locator('input[name="budgetMin"]').fill('10000');
  302 |     await page.locator('input[name="budgetMax"]').fill('20000');
  303 |     await page.locator('select[name="university"]').selectOption('University of Peradeniya');
  304 |     await page.locator('input[name="faculty"]').fill('Engineering');
  305 |     await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
  306 |     await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
  307 |     await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
  308 |     await page.locator('input[name="age"]').fill('22');
  309 |     await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
  310 |     await page.locator('select[name="sociabilityLevel"]').selectOption('3');
  311 |     await page.locator('select[name="smokingAllowed"]').selectOption('false');
  312 |     await page.locator('select[name="petsAllowed"]').selectOption('false');
  313 |     await page.locator('select[name="foodPreference"]').selectOption('No special preference');
  314 | 
  315 |     await page.locator('button[type="submit"]').click();
  316 |     await expect(page.locator('.matchCard')).toBeVisible({ timeout: 10_000 });
  317 |   });
  318 | 
  319 |   test('match card shows compatibility score badge', async ({ page }) => {
  320 |     await page.route('**/api/users/roommate-profile', (route) => {
  321 |       if (route.request().method() === 'PUT') {
  322 |         route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  323 |       } else {
  324 |         route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  325 |       }
  326 |     });
  327 |     let matchCallCount = 0;
  328 |     await page.route('**/api/users/roommate-matches', (route) => {
  329 |       matchCallCount++;
  330 |       route.fulfill({
  331 |         status: 200,
  332 |         contentType: 'application/json',
  333 |         body: matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]',
  334 |       });
  335 |     });
  336 | 
  337 |     await page.goto('/roommates');
  338 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
  339 |     await page.locator('input[name="preferredArea"]').fill('Peradeniya');
  340 |     await page.locator('input[name="budgetMin"]').fill('10000');
  341 |     await page.locator('input[name="budgetMax"]').fill('20000');
  342 |     await page.locator('select[name="university"]').selectOption('University of Peradeniya');
  343 |     await page.locator('input[name="faculty"]').fill('Engineering');
  344 |     await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
  345 |     await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
  346 |     await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
  347 |     await page.locator('input[name="age"]').fill('22');
  348 |     await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
  349 |     await page.locator('select[name="sociabilityLevel"]').selectOption('3');
  350 |     await page.locator('select[name="smokingAllowed"]').selectOption('false');
  351 |     await page.locator('select[name="petsAllowed"]').selectOption('false');
  352 |     await page.locator('select[name="foodPreference"]').selectOption('No special preference');
  353 | 
  354 |     await page.locator('button[type="submit"]').click();
  355 |     await expect(page.locator('.scoreBadge')).toContainText('87%', { timeout: 10_000 });
  356 |   });
  357 | 
  358 |   test('match card shows match reasons', async ({ page }) => {
  359 |     await page.route('**/api/users/roommate-profile', (route) => {
  360 |       if (route.request().method() === 'PUT') {
  361 |         route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  362 |       } else {
  363 |         route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  364 |       }
  365 |     });
  366 |     let matchCallCount = 0;
  367 |     await page.route('**/api/users/roommate-matches', (route) => {
  368 |       matchCallCount++;
  369 |       route.fulfill({
  370 |         status: 200,
  371 |         contentType: 'application/json',
  372 |         body: matchCallCount > 1 ? JSON.stringify([MOCK_MATCH]) : '[]',
  373 |       });
  374 |     });
  375 | 
  376 |     await page.goto('/roommates');
  377 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
  378 |     await page.locator('input[name="preferredArea"]').fill('Peradeniya');
  379 |     await page.locator('input[name="budgetMin"]').fill('10000');
  380 |     await page.locator('input[name="budgetMax"]').fill('20000');
  381 |     await page.locator('select[name="university"]').selectOption('University of Peradeniya');
  382 |     await page.locator('input[name="faculty"]').fill('Engineering');
  383 |     await page.locator('select[name="yearOfStudy"]').selectOption('2nd Year');
  384 |     await page.locator('select[name="sleepSchedule"]').selectOption('Sleeps before midnight');
  385 |     await page.locator('select[name="studyHabit"]').selectOption('Quiet evenings');
  386 |     await page.locator('input[name="age"]').fill('22');
  387 |     await page.locator('select[name="cleanlinessLevel"]').selectOption('3');
  388 |     await page.locator('select[name="sociabilityLevel"]').selectOption('3');
  389 |     await page.locator('select[name="smokingAllowed"]').selectOption('false');
  390 |     await page.locator('select[name="petsAllowed"]').selectOption('false');
  391 |     await page.locator('select[name="foodPreference"]').selectOption('No special preference');
  392 | 
  393 |     await page.locator('button[type="submit"]').click();
  394 |     await expect(page.locator('.reasonList')).toContainText('Same city preference', { timeout: 10_000 });
  395 |     await expect(page.locator('.reasonList')).toContainText('Similar budget range');
  396 |   });
  397 | });
  398 | 
```