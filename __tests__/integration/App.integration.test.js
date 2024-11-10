import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import App from '../../App.js';
import HomePage from '../../components/HomePage.js';

// Test suite for the main App component and HomePage navigation interactions
describe('<App />', () => {
  
  // Mock navigation prop for testing navigation calls
  const navigation = {
    navigate: jest.fn(), // Mock function to capture navigation actions
  };

  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous calls to the mocked navigation
  });

  // Test case to verify that HomePage renders the expected elements correctly
  test('renders HomePage correctly', () => {
    // Render HomePage component, passing in the mocked navigation prop
    const { getByText, getByTestId } = render(<HomePage navigation={navigation} />);

    // Locate the image on HomePage using its test ID and validate its accessibility role
    const image = getByTestId('dartboard-image');
    expect(image.props.accessibilityRole).toEqual('image'); // Confirm the image has an accessible role

    // Check for the presence of main buttons on HomePage
    expect(getByText('Start Game')).toBeTruthy();     // Confirms the 'Start Game' button is present
    expect(getByText('Game History')).toBeTruthy();   // Confirms the 'Game History' button is present
    expect(getByText('About')).toBeTruthy();          // Confirms the 'About' button is present
  });

  // Test case to check navigation to the "GameSetup" screen when "Start Game" button is pressed
  test('navigates to "GameSetup" when "Start Game" button is pressed', () => {
    // Render HomePage with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate and simulate pressing the "Start Game" button
    const startGameButton = getByText('Start Game');
    fireEvent.press(startGameButton);

    // Verify that navigation was called with "GameSetup" as the target screen
    expect(navigation.navigate).toHaveBeenCalledWith('GameSetup');
  });

  // Test case to check navigation to the "GameHistory" screen when "Game History" button is pressed
  test('navigates to "GameHistory" when "Game History" button is pressed', () => {
    // Render HomePage with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate and simulate pressing the "Game History" button
    const gameHistoryButton = getByText('Game History');
    fireEvent.press(gameHistoryButton);

    // Verify that navigation was called with "GameHistory" as the target screen
    expect(navigation.navigate).toHaveBeenCalledWith('GameHistory');
  });

  // Test case to check navigation to the "About" screen when "About" button is pressed
  test('navigates to "About" when "About" button is pressed', () => {
    // Render HomePage with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate and simulate pressing the "About" button
    const aboutButton = getByText('About');
    fireEvent.press(aboutButton);

    // Verify that navigation was called with "About" as the target screen
    expect(navigation.navigate).toHaveBeenCalledWith('About');
  });
});
