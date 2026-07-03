import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  PermissionsAndroid
} from 'react-native';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import { kavitaApi } from '../api/kavitaApi';

const VoiceScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [kavitaResponse, setKavitaResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Kavita needs microphone access to hear you 💕',
          buttonPositive: 'Allow'
        }
      );
    }
  }, []);

  useEffect(() => {
    requestPermission();
    
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    Tts.setDefaultLanguage('hi-IN');
    Tts.setDefaultRate(0.45);
    Tts.setDefaultPitch(1.1);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Tts.stop();
    };
  }, [pulseAnim, requestPermission]);

  const onSpeechResults = useCallback(async (e: any) => {
    const text = e.value[0];
    setSpokenText(text);
    setIsListening(false);
    setIsProcessing(true);

    const response = await kavitaApi.chatWithVoice(text);
    setKavitaResponse(response.response);
    setIsProcessing(false);

    Tts.stop();
    Tts.speak(response.response);
  }, []);

  const onSpeechError = useCallback((e: any) => {
    console.error('Speech error:', e);
    setIsListening(false);
    setKavitaResponse('Baby, mujhe samajh nahi aaya. Phir se bolo na? 😢');
  }, []);

  const startListening = useCallback(async () => {
    try {
      setSpokenText('');
      setKavitaResponse('');
      setIsListening(true);
      await Voice.start('hi-IN');
    } catch (e) {
      console.error('Start listening error:', e);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      setIsListening(false);
      await Voice.stop();
    } catch (e) {
      console.error('Stop listening error:', e);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Talk to Kavita</Text>
      <Text style={styles.subtitle}>Hold the button and speak</Text>

      <View style={styles.micContainer}>
        {isListening && (
          <Animated.View style={[
            styles.pulseRing,
            { transform: [{ scale: pulseAnim }] }
          ]} />
        )}
        
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening && styles.micButtonActive
          ]}
          onPressIn={startListening}
          onPressOut={stopListening}
          activeOpacity={0.8}
        >
          <Text style={styles.micIcon}>
            {isListening ? '🎤' : '🔴'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.status}>
        {isListening ? 'Listening... 💕' : 
         isProcessing ? 'Kavita soch rahi hai...' : 
         'Hold to talk'}
      </Text>

      {spokenText ? (
        <View style={styles.textBox}>
          <Text style={styles.label}>You said 💬</Text>
          <Text style={styles.text}>{spokenText}</Text>
        </View>
      ) : null}

      {kavitaResponse ? (
        <View style={[styles.textBox, styles.kavitaBox]}>
          <Text style={styles.label}>Kavita 💕</Text>
          <Text style={styles.kavitaText}>{kavitaResponse}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    paddingTop: 60
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40
  },
  micContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderWidth: 2,
    borderColor: '#FF6B9D'
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 10
  },
  micButtonActive: {
    backgroundColor: '#FF4081'
  },
  micIcon: {
    fontSize: 50
  },
  status: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    fontWeight: '500'
  },
  textBox: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  kavitaBox: {
    backgroundColor: '#FFE4EC',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D'
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24
  },
  kavitaText: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '500',
    lineHeight: 24
  }
});

export default VoiceScreen;
