import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WinnerPopupPage from '../../components/WinnerPopupPage';
import { CommonActions } from '@react-navigation/native';

// Mock CommonActions from React Navigation to allow for testing of navigation reset behavior
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn(), // Mock the reset function to track its usage
  },
}));

// Begin test suite for <WinnerPopupPage /> integration tests
describe('<WinnerPopupPage /> Integration Tests', () => {
  // Set up mock functions for navigation to capture calls made during the tests
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn();

  // Sample route parameters to simulate props passed by the navigation stack
  const routeParams = {
    params: {
      playerName: 'John Doe', // Name of the winner
      date: '2024-10-20',      // Date of the win
    },
  };

  // Mocked navigation prop to simulate navigation actions within tests
  const navigationMock = {
    navigate: mockNavigate,
    dispatch: mockDispatch,
  };

  // Clear all mock states before each test to ensure tests are isolated
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to ensure the component renders correctly with essential elements
  test('renders with Main Menu and New Game buttons', () => {
    // Render the WinnerPopupPage component with mocked navigation and route params
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Verify the "WINNER!" title is rendered correctly
    expect(getByText('WINNER!')).toBeTruthy();
    
    // Verify that the winner's name and win date are displayed correctly
    expect(getByText('Player: John Doe')).toBeTruthy();
    expect(getByText('Date: 2024-10-20')).toBeTruthy();
    
    // Verify that both navigation buttons ("Main Menu" and "New Game") are displayed
    expect(getByText('Main Menu')).toBeTruthy();
    expect(getByText('New Game')).toBeTruthy();
  });

  // Test to ensure the "Main Menu" button navigates to the HomePage when pressed
  test('navigates to HomePage when Main Menu button is pressed', () => {
    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Locate the "Main Menu" button by its text
    const mainMenuButton = getByText('Main Menu');
    
    // Simulate a press action on the "Main Menu" button
    fireEvent.press(mainMenuButton);

    // Verify that navigation.navigate was called to navigate to the "Home" screen
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  // Test to ensure the "New Game" button resets the navigation stack to start a new game from GameSetupPage
  test('navigates to GameSetupPage when New Game button is pressed', () => {
    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage navigation={navigationMock} route={routeParams} />);

    // Locate the "New Game" button by its text
    const newGameButton = getByText('New Game');
    
    // Simulate a press action on the "New Game" button
    fireEvent.press(newGameButton);

    // Verify that the navigation dispatch function was called with the expected reset action
    expect(mockDispatch).toHaveBeenCalledWith(
      CommonActions.reset({
        index: 0,                    // Reset stack index to 0
        routes: [{ name: 'GameSetup' }], // Define the new route as "GameSetup"
      })
    );
  });
});
