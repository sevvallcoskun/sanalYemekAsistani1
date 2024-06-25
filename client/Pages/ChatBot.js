import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';
import { colors } from '../theme/colors';
import LottieView from 'lottie-react-native';

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  async function getData() {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    await axios
      .post('http://192.168.56.1:3030/userdata', { token: token })
      .then(res => {
        console.log(res.data);
        setUserData(res.data.data);
      });
  }

  useEffect(() => {
    getData();
  }, []);

  const runPythonScript = async () => {
    try {
      const response = await axios.post('http://192.168.56.1:3030/run-python');
      if (response.data.message) {
        setMessage(response.data.message); 
        setIsRecording(false);  // Stop recording and show the image again
      }
    } catch (error) {
      console.error('Error while running Python script:', error);
      setMessage('An error occurred');
      setIsRecording(false);  // Stop recording and show the image again in case of error

    }
  };

  const handlePress = () => {
    setIsRecording(true);
    runPythonScript();
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcome}>
        <Text style={{ marginTop: 10, fontSize: 30, fontWeight: '500', color: colors.primary }}>
          Merhaba, {userData.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1).toLowerCase() : 'Kullanıcı'}!
        </Text>
      </View>
      <TouchableOpacity onPress={handlePress}>
        {!isRecording && (
          <Image 
            style={{ marginRight: 5, width: 150, height: 150 }} 
            source={require('../assets/voice.png')} 
          />
        )}
      </TouchableOpacity>
      {isRecording && (
        <View style={styles.overlay}>
          <LottieView 
            source={require('../assets/micr_animation.json')} 
            style={styles.animation}
            autoPlay 
            loop 
          /> 
        </View>
      )}
    </View>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },
  welcome: {
    position: 'absolute',
    top: 0,
    left: 0, 
    padding: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: { width: 150, height: 150 },
});
