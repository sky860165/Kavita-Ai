import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { kavitaApi, ChatResponse } from '../api/kavitaApi';

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'kavita';
  mood?: string;
  timestamp: Date;
}

interface Props {
  navigation: ChatScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const ChatScreen: React.FC<Props> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Haan baby! Main Kavita hun 💕\nTumse baat karke bahut khushi ho rahi hai!',
      sender: 'kavita',
      mood: 'happy',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const getMoodEmoji = (mood?: string) => {
    const moods: Record<string, string> = {
      happy: '😊',
      romantic: '😘',
      jealous: '😤',
      sad: '😢',
      worried: '😟',
      angry: '😠',
      forgiving: '🥺',
      missing: '🥰'
    };
    return moods[mood || 'happy'] || '😊';
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const response = await kavitaApi.chat(userMsg.text);
    
    const kavitaMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: response.response,
      sender: 'kavita',
      mood: response.mood,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, kavitaMsg]);
    setIsTyping(false);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userContainer : styles.kavitaContainer
      ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{getMoodEmoji(item.mood)}</Text>
          </View>
        )}
        
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.kavitaBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.kavitaText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
        )}
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Voice')}
        >
          <Text style={styles.headerButtonText}>🎙️ Voice</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.headerButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Kavita typing</Text>
          <Text style={styles.typingDots}>💕💕💕</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message your Kavita..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendText}>💌</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5'
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FF6B9D',
    paddingTop: Platform.OS === 'ios' ? 50 : 10
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  messageList: {
    padding: 15,
    paddingBottom: 20
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
    maxWidth: width * 0.85
  },
  userContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  kavitaContainer: {
    alignSelf: 'flex-start'
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5
  },
  avatarEmoji: {
    fontSize: 20
  },
  bubble: {
    maxWidth: width * 0.65,
    padding: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  userBubble: {
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 5
  },
  kavitaBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22
  },
  userText: {
    color: '#fff'
  },
  kavitaText: {
    color: '#333'
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end'
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  typingText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontStyle: 'italic'
  },
  typingDots: {
    marginLeft: 5,
    fontSize: 12
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#FFE4EC',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#333'
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    width: 50,
    height: 50,
    backgroundColor: '#FF6B9D',
    borderRadius: 25,
    elevation: 3
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc'
  },
  sendText: {
    fontSize: 22
  }
});

export default ChatScreen;
