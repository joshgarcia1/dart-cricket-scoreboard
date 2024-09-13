import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

/**
 * GameSetupPage Component
 * 
 * This component allows users to set up a new game by entering a game name,
 * specifying player names, and adjusting the number of players. Once the setup
 * is complete, users can start the game, which navigates them to the GameScreenPage.
 */
export default function GameSetupPage({ navigation }) {
  const [gameName, setGameName] = useState('New Game'); // State for storing the game name
  const [players, setPlayers] = useState(['Player 1', 'Player 2']); // State for storing player names
  
  /**
   * addPlayer Function
   * 
   * This function adds a new player to the game setup.
   * It allows a maximum of four players.
   */
  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, `Player ${players.length + 1}`]);
    } else {
      Alert.alert('Player Limit Reached', 'You can only add up to 4 players.');
    }
  };

  /**
   * removePlayer Function
   * 
   * This function removes the last player from the game setup.
   * It ensures that there are always at least two players.
   */
  const removePlayer = (index) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  /**
   * handlePlayerNameChange Function
   * 
   * This function updates the name of a specific player in the players array
   * based on the index passed to it.
   * 
   * @param {string} name - The new name for the player
   * @param {number} index - The index of the player to be updated
   */
  const handlePlayerNameChange = (name, index) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = name;
    setPlayers(updatedPlayers);
  };

  /**
   * startGame Function
   * 
   * This function is triggered when the user presses the "Start Game" button.
   * It navigates the user to the GameScreenPage and passes the game setup details
   * (game name, player names, etc.) to the GameScreenPage component.
   */
  const startGame = () => {
    if (players.length < 2) {
      Alert.alert('Not Enough Players', 'Please add at least two players to start the game.');
    } else {
      navigation.navigate('GameScreen', { gameName, players });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Game Setup</Text>

      {/* Input for the game name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Game Name</Text>
        <TextInput
          style={styles.input}
          value={gameName}
          onChangeText={setGameName}
        />
      </View>

      {/* Player name inputs and button to remove players */}
      {players.map((player, index) => (
        <View key={index} style={styles.inputGroup}>
          <Text style={styles.label}>Player {index + 1}</Text>
          <View style={styles.playerInputRow}>
            <TextInput
              style={[styles.input, styles.playerInput]}
              value={player}
              onChangeText={(text) => handlePlayerNameChange(text, index)}
            />
            {players.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Button to add players */}
      <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
        <Text style={styles.addButtonText}>Add Player</Text>
      </TouchableOpacity>
      
      {/* Button to start the game */}
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameSetupPage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AAFFAA', // Light green background color
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF', // White color background for the input
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#FF6347', // Tomato red color for remove button
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6495ED', // Blue color for add button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  startButton: {
    backgroundColor: '#32CD32', // Lime green color for start button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

/**
 * GameSetupPage.js Explanation:
 * 
 * 1. `GameSetupPage Component`: The main component that allows users to set up a new game by entering the game name and player names, adjusting the number of players, and starting the game.
 * 2. `handlePlayerNameChange Function`: Updates the name of a player based on the index in the players array.
 * 3. `addPlayer Function`: Adds a new player to the setup, allowing a maximum of four players.
 * 4. `removePlayer Function`: Removes the last player from the setup, ensuring at least two players remain.
 * 5. `startGame Function`: Navigates to the GameScreenPage with the setup details if the game name is provided.
 * 6. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and user-friendly.
 */
