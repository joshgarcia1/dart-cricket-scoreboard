import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import GameHistoryPage from './components/GameHistoryPage';
import GameSetupPage from './components/GameSetupPage';
import GameScreenPage from './components/GameScreenPage';
import WinnerPopupPage from './components/WinnerPopupPage';

const Stack = createNativeStackNavigator();

/**
 * App.js
 * 
 * This is the root component of the app, responsible for setting up the navigation structure.
 * It uses a stack navigator to manage transitions between different screens in the app.
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ title: 'Home', headerShown: false }} // Hide header on Home page
        />
        <Stack.Screen 
          name="About" 
          component={AboutPage} 
          options={{ 
            title: 'About',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#FFF',
          }} 
        />
        <Stack.Screen 
          name="GameHistory" 
          component={GameHistoryPage} 
          options={{ 
            title: 'Game History',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#FFF',
          }} 
        />
        <Stack.Screen 
          name="GameSetup" 
          component={GameSetupPage} 
          options={{ 
            title: 'Setup',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#FFF',
          }} 
        />
        <Stack.Screen 
          name="GameScreen" 
          component={GameScreenPage} 
          options={{ 
            title: 'Game',
            headerStyle: { backgroundColor: '#A05C59' },
            headerTintColor: '#FFF',
          }} 
        />
        <Stack.Screen 
          name="WinnerPopup" 
          component={WinnerPopupPage} 
          options={{ 
            title: '', // No title for the popup
            headerShown: false, // Hide header for the popup
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * App.js Explanation:
 * 
 * 1. `NavigationContainer`: Wraps the entire app and manages the navigation state.
 * 2. `createNativeStackNavigator`: Creates a stack navigator to handle screen transitions.
 * 3. `Stack.Navigator`: Configures the stack navigator, including the initial route and global screen options.
 * 4. `Stack.Screen`: Defines individual screens that the app can navigate to, with the corresponding component that should be rendered.
 */
