import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameScreenPage from '../../components/GameScreenPage';

// Mocking AsyncStorage methods to control data behavior for testing purposes
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock navigation prop to simulate navigation actions in tests
const mockNavigation = { navigate: jest.fn(), dispatch: jest.fn() };

describe('GameScreenPage Component', () => {
  // Define mock navigation and route params for consistent test setup
  const mockNavigation = { navigate: jest.fn(), dispatch: jest.fn() };
  const mockRoute = {
    params: {
      gameName: 'Dart Game',
      players: ['Player 1', 'Player 2'],
      grid: null,
      history: null,
    },
  };

  // Reset mocks and setup Alert mock implementation for each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const confirmButton = buttons.find(button => button.text === 'Yes');
      if (confirmButton) confirmButton.onPress(); // Automatically trigger "Yes" button for Alert dialogs
    });
    AsyncStorage.getItem.mockResolvedValue(null); // Mock AsyncStorage.getItem to return null initially
  });

  // Test that the component renders game name and player names correctly
  it('renders correctly with initial state', () => {
    const { getByText } = render(
      <GameScreenPage navigation={mockNavigation} route={mockRoute} />
    );

    // Verify that the game name and both player names are displayed
    expect(getByText('Dart Game')).toBeTruthy();
    expect(getByText('Player 1')).toBeTruthy();
    expect(getByText('Player 2')).toBeTruthy();
  });

  // Test to ensure grid cells update correctly when tapped up to the maximum of three taps
  it('handles cell press and updates the grid state', async () => {
    const { getByTestId } = render(
      <GameScreenPage navigation={mockNavigation} route={mockRoute} />
    );

    const cell = getByTestId('cell-0-0'); // Access the first cell in the grid
    fireEvent.press(cell); // First tap - should display "/"
    
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('/');
    });

    fireEvent.press(cell); // Second tap - should display "X"
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('X');
    });

    fireEvent.press(cell); // Third tap - should display "Ⓧ"
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('Ⓧ');
    });

    fireEvent.press(cell); // Fourth tap - should remain "Ⓧ" (limit reached)
    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('Ⓧ');
    });
  });

  // Test to check that the "Undo" button correctly reverts the last cell tap
  it('handles undo and reverts the last move', async () => {
    const { getByTestId, getByText } = render(
      <GameScreenPage navigation={mockNavigation} route={mockRoute} />
    );

    const cell = getByTestId('cell-0-0');
    fireEvent.press(cell); // First tap "/"
    fireEvent.press(cell); // Second tap "X"

    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('X'); // Verify "X" appears
    });

    const undoButton = getByText('Undo');
    fireEvent.press(undoButton); // Press "Undo"

    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('/'); // Verify cell reverted to "/"
    });
  });

  // Test to verify that pressing the "Reset Board" button clears all cell taps on the board
  it('resets board and clears all marks', async () => {
    const { getByTestId, getByText, rerender } = render(
      <GameScreenPage navigation={mockNavigation} route={mockRoute} />
    );

    // Tap a cell and verify initial mark
    const cell = getByTestId('cell-0-0');
    fireEvent.press(cell); // First tap should display "/"

    await waitFor(() => {
      expect(cell.children[0].props.children).toBe('/'); // Confirm "/" appears
    });

    // Press "Reset Board" button
    const resetButton = getByText('Reset Board');
    fireEvent.press(resetButton);

    // Re-render and verify that all cells are empty
    rerender(<GameScreenPage navigation={mockNavigation} route={mockRoute} />);
    await waitFor(() => {
      expect(getByTestId('cell-0-0').children[0].props.children).toBe(''); // Ensure cell is cleared
    });

    // Optionally, verify multiple cells are empty after reset
    const rows = ['20', '19', '18', '17', '16', '15', 'Bull'];
    const columns = 2; // Assuming two players
    rows.forEach((row, rowIndex) => {
      for (let colIndex = 0; colIndex < columns; colIndex++) {
        const testCell = getByTestId(`cell-${rowIndex}-${colIndex}`);
        expect(testCell.children[0].props.children).toBe('');
      }
    });
  });

  // Test to ensure AsyncStorage does not store data when no changes are made
  it('does not save to AsyncStorage if no changes are made', async () => {
    render(<GameScreenPage navigation={mockNavigation} route={mockRoute} />);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled(); // Verify no save call was made
  });

  // Test to simulate a winning condition and verify that it triggers navigation to WinnerPopup
  it('declares a winner and navigates to WinnerPopup when win condition is met', async () => {
    // Render GameScreenPage with initial setup
    const { getByTestId } = render(
      <GameScreenPage navigation={mockNavigation} route={mockRoute} />
    );

    // Simulate three taps on each cell in the first column to achieve a win for "Player 1"
    const rowNames = ['20', '19', '18', '17', '16', '15', 'Bull'];
    for (let i = 0; i < rowNames.length; i++) {
      const cell = getByTestId(`cell-${i}-0`); // Access cells in the first column
      fireEvent.press(cell); // First tap "/"
      fireEvent.press(cell); // Second tap "X"
      fireEvent.press(cell); // Third tap "Ⓧ" (marks entire column for Player 1)
    }

    // Verify that navigation to WinnerPopup was called with the correct parameters
    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('WinnerPopup', {
        playerName: 'Player 1', // The winning player's name
        date: expect.any(String), // The date parameter, expected to be any string
      });
    });
  });
});
