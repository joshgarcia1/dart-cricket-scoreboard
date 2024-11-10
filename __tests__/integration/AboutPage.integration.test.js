import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AboutPage from '../../components/AboutPage';
import { Linking, Alert, Share } from 'react-native';

// Mocking the Linking module to simulate external link handling
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn().mockImplementation(() => Promise.resolve()), // Simulates a successful call to open an external URL
}));

// Mocking the Alert module to capture alert dialogs without displaying them
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mocking the Share module to simulate the iOS Share functionality
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn().mockResolvedValue({ action: 'sharedAction' }), // Simulates a successful share action
}));

// Test suite for the <AboutPage /> component
describe('<AboutPage /> Integration Tests', () => {

  // Test case to ensure that essential buttons render correctly on the AboutPage
  test('renders Contact Support, Rate, and Share buttons', () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);

    // Verify that each button is present on the screen
    expect(getByText('Contact Support')).toBeTruthy(); // Ensures 'Contact Support' button renders
    expect(getByText('Rate')).toBeTruthy();            // Ensures 'Rate' button renders
    expect(getByText('Share')).toBeTruthy();           // Ensures 'Share' button renders
  });

  // Test case to simulate pressing the 'Contact Support' button and verify it opens the email client
  test('opens email client when Contact Support button is pressed', async () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);
    const contactSupportButton = getByText('Contact Support'); // Locate the 'Contact Support' button

    // Simulate pressing the 'Contact Support' button
    fireEvent.press(contactSupportButton);

    // Wait and assert that Linking.openURL is called with the correct 'mailto:' URL
    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('mailto:jgdevelopmentsupport@protonmail.com')
      );
    });
  });

  // Test case to simulate pressing the 'Rate' button and verify it opens the App Store link
  test('opens alert window to rate the Expo Go app when Rate button is pressed', async () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);
    const rateButton = getByText('Rate'); // Locate the 'Rate' button

    // Simulate pressing the 'Rate' button
    fireEvent.press(rateButton);

    // Wait and assert that Linking.openURL is called with the App Store URL for Expo Go
    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://apps.apple.com/us/app/expo-go/id982107779'
      );
    });
  });

  // Test case to simulate pressing the 'Share' button and verify it opens the Share dialog
  test('opens iOS Share window when Share button is pressed', async () => {
    // Render the AboutPage component
    const { getByText } = render(<AboutPage />);
    const shareButton = getByText('Share'); // Locate the 'Share' button

    // Simulate pressing the 'Share' button
    fireEvent.press(shareButton);

    // Wait and assert that Share.share is called with the expected share message
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('Dart Cricket Scoreboard'),
      });
    });
  });
});
