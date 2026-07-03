import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = async () => {
  const url = await AsyncStorage.getItem('SERVER_URL');
  return url || 'http://192.168.1.100:8000';
};

export interface ChatResponse {
  response: string;
  mood: string;
  affection_level: number;
  pet_name: string;
  model_used: string;
  voice_url?: string;
}

export const kavitaApi = {
  chat: async (message: string): Promise<ChatResponse> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await axios.post(`${baseUrl}/chat`, {
        message,
        user_id: 'mobile_user',
        voice: false
      });
      return response.data;
    } catch (error) {
      return {
        response: "Sorry baby, network issue aa raha hai 😢. Please check your server connection.",
        mood: "sad",
        affection_level: 50,
        pet_name: "baby",
        model_used: "error"
      };
    }
  },

  chatWithVoice: async (message: string): Promise<ChatResponse> => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await axios.post(`${baseUrl}/chat`, {
        message,
        user_id: 'mobile_user',
        voice: true
      });
      return response.data;
    } catch (error) {
      return {
        response: "Baby, voice mode mein problem aa rahi hai 😢",
        mood: "sad",
        affection_level: 50,
        pet_name: "baby",
        model_used: "error"
      };
    }
  },

  getMood: async () => {
    try {
      const baseUrl = await getBaseUrl();
      const response = await axios.get(`${baseUrl}/mood`);
      return response.data;
    } catch (error) {
      return { mood: 'happy', affection: 50, pet_name: 'baby' };
    }
  },

  saveMoment: async (moment: string) => {
    try {
      const baseUrl = await getBaseUrl();
      await axios.post(`${baseUrl}/special-moment`, { moment });
      return true;
    } catch (error) {
      return false;
    }
  }
};
