import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Button, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ShopListCard from '../components/ShopListCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

export default function AddShoppingListItem({ navigation, route }) {
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [ingredientAmount, setIngredientAmount] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState("");
    const [ingredientList, setIngredientList]= useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getToken = async () => {
            try {
                const userToken = await AsyncStorage.getItem('token');
                setToken(userToken);
            } catch (error) {
                console.error('Token alınırken bir hata oluştu:', error);
            }
        };
        getToken();
    }, []);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
            const response = await axios.get('http://192.168.56.1:3030/unit');
            setUnits(response.data.data);
            } catch (error) {
            console.error('Birimleri alma hatası:', error);
            }
        }; 
        fetchUnits();
    }, []);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
            const response = await axios.get('http://192.168.56.1:3030/ingredient');
            setIngredientList(response.data.data);
            } catch (error) {
            console.error('Malzemeleri alma hatası:', error);
            }
        };
        fetchIngredients(); 
    }, []);
 
    const handleResetScreen = () => { 
        navigation.reset({
          index: 0,
          routes: [{ name: 'ShoppingListPage' }],
        });
        navigation.navigate('ShoppingListPage'); 
    };
    
    const handleSearch = (text) => {
        setSearchTerm(text);
        const filteredIngredients = ingredientList.filter(ingredient =>
            ingredient.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredIngredients(filteredIngredients);
    };
    
    const handleIngredientSelect = (ingredientId, itemName) => {
        setSelectedIngredient(ingredientId);
        console.log("Seçilen malzeme:", ingredientId);
        setSearchTerm(itemName); 
        setFilteredIngredients([]);
    };

    const saveItem= async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            console.log("Token:", token);
            if (!token) {
                console.log("Token not found");
                return; 
            }  
            const res = await axios.post("http://192.168.56.1:3030/userdata", { token: token });
            console.log("okkk", res.data);
            if (res.data.status === "ok") {
                setUserId(res.data._id); 
                const selectedItem = selectedIngredient ? selectedIngredient : searchTerm;
                const shoppingListData = {
                    itemName: selectedItem,
                    amount: ingredientAmount,
                    unit: selectedUnit,
                    userId: res.data._id,
                }
                console.log("gönderilen istek:", shoppingListData);
                await AsyncStorage.setItem('shoppingListData', JSON.stringify(shoppingListData));
                try {
                    const response = await axios.post("http://192.168.56.1:3030/shoppingList/addIngredient", shoppingListData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    console.log("Sunucudan Gelen Yanıt:", response.data);
                    handleResetScreen();
                } catch (error) {
                    console.error("List Bir hata oluştu:", error.message);
                    console.error("Sunucudan gelen hata:", error.response.data.error);
                    console.log("Hata Detayları:", error.response);
                }
            }
        } catch (error) {
            console.error("userData : Bir hata oluştu:", error.message);
        }
    }
        
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
            <TextInput
                style={[styles.input, { width: '90%' }]}
                placeholder="Malzeme adı ara"
                value={searchTerm}
                onChangeText={handleSearch}
            /> 
            <View style={styles.searchIngredients}>
                {searchTerm !== '' && filteredIngredients.length > 0 && (
                    filteredIngredients.map((ingredient, index) => (
                        <View key={ingredient._id}>
                            <TouchableOpacity
                                style={styles.searchIngredient}
                                onPress={() => handleIngredientSelect(ingredient._id, ingredient.name)}
                            >
                                <Text>{ingredient.name}</Text>
                            </TouchableOpacity>
                            {index < filteredIngredients.length - 1 && <View style={styles.separator} />}
                        </View>
                    ))
                )}
            </View>
        </View>
        <View style={styles.amountPickerContainer}>
        <TextInput
            style={[styles.input, { width: '50%' }]}
            placeholder="Miktar"
            value={ingredientAmount}
            onChangeText={setIngredientAmount}
        />
        <Picker
            selectedValue={selectedUnit}
            style={[styles.input, { width: '50%', borderColor: colors.primary }]}
            onValueChange={(itemValue, itemIndex) => setSelectedUnit(itemValue)}
            >
            <Picker.Item label="Seçiniz" value="" />
            {units.map(unit => (
                <Picker.Item key={unit._id} label={unit.name} value={unit._id} />
            ))}
        </Picker> 
      </View>
      <TouchableOpacity style={styles.button} onPress={saveItem}>
            <Text style={{color:'white'}}>Alışveriş listesine Kaydet</Text>
        </TouchableOpacity>
    </SafeAreaView>
 
  )
}


const styles=StyleSheet.create({
    container:{
        flex:1,
        width:'100%',
        height:'100%',
        alignItems:'center',
        backgroundColor: colors.bg
    },
    searchContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    input:{
        height:50,
        paddingLeft: 10,
        marginVertical:10,
        borderRadius:5,
        borderWidth:1,
        borderColor:colors.primary,
        backgroundColor:"#FFF4"
    },
    searchIngredient: {
        paddingLeft: 10,
        marginVertical:5,
    },
    separator: {
        marginTop: 5,
        borderBottomWidth: 0.4,
        borderColor: 'gray',
        width:"100%",
    },

    searchIngredients: {
        backgroundColor: '#FFF4',
        justifyContent: "flex-start",
        alignItems:'flex-start',
        width:"90%",

    },
    amountPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
      },
      amountInput: {
        marginRight: 10,
      },
      picker: {
        width: 150,
        borderRadius:5,
        borderWidth:1,
        borderColor:colors.primary,
        backgroundColor:"#FFF4"
      },
      button:{ 
        width:"90%",
        height:45,
        alignItems:'center',
        justifyContent:'center',
        marginBottom:5,
        borderRadius:20,
        borderWidth: 1,
        borderColor:colors.primary,
        backgroundColor:colors.primary,
        marginBottom:10, 
    },
})