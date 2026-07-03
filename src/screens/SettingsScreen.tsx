import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen: React.FC = () => {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:8000');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await AsyncStorage.getItem('SERVER_URL');
      if (url) setServerUrl(url);
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('SERVER_URL', serverUrl);
      Alert.alert('💕 Saved!', 'Settings saved successfully baby!');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong 😢');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${serverUrl}/health`);
      const data = await response.json();
      Alert.alert('✅ Connected!', `Kavita says: ${data.status}`);
    } catch (error) {
      Alert.alert('❌ Error', 'Cannot connect to Kavita server. Check your PC IP.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>⚙️ Kavita Settings</Text>
        <Text style={styles.subtitle}>Configure your girlfriend AI 💕</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Backend Server</Text>
          <Text style={styles.hint}>
            Apne PC ka IP address daalo. Same WiFi pe hona chahiye.
          </Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.1.100:8000"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>🔄 Test Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📖 How to setup:</Text>
          <Text style={styles.infoText}>
            1. PC pe backend run karo: python main.py{'\n'}
            2. PC ka IP check karo: ipconfig/ifconfig{'\n'}
            3. Woh IP yahan daalo{'\n'}
            4. Test Connection dabao{'\n'}
            5. Phone aur PC same WiFi pe hone chahiye
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={saveSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>
            {isSaving ? '💾 Saving...' : '💾 Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5'
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 30
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 15,
    lineHeight: 20
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc'
  },
  saveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default SettingsScreen;
