import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import GameSetupPage from '../../components/GameSetupPage';
import { Alert } from 'react-native';

// Mock navigation prop to simulate navigation actions within tests
const navigation = {
  navigate: jest.fn(),
};

// Mock the Alert.alert function to intercept and test alert dialogs without showing them
jest.spyOn(Alert, 'alert').mockImplementation((title, message) => {});

describe('<GameSetupPage />', () => {
  // Clear all mock functions before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to verify the default rendering of the GameSetupPage with the initial game name and two players
  test('renders default game setup with two players', () => {
    // Render the GameSetupPage component with the mocked navigation prop
    render(<GameSetupPage navigation={navigation} />);

    // Verify that the default game name is displayed in the input field
    expect(screen.getByDisplayValue('New Game')).toBeTruthy();

    // Verify that two player input fields (Player 1 and Player 2) are displayed by default
    expect(screen.getByDisplayValue('Player 1')).toBeTruthy();
    expect(screen.getByDisplayValue('Player 2')).toBeTruthy();
  });

  // Test to ensure that pressing "Add Player" button adds a new player input field, up to the maximum allowed
  test('adds a player when "Add Player" is pressed', () => {
    // Render the GameSetupPage component
    render(<GameSetupPage navigation={navigation} />);

    // Press the "Add Player" button to add a third player
    fireEvent.press(screen.getByText('Add Player'));

    // Verify that an input field for "Player 3" is added
    expect(screen.getByDisplayValue('Player 3')).toBeTruthy();
  });

  // Test to confirm that pressing "Add Player" more than four times does not add extra players and shows an alert
  test('does not add more than 4 players and shows alert', () => {
    // Render the GameSetupPage component
    render(<GameSetupPage navigation={navigation} />);

    // Press the "Add Player" button three times to reach the maximum of four players
    fireEvent.press(screen.getByText('Add Player'));
    fireEvent.press(screen.getByText('Add Player'));
    fireEvent.press(screen.getByText('Add Player'));

    // Try pressing "Add Player" again - should trigger an alert as four players are already added
    fireEvent.press(screen.getByText('Add Player'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Player Limit Reached',
      'You can only add up to 4 players.'
    );

    // Verify that a fifth player input is not added to the screen
    expect(screen.queryByDisplayValue('Player 5')).toBeNull();
  });

  // Test to check that the "Remove" button deletes the correct player input field when pressed
  test('removes a player when "Remove" button is pressed', () => {
    // Render the GameSetupPage component
    render(<GameSetupPage navigation={navigation} />);

    // Press "Add Player" to add a third player
    fireEvent.press(screen.getByText('Add Player'));

    // Verify that "Player 3" input field is displayed
    expect(screen.getByDisplayValue('Player 3')).toBeTruthy();

    // Press the "Remove" button next to the third player input
    fireEvent.press(screen.getAllByText('Remove')[2]);

    // Verify that "Player 3" input field is no longer displayed
    expect(screen.queryByDisplayValue('Player 3')).toBeNull();
  });

  // Test to confirm navigation to "GameScreen" page with the correct data after pressing "Start Game" button
  test('navigates to "GameScreen" with correct game data when "Start Game" is pressed', () => {
    // Render the GameSetupPage component
    render(<GameSetupPage navigation={navigation} />);

    // Update the game name input field to "Exciting Game"
    fireEvent.changeText(screen.getByDisplayValue('New Game'), 'Exciting Game');

    // Update player names to "Alice" and "Bob"
    fireEvent.changeText(screen.getByDisplayValue('Player 1'), 'Alice');
    fireEvent.changeText(screen.getByDisplayValue('Player 2'), 'Bob');

    // Press "Start Game" button to initiate the game with current setup
    fireEvent.press(screen.getByText('Start Game'));

    // Verify that navigation to "GameScreen" occurred with the correct game name and player names
    expect(navigation.navigate).toHaveBeenCalledWith('GameScreen', {
      gameName: 'Exciting Game',
      players: ['Alice', 'Bob'],
    });
  });
});
