/**
 * Jest test setup for OathNet SDK integration tests.
 */

// Increase timeout for integration tests
jest.setTimeout(60000);

// Check for API key before running tests
beforeAll(() => {
  if (!process.env.OATHNET_API_KEY) {
    console.warn(
      '\n⚠️  OATHNET_API_KEY environment variable not set.\n' +
      'Integration tests will be skipped.\n' +
      'Set it with: export OATHNET_API_KEY="your-api-key"\n'
    );
  }
});
