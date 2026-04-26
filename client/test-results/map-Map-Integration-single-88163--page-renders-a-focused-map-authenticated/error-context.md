# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map.spec.js >> Map Integration >> single property page renders a focused map
- Location: e2e/map.spec.js:149:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.leaflet-container')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.leaflet-container')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - heading "Unexpected Application Error!" [level=2] [ref=e3]
  - heading "Cannot read properties of undefined (reading 'avatar')" [level=3] [ref=e4]
  - generic [ref=e5]: "TypeError: Cannot read properties of undefined (reading 'avatar') at SinglePage (http://localhost:5173/src/routes/singlePage/singlePage.jsx?t=1777196315926:231:61) at renderWithHooks (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:12151:26) at mountIndeterminateComponent (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:14901:21) at beginWork (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:15882:22) at beginWork$1 (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:19721:22) at performUnitOfWork (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:19166:20) at workLoopSync (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:19105:13) at renderRootSync (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:19084:15) at recoverFromConcurrentError (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:18704:28) at performConcurrentWorkOnRoot (http://localhost:5173/node_modules/.vite/deps/chunk-IA5K47JS.js?v=e170a1c4:18652:30)"
  - paragraph [ref=e6]: 💿 Hey developer 👋
  - paragraph [ref=e7]:
    - text: You can provide a way better UX than this when your app throws errors by providing your own
    - code [ref=e8]: ErrorBoundary
    - text: or
    - code [ref=e9]: errorElement
    - text: prop on your route.
```

# Test source

```ts
  66  |   test.beforeEach(async ({ page }) => {
  67  |     await page.route('**/api/users/notifications', (route) =>
  68  |       route.fulfill({
  69  |         status: 200,
  70  |         contentType: 'application/json',
  71  |         body: JSON.stringify({ unseenCount: 0, notifications: [], preferences: null }),
  72  |       })
  73  |     );
  74  | 
  75  |     await page.route('**/api/posts/demand/overview', (route) =>
  76  |       route.fulfill({
  77  |         status: 200,
  78  |         contentType: 'application/json',
  79  |         body: JSON.stringify(MOCK_DEMAND),
  80  |       })
  81  |     );
  82  | 
  83  |     await page.route('**/api/posts?*', (route) =>
  84  |       route.fulfill({
  85  |         status: 200,
  86  |         contentType: 'application/json',
  87  |         body: JSON.stringify(MOCK_POSTS),
  88  |       })
  89  |     );
  90  |   });
  91  | 
  92  |   test('map container is visible on the listing page', async ({ page }) => {
  93  |     await page.goto('/list');
  94  |     const map = page.locator('.leaflet-container');
  95  |     await expect(map).toBeVisible({ timeout: 10_000 });
  96  |   });
  97  | 
  98  |   test('map tile pane is rendered inside the container', async ({ page }) => {
  99  |     await page.goto('/list');
  100 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  101 |     const tilePane = page.locator('.leaflet-tile-pane');
  102 |     await expect(tilePane).toBeAttached();
  103 |   });
  104 | 
  105 |   test('map overlay pane exists for markers and shapes', async ({ page }) => {
  106 |     await page.goto('/list');
  107 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  108 |     const overlayPane = page.locator('.leaflet-overlay-pane');
  109 |     await expect(overlayPane).toBeAttached();
  110 |   });
  111 | 
  112 |   test('OpenStreetMap attribution is displayed on the map', async ({ page }) => {
  113 |     await page.goto('/list');
  114 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  115 |     const attribution = page.locator('.leaflet-control-attribution');
  116 |     await expect(attribution).toBeVisible();
  117 |     await expect(attribution).toContainText('OpenStreetMap');
  118 |   });
  119 | 
  120 |   test('map zoom controls are present', async ({ page }) => {
  121 |     await page.goto('/list');
  122 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  123 |     const zoomIn = page.locator('.leaflet-control-zoom-in');
  124 |     const zoomOut = page.locator('.leaflet-control-zoom-out');
  125 |     await expect(zoomIn).toBeVisible();
  126 |     await expect(zoomOut).toBeVisible();
  127 |   });
  128 | 
  129 |   test('marker pane is attached when listings with coordinates exist', async ({ page }) => {
  130 |     await page.goto('/list');
  131 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  132 |     const markerPane = page.locator('.leaflet-marker-pane');
  133 |     await expect(markerPane).toBeAttached();
  134 |   });
  135 | 
  136 |   test('map still renders when there are no listings', async ({ page }) => {
  137 |     await page.route('**/api/posts?*', (route) =>
  138 |       route.fulfill({
  139 |         status: 200,
  140 |         contentType: 'application/json',
  141 |         body: JSON.stringify([]),
  142 |       })
  143 |     );
  144 | 
  145 |     await page.goto('/list');
  146 |     await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  147 |   });
  148 | 
  149 |   test('single property page renders a focused map', async ({ page }) => {
  150 |     await page.route('**/api/posts/post-map-1', (route) =>
  151 |       route.fulfill({
  152 |         status: 200,
  153 |         contentType: 'application/json',
  154 |         body: JSON.stringify(MOCK_POST_SINGLE),
  155 |       })
  156 |     );
  157 |     await page.route('**/api/users/roommate-matches', (route) =>
  158 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  159 |     );
  160 |     await page.route('**/api/posts/post-map-1/reviews', (route) =>
  161 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  162 |     );
  163 | 
  164 |     await page.goto('/post-map-1');
  165 |     const map = page.locator('.leaflet-container');
> 166 |     await expect(map).toBeVisible({ timeout: 10_000 });
      |                       ^ Error: expect(locator).toBeVisible() failed
  167 |   });
  168 | 
  169 |   test('listing page map container is not empty', async ({ page }) => {
  170 |     await page.goto('/list');
  171 |     const map = page.locator('.leaflet-container');
  172 |     await expect(map).toBeVisible({ timeout: 10_000 });
  173 |     const mapContent = await map.innerHTML();
  174 |     expect(mapContent.length).toBeGreaterThan(0);
  175 |   });
  176 | });
  177 | 
```