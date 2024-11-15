import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * GameScreenPage Component
 * 
 * This component represents the main game screen where players interact with the game grid.
 * It allows players to mark their scores, undo actions, reset the board, and manage the game's state.
 */
export default function GameScreenPage({ navigation, route }) {
  const rows = ['20', '19', '18', '17', '16', '15', 'Bull']; // Rows for the game grid
  const gameName = route.params?.gameName || 'Game'; // Retrieve the game name from route parameters
  const players = route.params?.players || ['Player 1', 'Player 2']; // Retrieve the player names from route parameters
  const initialGridState = rows.map(() => [...Array(players.length)].map(() => ({ taps: 0 }))); // Initialize the grid state

  const [grid, setGrid] = useState(route.params?.grid ? JSON.parse(JSON.stringify(route.params.grid)) : initialGridState);
  const [history, setHistory] = useState(route.params?.history ? [...route.params.history] : []);
  const [originalGrid, setOriginalGrid] = useState(route.params?.grid ? JSON.parse(JSON.stringify(route.params.grid)) : initialGridState);
  const [originalHistory, setOriginalHistory] = useState(route.params?.history ? [...route.params.history] : []);
  const [changesMade, setChangesMade] = useState(false); // Track if any changes have been made
  const [isWinnerDeclared, setIsWinnerDeclared] = useState(false); // Track if a winner is declared

  /**
   * useEffect Hook
   * 
   * This hook is used to update the original grid and history state when the component
   * receives new grid and history data through route parameters. It ensures that the
   * component has the correct initial state when the game is resumed.
   */
  useEffect(() => {
    if (route.params?.grid) {
      setOriginalGrid(JSON.parse(JSON.stringify(route.params.grid)));
      setOriginalHistory([...route.params.history]);
    }

     // Cleanup function to save the game when the component unmounts
    return () => {
      if (!isWinnerDeclared) {
        saveGame(); // Save the game when the component unmounts
      }
    };
  }, [route.params?.grid, route.params?.history, isWinnerDeclared]);

  /**
   * saveGame Function
   * 
   * This function saves the current game state to AsyncStorage, either by updating
   * an existing in-progress game or adding a new entry if necessary.
   */
  const saveGame = async () => {
    // Only save if the game is in-progress
    if (isWinnerDeclared || !changesMade) return;

    const gameHistory = {
      gameName,
      players,
      grid,
      history,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      let inProgressGames = existingGames ? JSON.parse(existingGames) : [];
      
      // Find and remove the old game entry
      inProgressGames = inProgressGames.filter(game => JSON.stringify(game.grid) !== JSON.stringify(originalGrid));
      
      // Add the updated game
      inProgressGames.push(gameHistory);

      await AsyncStorage.setItem('inProgressGames', JSON.stringify(inProgressGames));
      setOriginalGrid(JSON.parse(JSON.stringify(grid)));
      setChangesMade(false); // Reset change tracking
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  /**
   * saveGameIfChanged Function
   * 
   * This function checks if changes have been made to the game state.
   * If changes are detected, it triggers the saveGame function.
   */
  const saveGameIfChanged = async () => {
    if (changesMade) {
      await saveGame();
    }
  };

  /**
   * handleCellPress Function
   * 
   * This function handles the press event on a cell in the game grid.
   * It increments the number of taps for that cell, updates the grid state,
   * and checks if a player has won the game.
   */
  const handleCellPress = (rowIndex, colIndex) => {
    if (isWinnerDeclared) return;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const previousTaps = newGrid[rowIndex][colIndex].taps;
      const newTaps = Math.min(previousTaps + 1, 3); // Limit the taps to a maximum of 3
      newGrid[rowIndex][colIndex] = { taps: newTaps };

      setHistory((prevHistory) => [
        ...prevHistory,
        { rowIndex, colIndex, previousTaps },
      ]);

      setChangesMade(true); // Mark that changes have been made

      checkForWinner(newGrid, colIndex); // Check if this move made someone a winner
      saveGame(); // Save game after updating the cell

      return newGrid;
    });
  };

  /**
   * handleUndo Function
   * 
   * This function allows the user to undo the last move made in the game.
   * It updates the grid state to reflect the previous state.
   */
  const handleUndo = () => {
    if (history.length === 0 || isWinnerDeclared) return;
    const lastMove = history.pop();
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[lastMove.rowIndex][lastMove.colIndex] = {
        taps: lastMove.previousTaps
      };
      return newGrid;
    });
    setHistory([...history]);
    setChangesMade(true); // Mark that changes have been made
    saveGame(); // Save game after undo
  };
  
  /**
   * handleResetBoard Function
   * 
   * This function resets the game board to its initial state, clearing all marks.
   * It asks the user for confirmation before proceeding with the reset.
   * After resetting the board, it immediately saves the new game state to ensure 
   * that the reset state is reflected when navigating away or resuming the game.
   */
  const handleResetBoard = () => {
    Alert.alert(
      'Reset Board',
      'Are you sure you want to reset the board? This will clear all marks.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            setGrid(initialGridState); // Reset the grid
            setHistory([]); // Clear the history
            setChangesMade(true); // Mark changes as made
            await saveResetGame(); // Immediately save the new reset state
          },
        },
      ]
    );
  };

  /**
 * saveResetGame Function
 * 
 * This function saves the game state after the board has been reset. It clears
 * the grid and history, then updates AsyncStorage with the reset state. This ensures 
 * that when the game is resumed from the Game History page, the reset board state is loaded.
 */
  const saveResetGame = async () => {
    const currentTime = new Date().toLocaleTimeString();
    const resetGameHistory = { // Create a new game history object that reflects the reset state
      gameName,
      players,
      grid: initialGridState, // Save the reset grid state
      history: [],            // Clear the history as part of the reset
      date: new Date().toLocaleDateString(),
      time: currentTime,
    }

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      let inProgressGames = existingGames ? JSON.parse(existingGames) : [];

      // Remove the old game entry by matching the original grid state
      inProgressGames = inProgressGames.filter(
        (game) => JSON.stringify(game.grid) !== JSON.stringify(originalGrid)
      );

      // Add the reset game to AsyncStorage
      inProgressGames.push(resetGameHistory);
      await AsyncStorage.setItem('inProgressGames', JSON.stringify(inProgressGames));

      // Update the original grid and history
      setOriginalGrid(JSON.parse(JSON.stringify(initialGridState)));
      setOriginalHistory([]);
      setChangesMade(false); // No further changes after reset
    } catch (error) {
      console.error('Failed to save reset game:', error);
    }
  };

  /**
   * renderCellContent Function
   * 
   * This function returns the appropriate symbol to display in a grid cell
   * based on the number of taps: "/", "X", or "Ⓧ".
   */
  const renderCellContent = (taps) => {
    if (taps === 1) return '/';
    if (taps === 2) return 'X';
    if (taps === 3) return 'Ⓧ'; // X with a circle
    return '';
  };

  /**
   * getCellFontSize Function
   * 
   * This function returns the appropriate font size based on the number of taps.
   * The font size is larger when the symbol is "Ⓧ".
   */
  const getCellFontSize = (taps) => {
    if (taps === 3) return styles.largeText; // Larger font size for the circled X
    return styles.normalText;
  };

  /**
   * resetGame Function
   * 
   * This function helps the handleNewGameFromWinner function to ensure the board is reset
   * when a user starts a new game from the Winner Popup Page.
   */
  const resetGame = () => {
    setGrid(initialGridState); // Reset the grid to the initial state
    setHistory([]); // Clear the history
    setIsWinnerDeclared(false); // Reset winner status
  };

  /**
   * handleNewGameFromWinner Function
   * 
   * Resets the game and clears the navigation stack to start fresh from the GameSetup screen.
   */
  const handleNewGameFromWinner = () => {
    resetGame(); // Reset the game state
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'GameSetup' }],
      })
    );
  };

  /**
   * checkForWinner Function
   * 
   * This function checks if a player has filled an entire column with "Ⓧ" symbols,
   * which would indicate a win. If a player wins, the game is saved as completed
   * and the user is navigated to the WinnerPopupPage.
   */
  const checkForWinner = (grid, colIndex) => {
    const column = grid.map(row => row[colIndex]);
    const isWinner = column.every(cell => cell.taps === 3);

    if (isWinner) {
      const winnerName = players[colIndex];
      setIsWinnerDeclared(true); // Mark the game as completed
      saveCompletedGame(winnerName);  // Save the game as completed
      removeFromInProgress();
      // Delay navigation to avoid updating state during render
      setTimeout(() => {
        navigation.navigate('WinnerPopup', {
          playerName: winnerName,
          date: new Date().toLocaleDateString(),
        });
      }, 100);
    }
  };

  /**
   * removeFromInProgress Function
   * 
   * This function removes the current game from the in-progress games stored in AsyncStorage.
   * It ensures that the game is removed from the in-progress list if the game is completed.
   */
  const removeFromInProgress = async () => {
    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      let inProgressGames = existingGames ? JSON.parse(existingGames) : [];

      // Filter out the current game from "In-Progress" by comparing the grid or unique identifier
      inProgressGames = inProgressGames.filter(game => JSON.stringify(game.grid) !== JSON.stringify(originalGrid));

      await AsyncStorage.setItem('inProgressGames', JSON.stringify(inProgressGames));
    } catch (error) {
      console.error('Failed to remove game from in-progress:', error);
    }
  };

  /**
   * saveCompletedGame Function
   * 
   * This function saves the completed game to the list of completed games in AsyncStorage.
   */
  const saveCompletedGame = async (winnerName) => {
    const completedGame = {
      gameName,
      players,
      grid,
      winner: winnerName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    try {
      const existingGames = await AsyncStorage.getItem('completedGames');
      const completedGames = existingGames ? JSON.parse(existingGames) : [];
      completedGames.push(completedGame);
      await AsyncStorage.setItem('completedGames', JSON.stringify(completedGames));
      // After saving to "Completed", remove it from "In-Progress"
      await removeFromInProgress();
    } catch (error) {
      console.error('Failed to save completed game:', error);
    }
  };

  /**
   * getNumberColumnPosition Function
   * 
   * This function determines the position of the number column based on the number of players.
   * It ensures that the number column is correctly placed between player columns.
   */
  const getNumberColumnPosition = () => {
    if (players.length === 2) {
      return 1; // Insert between the two players
    } else if (players.length === 3) {
      return 2; // Insert between the second and third players
    } else if (players.length === 4) {
      return 2; // Insert between the second and third players
    }
    return players.length; // Default: insert at the end
  };

  return (
    <View style={styles.container}>
      {/* Header displaying the game name */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{gameName}</Text>
      </View>

      {/* Main grid container */}
      <View style={styles.gridContainer}>
        {/* Top row displaying player names and a blank cell for alignment */}
        <View style={styles.row}>
          {players.map((player, index) => (
            <React.Fragment key={`player-${index}`}>
              {/* Insert a blank cell for alignment if necessary */}
              {index === getNumberColumnPosition() && (
                <View style={styles.cell} key="blank-above-numbers">
                  <Text style={styles.playerText}></Text>
                </View>
              )}
              {/* Display each player's name */}
              <View style={styles.cell} key={`player-name-${index}`}>
                <Text style={styles.playerText}>{player}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Display the game grid with rows and columns */}
        {rows.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {players.map((_, colIndex) => (
              <React.Fragment key={`fragment-${rowIndex}-${colIndex}`}>
                {/* Insert the numbers column in the correct position */}
                {colIndex === getNumberColumnPosition() && (
                  <View style={styles.cell} key={`number-${row}`}>
                    <Text style={styles.scoreText}>{row}</Text>
                  </View>
                )}
                {/* Render each cell in the grid, handling taps and displaying the appropriate symbol */}
                <TouchableOpacity
                  testID={`cell-${rowIndex}-${colIndex}`}
                  style={styles.cell}
                  key={`cell-${rowIndex}-${colIndex}`}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text style={[styles.scoreText, getCellFontSize(grid[rowIndex][colIndex].taps)]}>
                    {renderCellContent(grid[rowIndex][colIndex].taps)}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>

      {/* Footer with Undo and Reset Board buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleUndo}>
          <Text style={styles.footerButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleResetBoard}>
          <Text style={styles.footerButtonText}>Reset Board</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameScreenPage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A05C59',
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#A05C59',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: '#6495ED', // Blue color for the cells
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  playerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  normalText: {
    fontSize: 24,
  },
  largeText: {
    fontSize: 40, // Larger font size for circled X
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 60,
    backgroundColor: '#A05C59',
  },
  footerButton: {
    flex: 1, // Ensure both buttons take up equal space
    backgroundColor: '#D3D3D3',
    paddingVertical: 15,
    alignItems: 'center', // Center the text inside the button
    borderRadius: 5,
    marginHorizontal: 10, // Add some space between the buttons
  },
  footerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * GameScreenPage.js Explanation:
 * 
 * 1. `GameScreenPage Component`: The main component that represents the game screen where users can interact with the game grid, make moves, undo actions, reset the board, and navigate to other screens.
 * 2. `useEffect Hook`: Updates the original grid and history states when the component receives new data via route parameters, ensuring proper state initialization.
 * 3. `saveGame Function`: Saves the current game state to AsyncStorage, ensuring that the game can be resumed later.
 * 4. `saveGameIfChanged Function`: Checks if changes have been made to the game state and triggers the saveGame function if any are detected.
 * 5. `handleCellPress Function`: Handles user interactions with the game grid, updating the grid state and checking for a winner.
 * 6. `handleUndo Function`: Allows the user to undo the last move made in the game and updates the grid state to reflect the previous state.
 * 7. `handleResetBoard Function`: Resets the game board to its initial state, clears all marks, immediately saves the new state, and alerts the user for confirmation before resetting.
 * 8. `saveResetGame Function`: This function saves the reset game state to AsyncStorage, ensuring the reset state is preserved and correctly loaded when the game is resumed.
 * 9. `renderCellContent Function`: Returns the appropriate symbol to display in a grid cell based on the number of taps.
 * 10. `getCellFontSize Function`: Returns the appropriate font size for each symbol and displays a larger font for the X with a circle.
 * 11. `checkForWinner Function`: Checks if a player has won by filling a column with "Ⓧ" symbols. If a player wins, the game is saved as completed, and the user is navigated to the WinnerPopupPage.
 * 12. `resetGame Function`: Resets the game grid, history, and winner status to the initial state.
 * 13. `handleNewGameFromWinner Function`: Resets the game and clears the navigation stack to start a new game from the GameSetup screen.
 * 14. `removeFromInProgress Function`: Removes the current game from in-progress games in AsyncStorage upon completion, ensuring that completed games are not duplicated in-progress.
 * 15. `saveCompletedGame Function`: Saves the completed game to the list of completed games in AsyncStorage.
 * 16. `getNumberColumnPosition Function`: Determines the position of the number and bull column based on the number of players and ensures the blank tile is in the appropriate position between the player names.
 * 17. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and consistent with the rest of the app.
 */
