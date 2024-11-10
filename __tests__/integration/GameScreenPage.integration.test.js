import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GameScreenPage from '../../components/GameScreenPage';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocking AsyncStorage to simulate storing and retrieving game state data
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock navigation and route parameters for testing navigation interactions
const mockNavigation = { navigate: jest.fn(), dispatch: jest.fn() };

// Test suite for integration tests on the GameScreenPage
describe('<GameScreenPage /> Integration Tests', () => {
  // Route parameters to simulate incoming props with game name and player names
  const route = {
    params: {
      gameName: 'Dart Game',
      players: ['Player 1', 'Player 2'],
    },
  };

  // Setting up test environment before each test
  beforeEach(() => {
    jest.clearAllMocks(); // Reset any previous mocks
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const confirmButton = buttons.find(button => button.text === 'Yes');
      if (confirmButton) confirmButton.onPress(); // Automatically confirm alert actions in tests
    });
    AsyncStorage.getItem.mockResolvedValue(null); // Set default storage value to null
  });

  // Test to verify that the game name and player names render correctly on the screen
  test('renders game name and player names correctly', () => {
    const { getByText } = render(<GameScreenPage navigation={mockNavigation} route={route} />);

    // Ensure the game name and player names are displayed on the screen
    expect(getByText('Dart Game')).toBeTruthy();
    expect(getByText('Player 1')).toBeTruthy();
    expect(getByText('Player 2')).toBeTruthy();
  });

  // Test to confirm that tapping on grid cells cycles through symbols: "/", "X", and "Ⓧ"
  test('limits grid cell taps to three with correct symbols', async () => {
    const { getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={route} />);
    const cell = getByTestId('cell-0-0'); // Access a specific grid cell

    // First tap should display "/"
    fireEvent.press(cell);
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('/');
    });

    // Second tap should display "X"
    fireEvent.press(cell);
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('X');
    });

    // Third tap should display "Ⓧ"
    fireEvent.press(cell);
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('Ⓧ');
    });

    // Fourth tap should still display "Ⓧ" (taps are limited to 3)
    fireEvent.press(cell);
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('Ⓧ');
    });
  });

  // Test to validate correct grid layout when there are two players
  test('grid layout is correct for two players', () => {
    const { getByText, getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={route} />);
    
    // Verify that each player has their respective column
    expect(getByText('Player 1')).toBeTruthy();
    expect(getByTestId('cell-0-0')).toBeTruthy(); // First player's cell in first row
    expect(getByText('Player 2')).toBeTruthy();
    expect(getByTestId('cell-0-1')).toBeTruthy(); // Second player's cell in first row
  });

  // Test to validate correct grid layout when there are three players
  test('grid layout is correct for three players', () => {
    const routeWithThreePlayers = { ...route, params: { ...route.params, players: ['Player 1', 'Player 2', 'Player 3'] } };
    const { getByText, getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={routeWithThreePlayers} />);

    // Verify grid layout with three players
    expect(getByText('Player 1')).toBeTruthy();
    expect(getByTestId('cell-0-0')).toBeTruthy();
    expect(getByText('Player 2')).toBeTruthy();
    expect(getByTestId('cell-0-1')).toBeTruthy();
    expect(getByText('Player 3')).toBeTruthy();
    expect(getByTestId('cell-0-2')).toBeTruthy();
  });

  // Test to validate correct grid layout when there are four players
  test('grid layout is correct for four players', () => {
    const routeWithFourPlayers = { ...route, params: { ...route.params, players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'] } };
    const { getByText, getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={routeWithFourPlayers} />);

    // Verify grid layout with four players
    expect(getByText('Player 1')).toBeTruthy();
    expect(getByTestId('cell-0-0')).toBeTruthy();
    expect(getByText('Player 2')).toBeTruthy();
    expect(getByTestId('cell-0-1')).toBeTruthy();
    expect(getByText('Player 3')).toBeTruthy();
    expect(getByTestId('cell-0-2')).toBeTruthy();
    expect(getByText('Player 4')).toBeTruthy();
    expect(getByTestId('cell-0-3')).toBeTruthy();
  });

  // Test to confirm the Undo button reverts the last tap on a grid cell
  test('undo button reverts the last tap', async () => {
    const { getByText, getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={route} />);

    const cell = getByTestId('cell-0-0');
    fireEvent.press(cell); // First tap ("/")
    fireEvent.press(cell); // Second tap ("X")

    // Check that the cell displays "X" after two taps
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('X');
    });

    // Press the Undo button and confirm it reverts to "/"
    fireEvent.press(getByText('Undo'));
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('/');
    });
  });

  // Test to confirm that pressing "Reset Board" clears all marks on the grid
  test('reset board clears all marks', async () => {
    const { getByTestId, getByText, rerender } = render(<GameScreenPage navigation={mockNavigation} route={route} />);

    // Tap a cell to add a mark
    const cell = getByTestId('cell-0-0');
    fireEvent.press(cell); // First tap should show "/"
    await waitFor(() => expect(cell.children[0].props.children).toBe('/'));

    // Press "Reset Board" button and confirm the grid is cleared
    fireEvent.press(getByText('Reset Board'));
    rerender(<GameScreenPage navigation={mockNavigation} route={route} />);
    await waitFor(() => expect(cell.children[0].props.children).toBe('')); // Ensure cell is cleared
  });

  // Test to confirm winner declaration and navigation to WinnerPopupPage when a player fills all cells in their column
  test('declares winner and navigates to WinnerPopupPage when player completes all cells', async () => {
    const { getByTestId } = render(<GameScreenPage navigation={mockNavigation} route={route} />);

    // Simulate a win by filling all cells in Player 1's column
    for (let i = 0; i < 7; i++) { // Assuming 7 rows
      const cell = getByTestId(`cell-${i}-0`);
      fireEvent.press(cell); // First tap "/"
      fireEvent.press(cell); // Second tap "X"
      fireEvent.press(cell); // Third tap "Ⓧ"
    }

    // Confirm navigation to WinnerPopup with player and date parameters
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('WinnerPopup', {
        playerName: 'Player 1',
        date: expect.any(String), // Ensures a valid date is provided
      });
    });
  });
});
