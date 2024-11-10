import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import HomePage from '../../components/HomePage.js';

// Define a test suite for the <HomePage /> component
describe('<HomePage />', () => {
  // Create a mock navigation object to simulate navigation actions
  const navigation = {
    navigate: jest.fn(),
  };

  // Clear mock data before each test to ensure clean, isolated test results
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case to check if HomePage renders correctly with all main elements
  test('renders HomePage correctly', () => {
    // Render the HomePage component with the mock navigation prop
    const { getByText, getByTestId } = render(<HomePage navigation={navigation} />);

    // Locate the image using testID and check that it is correctly rendered as an image
    const image = getByTestId('dartboard-image');
    expect(image.props.accessibilityRole).toEqual('image');

    // Verify that the three main buttons are present on the HomePage
    expect(getByText('Start Game')).toBeTruthy();  // Button to start a new game
    expect(getByText('Game History')).toBeTruthy();  // Button to view past games
    expect(getByText('About')).toBeTruthy();  // Button to view app info
  });

  // Test case to verify that pressing "Start Game" navigates to the "GameSetup" page
  test('navigates to "GameSetup" when "Start Game" button is pressed', () => {
    // Render the HomePage component
    const { getByText } = render(<HomePage navigation={navigation} />);

    // Locate the "Start Game" button and simulate a press event
    const startGameButton = getByText('Start Game');
    fireEvent.press(startGameButton);

    // Verify that the navigation function was called with the expected route name, "GameSetup"
    expect(navigation.navigate).toHaveBeenCalledWith('GameSetup');
  });

  // Test case to verify that pressing "Game History" navigates to the "GameHistory" page
  test('navigates to "GameHistory" when "Game History" button is pressed', () => {
    // Render the HomePage component
    const { getByText } = render(<HomePage navigation={navigation} />);

    // Locate the "Game History" button and simulate a press event
    const gameHistoryButton = getByText('Game History');
    fireEvent.press(gameHistoryButton);

    // Verify that the navigation function was called with the expected route name, "GameHistory"
    expect(navigation.navigate).toHaveBeenCalledWith('GameHistory');
  });

  // Test case to verify that pressing "About" navigates to the "About" page
  test('navigates to "About" when "About" button is pressed', () => {
    // Render the HomePage component
    const { getByText } = render(<HomePage navigation={navigation} />);

    // Locate the "About" button and simulate a press event
    const aboutButton = getByText('About');
    fireEvent.press(aboutButton);

    // Verify that the navigation function was called with the expected route name, "About"
    expect(navigation.navigate).toHaveBeenCalledWith('About');
  });
});
