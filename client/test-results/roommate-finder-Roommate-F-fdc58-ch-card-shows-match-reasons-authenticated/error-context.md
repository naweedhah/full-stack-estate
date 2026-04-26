# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: roommate-finder.spec.js >> Roommate Finder — Save and Matches >> match card shows match reasons
- Location: e2e/roommate-finder.spec.js:358:3

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
  299 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
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
> 377 |     await page.locator('select[name="preferredCity"]').selectOption('Kandy');
      |                                                        ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
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