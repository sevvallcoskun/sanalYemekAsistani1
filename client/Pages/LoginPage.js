import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loading from './Loading';
import { colors } from "../theme/colors";

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userData = {
        email: email, 
        password: password
      };
      setErrors({});
      if (!email) {
        setErrors(prevErrors => ({ ...prevErrors, emailError: "Email boş bırakılamaz" }));
        setLoading(false);
        return;
      }
      if (!password) {
        setErrors(prevErrors => ({ ...prevErrors, passwordError: "Şifre boş bırakılamaz" }));
        setLoading(false);
        return;
      }
      const response = await axios.post('http://192.168.56.1:3030/login', userData);
      if (response.data.status === 'ok') {
        console.log("giriş başarılı");
        AsyncStorage.setItem("token", response.data.data);
        AsyncStorage.setItem("isLoggedIn", JSON.stringify(true));
        navigation.navigate('Main');
      } else {
        Alert.alert('Error', response.data.error);
      }
    } catch (error) {
      if (error.response) {
        // Sunucu hatası
        const status = error.response.status;
        if (status === 401) {
          Alert.alert('Error', 'Böyle bir hesap bulunamadı.');
        } else {
          Alert.alert('Error', 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        }
      } else if (error.request) {
        // Ağ hatası
        Alert.alert('Error', 'Ağ hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      } else {
        // Diğer hatalar
        Alert.alert('Error', 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        console.error('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior='padding'
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}>
      <Image source={require('../assets/pngveg2.png')} style={styles.backgroundImage} />
      <Image source={require('../assets/logo.png')} style={styles.images} />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
        />
        {errors.emailError && <Text style={styles.errorText}>{errors.emailError}</Text>}
        <TextInput
          style={styles.input}
          placeholder='Şifre'
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          underlineColorAndroid="#DADADA"
        />
        {errors.passwordError && <Text style={styles.errorText}>{errors.passwordError}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleSubmit} >
          <Text style={{ color: "white" }}>Giriş Yap</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.buttonG}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../assets/google.png')} style={{ height: 30, width: 30, justifyContent: 'flex-start' }} />
            <Text style={{ color: "white", textAlign: 'center' }}>Google ile giriş yap</Text>
          </View>
        </TouchableOpacity> */}
        <View style={{ flexDirection: 'row' }}>
          <Text>Hesabın yok mu?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{ fontWeight: 'bold' }}> Üye ol. </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Loading isLoading={loading} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },
  form: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    backgroundColor: colors.bg,
    shadowColor: "black",
    alignItems: "center"
  },
  input: {
    height: 40,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderColor: "#DADADA",
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "#DADADA"
  },
  button: {
    width: "80%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.secondary,
  },
  buttonG: {
    width: "80%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "blue",
  },
  images: {
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  errorText: {
    color: "red",
    marginBottom: 5,
  },
  backgroundImage: {
    resizeMode: 'stretch',
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 1,
    aspectRatio: 1,
  },
})
