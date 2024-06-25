import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useState } from 'react';
import React from 'react'
import { colors } from "../theme/colors";
import axios from  'axios';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import Loading from './Loading';

export default function SignupPage({navigation}) {
  const[name, setName]=useState("");
  const[surname, setSurname]=useState("");
  const[email, setEmail]=useState("");
  const[password, setPassword]=useState("");
  const[errors, setErrors]=useState({});
  const[loading, setLoading] = useState(false);
  const[token, setToken] = useState(null);

  const validateEmail = (email) => {
    if (/[A-Z]/.test(email)) {
      return "Email adresi büyük harf içeremez";
    }
    if (!email.endsWith("@gmail.com")) {
      return "Email adresi @gmail.com ile bitmelidir";
    }
    return null;
  };

  const validateForm = () => {
    let errors = {};
    if (!name) errors.name = "Ad bilgisi boş bırakılamaz";
    if (!surname) errors.surname = "Soyad bilgisi boş bırakılamaz";
    if (!email) errors.email = "Email bilgisi boş bırakılamaz";
    else {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    }
    if (!password) errors.password = "Şifre boş bırakılamaz";
    else if (password.length < 8) errors.password = "Şifre en az 8 karakter olmalıdır";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userData = {
        name: name,
        surname: surname,
        email: email,
        password: password,
        token: token
      };
      
      if (!validateForm()) {
        return;
      }
      console.log("submitted", email, password, name, surname);
      setName("");
      setSurname("");
      setEmail("");
      setPassword("");
      setErrors({});
      const response = await axios.post('http://192.168.56.1:3030/register', userData);
      if (response.data.status === 'ok') { 
        const userId = response.data.userId;
        const token = response.data.data;
        AsyncStorage.setItem("token", token);
        setToken(token); 
        console.log(token)
        console.log("res.data", response.data)
        navigation.navigate('Survey', { userId: userId })
      } else {
        Alert.alert('Hata',"Bu mail hesabına sahip bir kullanıcı zaten var", response.data.error);
      }
      return;
    } catch (error) {
      Alert.alert("Hata", "Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
      console.error("Sunucu hatası:", error);
    } finally {
      setLoading(false);
    }
  };
      
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
          placeholder='Ad'
          value={name}
          onChangeText={setName}
        />
        {
          errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null
        }
        <TextInput 
          style={styles.input} 
          placeholder='Soyad'
          value={surname}
          onChangeText={setSurname}
        />
        {
          errors.surname ? <Text style={styles.errorText}>{errors.surname}</Text> : null
        }
        <TextInput 
          style={styles.input} 
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
        />
        {
          errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null
        }
        <TextInput 
          style={styles.input} 
          placeholder='Şifre' 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          underlineColorAndroid="#DADADA"
        />
        {
          errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null
        }
        <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
          <Text style={{color:"white"}}>Üye ol</Text>
        </TouchableOpacity>       
      </View>
      <Loading isLoading={loading} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: colors.bg
  },
  form:{
    width:"100%",
    padding:20,
    borderRadius:15,
    shadowColor:"black",
    alignItems:"center"
  },
  input:{
    height:40,
    width: '80%',
    justifyContent:'center',
    alignItems:'center',
    marginBottom:5,
    borderColor:"#DADADA",
    padding:10,
    borderRadius:15,
    borderWidth: 1,
    backgroundColor:"#DADADA"
  },
  button:{
    width:"80%" ,
    height:40,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
    borderWidth: 1,
    backgroundColor:colors.secondary,
  },
  images:{
    resizeMode:'contain',
    alignSelf:'center',
  },
  errorText:{
    color:"red",
    marginBottom:5,
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
