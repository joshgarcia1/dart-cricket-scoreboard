import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

/**
 * HomePage Component
 * 
 * This component serves as the main landing page for the app. 
 * It provides navigation to various sections of the app, including 
 * starting a new game, viewing game history, and accessing the about page.
 */
export default function HomePage({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/dartboard.png')} // Inserting Dartboard image asset
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('GameSetup')} // Navigate to Game Setup screen
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => navigation.navigate('GameHistory')} // Navigate to Game History screen
        >
          <Text style={styles.buttonText}>Game History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.smallButton}
          onPress={() => navigation.navigate('About')} // Navigate to About screen 
        >
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

/**
 * Styles
 * 
 * The styles object contains the styling for the HomePage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A05C59', // Crimson red background color
    paddingBottom: 100
  },
  imageContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    marginBottom: 30,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#D3D3D3', // Gray button color
    paddingVertical: 10,
    paddingHorizontal: 118,
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  smallButton: {
    backgroundColor: '#D3D3D3', // Gray button color
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * HomePage.js Explanation:
 * 
 * 1. `HomePage Component`: This is the main component that serves as the landing page of the app. It provides navigation to different parts of the app, including starting a new game, viewing game history, and accessing the about page.
 * 2. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and consistent with the app's theme.
 */
