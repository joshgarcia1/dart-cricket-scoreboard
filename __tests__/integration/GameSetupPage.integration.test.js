import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameSetupPage from '../../components/GameSetupPage';

// Mocking the navigation prop to test navigation actions
const navigationMock = {
  navigate: jest.fn(),
};

// Test suite for integration tests on GameSetupPage
describe('<GameSetupPage /> Integration Tests', () => {
  // Reset mocks before each test to ensure a clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to verify that the GameSetupPage renders correctly with default game name and player fields
  test('renders GameSetupPage with default game name and two player input fields', () => {
    // Render the GameSetupPage with the mocked navigation prop
    const { getByDisplayValue, getByText } = render(<GameSetupPage navigation={navigationMock} />);

    // Verify that the default game name input field is present and has the correct default value
    expect(getByDisplayValue('New Game')).toBeTruthy();
    // Verify that the two default player name input fields are present
    expect(getByDisplayValue('Player 1')).toBeTruthy();
    expect(getByDisplayValue('Player 2')).toBeTruthy();

    // Check for the presence of essential buttons
    expect(getByText('Add Player')).toBeTruthy();
    expect(getByText('Start Game')).toBeTruthy();
    expect(getByText('Back to Main Menu')).toBeTruthy();
  });

  // Test to ensure that pressing "Add Player" adds new player input fields, up to a maximum of four
  test('adds additional player input field when "Add Player" is pressed, up to a maximum of four players', () => {
    const { getByDisplayValue, getByText } = render(<GameSetupPage navigation={navigationMock} />);

    // Press "Add Player" once to add a third player
    fireEvent.press(getByText('Add Player'));
    expect(getByDisplayValue('Player 3')).toBeTruthy(); // Verify third player input field

    // Press "Add Player" a second time to add a fourth player
    fireEvent.press(getByText('Add Player'));
    expect(getByDisplayValue('Player 4')).toBeTruthy(); // Verify fourth player input field

    // Try pressing "Add Player" again - should not add more players since max is four
    fireEvent.press(getByText('Add Player'));

    // Verify that no fifth player input field is created
    expect(() => getByDisplayValue('Player 5')).toThrow(); // Throws an error if fifth player input is found
  });

  // Test to check that a "Remove" button appears next to each player input field after adding a third player
  test('displays remove button next to each player name input after adding a third player', () => {
    const { getByText, getAllByText } = render(<GameSetupPage navigation={navigationMock} />);

    // Add a third player to trigger the display of "Remove" buttons
    fireEvent.press(getByText('Add Player'));

    // Check for "Remove" buttons next to each player input field
    const removeButtons = getAllByText('Remove');
    expect(removeButtons.length).toBe(3); // Three players, so three "Remove" buttons should be present

    // Add a fourth player and verify that "Remove" buttons appear for all four players
    fireEvent.press(getByText('Add Player'));
    expect(getAllByText('Remove').length).toBe(4); // Four players, so four "Remove" buttons should be present
  });

  // Test to confirm navigation to GameScreenPage with the correct game name and player data when "Start Game" is pressed
  test('navigates to GameScreenPage with correct data when "Start Game" is pressed', () => {
    const { getByText, getByDisplayValue } = render(<GameSetupPage navigation={navigationMock} />);

    // Update the game name and player names in their respective input fields
    fireEvent.changeText(getByDisplayValue('New Game'), 'Epic Dart Game');
    fireEvent.changeText(getByDisplayValue('Player 1'), 'Alice');
    fireEvent.changeText(getByDisplayValue('Player 2'), 'Bob');

    // Press the "Start Game" button to initiate navigation
    fireEvent.press(getByText('Start Game'));

    // Verify that navigation to GameScreenPage occurred with the correct data
    expect(navigationMock.navigate).toHaveBeenCalledWith('GameScreen', {
      gameName: 'Epic Dart Game',
      players: ['Alice', 'Bob'],
    });
  });

  // Test to confirm navigation back to HomePage when "Back to Main Menu" is pressed
  test('navigates back to HomePage when "Back to Main Menu" is pressed', () => {
    const { getByText } = render(<GameSetupPage navigation={navigationMock} />);

    // Press the "Back to Main Menu" button to trigger navigation
    fireEvent.press(getByText('Back to Main Menu'));

    // Verify that navigation to HomePage occurred
    expect(navigationMock.navigate).toHaveBeenCalledWith('Home');
  });
});
