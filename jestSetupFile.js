import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => {
  const actualNavStack = jest.requireActual('@react-navigation/native-stack');
  return {
    ...actualNavStack,
    createNativeStackNavigator: () => ({
      Navigator: jest.fn(({ children }) => children),
      Screen: jest.fn(() => null),
    }),
  };
});
