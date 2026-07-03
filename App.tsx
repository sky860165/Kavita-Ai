import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import ChatScreen from './src/screens/ChatScreen';
import VoiceScreen from './src/screens/VoiceScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Chat: undefined;
  Voice: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <>
      <StatusBar backgroundColor="#FF6B9D" barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Chat"
          screenOptions={{
            headerStyle: { backgroundColor: '#FF6B9D' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
            cardStyle: { backgroundColor: '#FFF0F5' }
          }}
        >
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: '💕 Kavita AI' }}
          />
          <Stack.Screen 
            name="Voice" 
            component={VoiceScreen}
            options={{ title: '🎙️ Voice Mode' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: '⚙️ Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
