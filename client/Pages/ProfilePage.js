import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import { MaterialIcons, Feather} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import axios from 'axios'; 
import AsyncStorage  from '@react-native-async-storage/async-storage';
import Loading from './Loading';

const arrowIcon=<Feather name="arrow-up-right" size={24} color={colors.primary} />;
const logoutIcon=<MaterialIcons name="logout" size={24} color={colors.primary} />

export default function ProfilePage({navigation}) {
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(false);

  async function getData() {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    await axios
      .post('http://192.168.56.1:3030/userdata', { token: token })
      .then(res => {
          console.log("userdata:", res.data);
          console.log("id", res.data.data._id)
          setUserData(res.data.data);
          setLoading(false);  // Veri alındıktan sonra loading false olacak
        }
      )
      .catch(error => {
        console.error("Error fetching user data:", error);
        setLoading(false);  // Hata durumunda da loading false olacak
      });
  }

  useEffect(() => {
    getData();
  }, []);

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  const handleNavigateSurvey = async () => {
    navigation.navigate('UserSurvey', { userId: userData._id });
  }

  if (loading) {
    return <Loading isLoading={loading} />;
  }

  return (
    <SafeAreaView style={styles.container}> 
      <Image style={{ marginTop:'10%'}} source={require('../assets/chef-hat.png')} />
      <Text style={{fontSize:26, fontWeight: "bold"}}>
        {userData.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1).toLowerCase() : 'Kullanıcı'}
        {' '}
        {userData.surname ? userData.surname.charAt(0).toUpperCase() + userData.surname.slice(1).toLowerCase() : 'Kullanıcı'}
      </Text>
      <View style={styles.content}>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('RecipesPage')}>
          <Text style={{fontSize:16}}>Tariflerim</Text>
          {arrowIcon}
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{fontSize:16}}>Sanal Yemek Asistanı Hakkında</Text>
          {arrowIcon}
        </TouchableOpacity>
        <View style={styles.separator} />
        <View style={{marginTop:10}}></View>
        <TouchableOpacity style={styles.buttonContainer} onPress={handleLogout}>
          <Text style={{fontSize:16}}>Çıkış yap</Text>
          {logoutIcon}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: colors.bg
  },
  button: {
    width: "90%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 60,
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
    marginBottom: 10, 
  },
  content: {
    flex: 1,
    width: '100%',
    marginTop: '20%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  separator: {
    marginTop: 5,
    borderBottomWidth: 0.4,
    borderColor: 'gray',
  },
});
