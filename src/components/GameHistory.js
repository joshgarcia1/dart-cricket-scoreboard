import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

/**
 * GameHistoryPage Component
 * 
 * This component displays a list of in-progress and completed games.
 * Users can resume in-progress games, view details of completed games, or delete games from the history.
 */
export default function GameHistoryPage({ navigation }) {
  const [inProgressGames, setInProgressGames] = useState([]);
  const [completedGames, setCompletedGames] = useState([]);

  /**
   * loadGames Function
   * 
   * This function loads the in-progress and completed games from AsyncStorage
   * and updates the component's state with the retrieved data.
   */
  const loadGames = async () => {
    try {
      const savedInProgressGames = await AsyncStorage.getItem('inProgressGames');
      const savedCompletedGames = await AsyncStorage.getItem('completedGames');
      setInProgressGames(savedInProgressGames ? JSON.parse(savedInProgressGames) : []);
      setCompletedGames(savedCompletedGames ? JSON.parse(savedCompletedGames) : []);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  /**
   * useFocusEffect Hook
   * 
   * This hook reloads the game data every time the user navigates to the GameHistoryPage.
   * It ensures that the displayed data is always up to date.
   */
  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  /**
   * deleteGame Function
   * 
   * This function deletes a selected game from the appropriate list (in-progress or completed)
   * and updates AsyncStorage and the component's state to reflect the change.
   */
  const deleteGame = async (game, type) => {
    try {
      let gamesList;
      if (type === 'inProgress') {
        gamesList = await AsyncStorage.getItem('inProgressGames');
        gamesList = gamesList ? JSON.parse(gamesList) : [];
        gamesList = gamesList.filter((g) => JSON.stringify(g) !== JSON.stringify(game));
        await AsyncStorage.setItem('inProgressGames', JSON.stringify(gamesList));
        setInProgressGames(gamesList);
      } else {
        gamesList = await AsyncStorage.getItem('completedGames');
        gamesList = gamesList ? JSON.parse(gamesList) : [];
        gamesList = gamesList.filter((g) => JSON.stringify(g) !== JSON.stringify(game));
        await AsyncStorage.setItem('completedGames', JSON.stringify(gamesList));
        setCompletedGames(gamesList);
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  };

  /**
   * confirmDelete Function
   * 
   * This function displays an alert to confirm whether the user really wants to delete the selected game.
   * If confirmed, it calls the deleteGame function.
   */
  const confirmDelete = (game, type) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteGame(game, type),
          style: 'destructive',
        },
      ]
    );
  };
  
  /**
   * renderGame Function
   * 
   * This function renders each game item in the list. It displays the game name, player names, date,
   * and (for completed games) the winning player. It also provides buttons to resume or delete the game.
   */
  const renderGame = ({ item, index }, type) => (
    <View style={styles.gameItem} key={index}>
      <View style={styles.gameDetails}>
        <Text style={styles.gameText}>{item.gameName}</Text>
        <Text style={styles.playerText}>Players: {item.players.join(', ')}</Text>
        <Text style={styles.dateText}>{item.date} {item.time}</Text>
        {type === 'completed' && (
          <Text style={styles.winnerText}>Winner: {item.winner}</Text>
        )}
      </View>
      <View style={styles.gameActions}>
        {type === 'inProgress' && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => navigation.navigate('GameScreen', {
              gameName: item.gameName,
              players: item.players,
              grid: item.grid,
              history: item.history,
            })}
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item, type)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Section for In-Progress Games */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>In Progress</Text>
      </View>
      
      <FlatList
        data={inProgressGames}
        renderItem={(item) => renderGame(item, 'inProgress')}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Section for Completed Games */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed</Text>
      </View>
      
      <FlatList
        data={completedGames}
        renderItem={(item) => renderGame(item, 'completed')}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameHistoryPage component.
 * It includes layout settings, typography, and colors for the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#6495ED',
  },
  sectionHeader: {
    backgroundColor: '#32CD32', // Green background for section headers
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for better readability
    textAlign: 'center',
  },
  gameItem: {
    backgroundColor: '#87CEEB', // Lighter blue color for game items
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameDetails: {
    flex: 3,
  },
  gameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  playerText: {
    fontSize: 16,
    color: '#000000',
  },
  dateText: {
    fontSize: 14,
    color: '#000000',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500', // Red color for the winner's name
  },
  gameActions: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  resumeButton: {
    backgroundColor: '#32CD32', // Green color for the resume button
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF6347', // Red color for the delete button
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

/**
 * GameHistoryPage.js Explanation:
 * 
 * 1. `GameHistoryPage Component`: The main component that displays the game history. It shows lists of in-progress and completed games, allowing users to resume or delete games.
 * 2. `loadGames Function`: Loads the game data from AsyncStorage and updates the component's state with this data.
 * 3. `useFocusEffect Hook`: Ensures the game data is reloaded every time the user navigates back to the GameHistoryPage.
 * 4. `deleteGame Function`: Deletes a selected game from AsyncStorage and updates the component's state.
 * 5. `confirmDelete Function`: Displays an alert asking the user to confirm before deleting a game.
 * 6. `renderGame Function`: Renders each game item in the list, displaying its details and providing buttons to resume or delete the game.
 * 7. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and consistent with the rest of the app.
 */
