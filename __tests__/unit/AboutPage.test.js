import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AboutPage from '../../components/AboutPage.js';
import { Linking, Alert, Share, Platform } from 'react-native';

// Mocking necessary modules to control their behavior in tests
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()), // Mock openURL to simulate successful email client opening
}));
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(), // Mock Alert.alert to track calls to it
}));
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })), // Mock Share.share to simulate successful sharing
}));

// Start of test suite for <AboutPage />
describe('<AboutPage />', () => {
  // Clear all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to verify that all expected buttons are rendered correctly
  test('renders all buttons correctly', () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);

    // Verify that each button is rendered by checking its text
    expect(getByText('Contact Support')).toBeTruthy();
    expect(getByText('Rate')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
  });

  // Test to ensure the "Contact Support" button calls handleContactSupport correctly
  test('calls handleContactSupport when "Contact Support" button is pressed', () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);
    const button = getByText('Contact Support'); // Locate the Contact Support button

    // Simulate a press on the Contact Support button
    fireEvent.press(button);

    // Verify that Linking.openURL is called with the correct email format
    expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:jgdevelopmentsupport@protonmail.com?subject=Support%20Request&body=Please%20describe%20your%20issue%20or%20feedback%20here.'
    );
  });

  // Test to verify that an alert shows up if opening the email client fails
  test('shows alert if opening email client fails', async () => {
    // Mock openURL to reject the promise, simulating a failure
    Linking.openURL.mockImplementation(() => Promise.reject(new Error('Failed to open')));
    
    // Render the AboutPage component and get the Contact Support button
    const { getByText } = render(<AboutPage />);
    const button = getByText('Contact Support');

    // Use act to handle asynchronous events when pressing the button
    await act(async () => {
      fireEvent.press(button); // Simulate pressing the Contact Support button
    });

    // Verify that Alert.alert is called with the correct error message
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Unable to open email client. Please check your email configuration.');
  });

  // Test to verify handleRateApp is called and opens the App Store URL on iOS platform
  test('calls handleRateApp when "Rate" button is pressed and platform is iOS', () => {
    Platform.OS = 'ios'; // Set Platform to iOS
    const { getByText } = render(<AboutPage />);
    const button = getByText('Rate'); // Locate the Rate button

    // Simulate pressing the Rate button
    fireEvent.press(button);

    // Verify that Linking.openURL is called with the App Store URL
    expect(Linking.openURL).toHaveBeenCalledWith('https://apps.apple.com/us/app/expo-go/id982107779');
  });

  // Test to verify that an alert appears when attempting to rate on a non-iOS platform
  test('shows alert when "Rate" button is pressed and platform is not iOS', () => {
    Platform.OS = 'android'; // Set Platform to Android to test non-iOS behavior
    const { getByText } = render(<AboutPage />);
    const button = getByText('Rate'); // Locate the Rate button

    // Simulate pressing the Rate button
    fireEvent.press(button);

    // Verify that Alert.alert is called to indicate feature unavailability
    expect(Alert.alert).toHaveBeenCalledWith('Not Supported', 'Rating is only available on iOS devices.');
  });

  // Test to ensure handleShareApp is called correctly when the Share button is pressed
  test('calls handleShareApp when "Share" button is pressed', async () => {
    const { getByText } = render(<AboutPage />);
    const button = getByText('Share'); // Locate the Share button

    // Use act to handle the asynchronous share event
    await act(async () => {
      fireEvent.press(button); // Simulate pressing the Share button
    });

    // Verify that Share.share is called with the correct message
    expect(Share.share).toHaveBeenCalledWith({
      message: 'Dart Cricket Scoreboard: Check out this interactive dart cricket scoreboard mobile app! Download it here: http://example.com/DartCricketScoreboard',
    });
  });

  // Test to handle the case where the share action is dismissed
  test('handles share dismiss action gracefully', async () => {
    // Mock Share.share to resolve with a dismissed action result
    Share.share.mockResolvedValue({ action: 'dismissedAction' });
    const { getByText } = render(<AboutPage />);
    const button = getByText('Share'); // Locate the Share button

    // Use act to handle asynchronous events
    await act(async () => {
      fireEvent.press(button); // Simulate pressing the Share button
    });

    // This test completes without any additional assertions since we are testing that no errors occur
  });
});
