import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GameHistoryPage from '../../components/GameHistoryPage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Mock navigation prop to simulate navigation actions in tests
const navigation = {
  navigate: jest.fn(),
};

// Sample mock data for in-progress and completed games in AsyncStorage
const inProgressGames = [
  { gameName: 'Game 1', players: ['Alice', 'Bob'], date: '2024-11-01', time: '12:00', grid: [], history: [] },
];
const completedGames = [
  { gameName: 'Game 2', players: ['Alice', 'Bob'], date: '2024-11-02', time: '14:00', winner: 'Alice' },
];

// Mock AsyncStorage functions to control and monitor its behavior in tests
beforeEach(() => {
  jest.clearAllMocks();
  // Mock AsyncStorage.getItem to return JSON stringified versions of our sample data
  AsyncStorage.getItem = jest.fn(async (key) => {
    if (key === 'inProgressGames') return JSON.stringify(inProgressGames);
    if (key === 'completedGames') return JSON.stringify(completedGames);
    return null;
  });
  // Mock AsyncStorage.setItem to monitor storage update calls
  AsyncStorage.setItem = jest.fn();
});

// Mock Alert.alert to bypass the confirmation dialog in delete actions
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  const deleteButton = buttons.find(button => button.text === 'Delete');
  if (deleteButton) deleteButton.onPress(); // Automatically trigger the delete action
});

// Utility function to wrap the component in NavigationContainer for navigation context
const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

// Main test suite for <GameHistoryPage /> component
describe('<GameHistoryPage />', () => {
  
  // Test to verify loading and displaying games from AsyncStorage
  test('loads games from AsyncStorage and displays them', async () => {
    // Render the GameHistoryPage component within a NavigationContainer
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);
    
    // Ensure AsyncStorage.getItem is called with correct keys for loading game data
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('inProgressGames');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('completedGames');
    });
    
    // Verify that in-progress and completed games are displayed with the correct details
    expect(screen.getByText('Game 1')).toBeTruthy(); // Game name for in-progress game
    expect(screen.getByText('2024-11-01 12:00')).toBeTruthy(); // Date and time for in-progress game
    expect(screen.getByText('Game 2')).toBeTruthy(); // Game name for completed game
    expect(screen.getByText('Winner: Alice')).toBeTruthy(); // Winner's name in completed game
    
    // Verify both games display the correct player list
    const playersTexts = screen.getAllByText('Players: Alice, Bob');
    expect(playersTexts).toHaveLength(2); // Ensures text appears once for each game
  });

  // Test to verify deleting a game from the in-progress list
  test('deletes a game from the in-progress list', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Wait for the in-progress game to load
    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeTruthy(); // Verify Game 1 is initially present
    });

    // Trigger delete action for the first in-progress game
    fireEvent.press(screen.getAllByText('Delete')[0]);

    // Verify AsyncStorage.setItem is called with an empty array after deletion
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('inProgressGames', JSON.stringify([]));
      expect(screen.queryByText('Game 1')).toBeNull(); // Ensure Game 1 no longer appears on the screen
    });
  });

  // Test to verify navigation to GameScreen with correct data when "Resume" is pressed
  test('navigates to GameScreen with game data when "Resume" is pressed', async () => {
    renderWithNavigation(<GameHistoryPage navigation={navigation} />);

    // Wait for in-progress games to load on the screen
    await waitFor(() => {
      expect(screen.getByText('Game 1')).toBeTruthy(); // Confirm Game 1 appears on the screen
    });

    // Simulate pressing the "Resume" button for Game 1
    fireEvent.press(screen.getByText('Resume'));

    // Verify navigation to GameScreen is called with the correct game data
    expect(navigation.navigate).toHaveBeenCalledWith('GameScreen', {
      gameName: 'Game 1',
      players: ['Alice', 'Bob'],
      grid: [], // Passing empty array for grid as per mock data
      history: [], // Passing empty array for history as per mock data
    });
  });
});
