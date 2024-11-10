import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import HomePage from '../../components/HomePage.js';

describe('<HomePage />', () => {
  // Mocking the navigation prop to simulate navigation actions within tests
  const navigation = {
    navigate: jest.fn(),
  };

  // Clears any stored navigation mock calls before each test, ensuring tests are independent
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to verify navigation to the GameSetup page when the "Start Game" button is pressed
  test('navigates to "GameSetup" when "Start Game" button is pressed', () => {
    // Render the HomePage component with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate the "Start Game" button by its text
    const startGameButton = getByText('Start Game');
    
    // Simulate a press action on the "Start Game" button
    fireEvent.press(startGameButton);

    // Check that navigation.navigate was called with the correct target screen
    expect(navigation.navigate).toHaveBeenCalledWith('GameSetup');
  });

  // Test to verify navigation to the GameHistory page when the "Game History" button is pressed
  test('navigates to "GameHistory" when "Game History" button is pressed', () => {
    // Render the HomePage component with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate the "Game History" button by its text
    const gameHistoryButton = getByText('Game History');
    
    // Simulate a press action on the "Game History" button
    fireEvent.press(gameHistoryButton);

    // Verify that navigation.navigate was called with the target screen, "GameHistory"
    expect(navigation.navigate).toHaveBeenCalledWith('GameHistory');
  });

  // Test to verify navigation to the About page when the "About" button is pressed
  test('navigates to "About" when "About" button is pressed', () => {
    // Render the HomePage component with the mocked navigation prop
    const { getByText } = render(<HomePage navigation={navigation} />);
    
    // Locate the "About" button by its text
    const aboutButton = getByText('About');
    
    // Simulate a press action on the "About" button
    fireEvent.press(aboutButton);

    // Verify that navigation.navigate was called with the correct target, "About"
    expect(navigation.navigate).toHaveBeenCalledWith('About');
  });
});
