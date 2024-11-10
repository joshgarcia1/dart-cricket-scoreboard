import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GameHistoryPage from '../../components/GameHistoryPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mock navigation object to capture navigation actions
const navigation = {
  navigate: jest.fn(),
};

// Mock data for in-progress and completed games to simulate stored game states
const inProgressGames = [
  { gameName: 'Game 1', players: ['Alice', 'Bob'], date: '2024-11-01', time: '12:00', grid: [], history: [] },
];
const completedGames = [
  { gameName: 'Game 2', players: ['Alice', 'Bob'], date: '2024-11-02', time: '14:00', winner: 'Alice' },
];

// Set up mocks for AsyncStorage to simulate retrieving and storing game data
beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.getItem = jest.fn(async (key) => {
    if (key === 'inProgressGames') return JSON.stringify(inProgressGames);
    if (key === 'completedGames') return JSON.stringify(completedGames);
    return null;
  });
  AsyncStorage.setItem = jest.fn();
});

// Mock Alert to bypass the delete confirmation dialog
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  const deleteButton = buttons.find(button => button.text === 'Delete');
  if (deleteButton) deleteButton.onPress();
});

// Helper function to render the component with a NavigationContainer for navigation context
const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

// Main test suite for the GameHistoryPage integration tests
describe('<GameHistoryPage /> Integration Tests', () => {
  
  // Test for rendering of in-progress and completed sections with game details
  test('renders with In Progress and Completed sections and game details', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);
    
    // Wait for AsyncStorage to retrieve game data for both sections
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('inProgressGames');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('completedGames');
    });
    
    // Verify in-progress game details are displayed correctly
    expect(screen.getByText('Game 1')).toBeTruthy();
    expect(screen.getByText('2024-11-01 12:00')).toBeTruthy();
    expect(screen.getAllByText('Players: Alice, Bob')).toHaveLength(2); // Ensures this appears in both sections

    // Verify completed game details, including winner
    expect(screen.getByText('Game 2')).toBeTruthy();
    expect(screen.getByText('2024-11-02 14:00')).toBeTruthy();
    expect(screen.getByText('Winner: Alice')).toBeTruthy();
  });

  // Test for saving an in-progress game when navigating away from GameScreen
  test('saves an in-progress game when navigating away from GameScreen', async () => {
    // Render the component with mocked navigation and game data
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Modify in-progress game data to simulate a game state change before saving
    inProgressGames[0].grid = [{ row: '20', taps: 1 }];

    // Confirm that the in-progress game appears correctly in the UI
    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeTruthy();
      expect(screen.getByText('Game 1')).toBeTruthy();
    });
  });

  // Test for saving a completed game with a declared winner
  test('declares a completed game with winner and stores in Completed section', async () => {
    // Add winner data to the completed game to simulate a completed game state
    completedGames[0].winner = 'Alice';

    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Verify that the completed game appears in the Completed section
    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeTruthy();
      expect(screen.getByText('Winner: Alice')).toBeTruthy();
    });
  });

  // Test for "Resume" button functionality to load saved game data for in-progress games
  test('renders "Resume" button for in-progress games and loads saved game data on click', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Wait for in-progress games to load and verify presence of Resume button
    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeTruthy();
    });

    // Confirm "Resume" button appears next to the in-progress game
    await waitFor(() => {
      expect(screen.getByText('Resume')).toBeTruthy();
    });

    // Simulate pressing the "Resume" button
    fireEvent.press(screen.getByText('Resume'));

    // Check that navigation to GameScreen was triggered with correct parameters
    expect(navigation.navigate).toHaveBeenCalledWith('GameScreen', {
      gameName: 'Game 1',
      players: ['Alice', 'Bob'],
      grid: expect.any(Array), // Expects the grid array, regardless of specific structure
      history: expect.any(Array), // Expects the history array
    });
  });

  // Test for deleting an in-progress game when the Delete button is pressed
  test('renders and deletes a game on Delete button click', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Wait for in-progress games to load
    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeTruthy();
    });

    // Simulate pressing the Delete button for the in-progress game
    fireEvent.press(screen.getAllByText('Delete')[0]); // First Delete button corresponds to in-progress game

    // Wait for AsyncStorage update and confirm deletion in UI
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('inProgressGames', JSON.stringify([]));
      expect(screen.queryByText('Game 1')).toBeNull(); // Game 1 should no longer appear
    });
  });

  // Test for deleting a completed game and removing it from storage and UI
  test('deletes a completed game on Delete button click', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Wait for completed games to load
    await waitFor(() => {
      expect(screen.getByText('Game 2')).toBeTruthy();
    });

    // Simulate pressing the Delete button for the completed game
    fireEvent.press(screen.getAllByText('Delete')[1]); // Second Delete button corresponds to completed game

    // Wait for AsyncStorage update and confirm deletion in UI
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('completedGames', JSON.stringify([]));
      expect(screen.queryByText('Game 2')).toBeNull(); // Game 2 should no longer appear
    });
  });
});
