const { test, expect } = require('@playwright/test');
const { startServer, stopServer } = require('../helpers/testE2EServer');
const { SleepEntry, Goal } = require('../../src/models');
const { DEFAULT_TEST_USER_ID } = require('../helpers/testAuth');

let serverInfo;

test.beforeAll(async () => {
  serverInfo = await startServer();
  process.env.E2E_BASE_URL = `http://localhost:${serverInfo.port}`;
  // Ensure a clean slate for the test user before running E2E flows
  await Promise.all([
    SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
    Goal.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
  ]);
});

test.afterAll(async () => {
  // Clean up any entries created during the E2E run
  await Promise.all([
    SleepEntry.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
    Goal.deleteMany({ userId: DEFAULT_TEST_USER_ID }),
  ]);
  await stopServer();
});

test('dashboard renders and user can log a simple sleep entry', async ({
  page,
}) => {
  // All requests carry the test auth header so our mock middleware
  // treats the user as logged in.
  await page.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-test-auth': 'true',
    };
    await route.continue({ headers });
  });

  await page.goto('/dashboard');

  // Verify dashboard shell renders
  await expect(page.getByText('My Sleep History')).toBeVisible();
  // "Your Sleep Trends" section is hidden until entries exist, so don't check it initially

  // Log yesterday's sleep using duration view
  const dateInput = page.locator('#sleep-date');
  await expect(dateInput).toBeVisible();

  // Ensure duration view is active
  await page.getByRole('button', { name: /By Duration/i }).click();

  await page.selectOption('#input-hours', '8');
  await page.selectOption('#input-minutes', '0');
  await page.click('#btn-confirm-save');

  // Wait for toast and history update
  await page.waitForTimeout(500); // simple wait; app uses Materialize toast

  // Verify entry appears in history table
  const historyTable = page.locator('#sleep-history-body tr').first();
  await expect(historyTable).toBeVisible();
  await expect(historyTable).toContainText('8 hrs 00 mins');

  // After logging an entry, the trends section should now be visible
  await expect(page.getByText('Your Sleep Trends')).toBeVisible();
});

test('user can set a sleep goal', async ({ page }) => {
  // Add test auth header to every request
  await page.route('**/*', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-test-auth': 'true',
    };
    await route.continue({ headers });
  });

  await page.goto('/dashboard');

  // Wait for goal form to be visible (since we cleaned goals, it should show the form)
  await expect(page.locator('#goal-form-wrapper')).toBeVisible();
  await expect(page.getByText('Set New Sleep Goal')).toBeVisible();

  // Set goal to 8 hours
  await page.selectOption('#goal-hours', '8');
  await page.selectOption('#goal-minutes', '0');

  // Click save button
  await page.click('#goal-save-btn');

  // Wait for page reload after goal save (goal.js does window.location.reload())
  await page.waitForLoadState('networkidle');

  // After reload, the goal summary should be visible with our goal
  await expect(page.locator('#goal-summary-wrapper')).toBeVisible();
  await expect(page.locator('#goal-summary-current')).toContainText('8 hrs / night');
});
