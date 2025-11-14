// Built-in Jest matchers are now available in @testing-library/react-native v12.4+
// No need to import @testing-library/jest-native/extend-expect
// import { server } from './tests/msw/server';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for call immediately calls the callback which is incorrect behavior
  // so we override it with a no-op.
  Reanimated.default.call = () => {};

  return Reanimated;
});

// MSW setup temporarily disabled
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
