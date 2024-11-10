import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WinnerPopupPage from '../../components/WinnerPopupPage.js';
import { CommonActions } from '@react-navigation/native';

// Mock the CommonActions from React Navigation to test navigation resets
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn(),
  },
}));

// Define a test suite for the WinnerPopupPage component
describe('<WinnerPopupPage />', () => {
  // Mock functions for navigation behavior to track navigation actions
  const mockNavigate = jest.fn();  // Simulates basic navigation actions (e.g., navigate to a different screen)
  const mockDispatch = jest.fn();  // Simulates dispatch actions (e.g., resetting the navigation stack)

  // Mock route parameters to simulate passing in player information to the component
  const routeParams = {
    params: {
      playerName: 'John Doe',  // Example player name
      date: '2024-10-20',       // Example date of winning
    },
  };

  // Create a navigation mock object containing the mock navigation functions
  const navigationMock = {
    navigate: mockNavigate,
    dispatch: mockDispatch,
  };

  // Clear all mock function calls and reset their states before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case to verify that the WinnerPopupPage renders winner details correctly
  test('renders winner details correctly', () => {
    // Render the WinnerPopupPage with the mocked navigation and route props
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Check that the main winner announcement text is present
    expect(getByText('WINNER!')).toBeTruthy();

    // Check that the winner’s name is displayed
    expect(getByText('Player: John Doe')).toBeTruthy();

    // Check that the date is displayed correctly
    expect(getByText('Date: 2024-10-20')).toBeTruthy();
  });

  // Test case to check that pressing the "Main Menu" button navigates to the Home screen
  test('navigates to Home screen when "Main Menu" button is pressed', () => {
    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Locate the "Main Menu" button and simulate a press
    const mainMenuButton = getByText('Main Menu');
    fireEvent.press(mainMenuButton);

    // Verify that the mockNavigate function was called to navigate to the 'Home' screen
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  // Test case to ensure that pressing the "New Game" button resets the navigation stack to the GameSetup screen
  test('resets navigation to GameSetup screen when "New Game" button is pressed', () => {
    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Locate the "New Game" button and simulate a press
    const newGameButton = getByText('New Game');
    fireEvent.press(newGameButton);

    // Verify that the navigation stack was reset to the 'GameSetup' screen using CommonActions.reset
    expect(mockDispatch).toHaveBeenCalledWith(
      CommonActions.reset({
        index: 0,                       // Reset stack to index 0 (first screen)
        routes: [{ name: 'GameSetup' }], // Route configuration to navigate to 'GameSetup'
      })
    );
  });
});
