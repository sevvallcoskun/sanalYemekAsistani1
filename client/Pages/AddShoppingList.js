import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { colors } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

const checkIconEmpty=<Feather name="circle" size={24} color={colors.primary} />
const checkIcon=<Feather name="check-circle" size={24} color={colors.primary} />

const IngredientCard = ({ ingredient, isAddedToList, toggleCheck }) => (
    <View style={styles.card}>
        <Text style={styles.ingredientText}>
          {`${ingredient.amount} ${ingredient.unitName} ${ingredient.ingredientName}`}
        </Text>
        <TouchableOpacity 
            style={{ justfyContent: 'flex-end', marginHorizontal: 10 }} 
            onPress={toggleCheck}
        >
            {isAddedToList ? checkIcon : checkIconEmpty}
        </TouchableOpacity>
    </View>
); 

export default function AddShoppingList({navigation, route}) {
  const [userId, setUserId] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [unitId, setUnitId] = useState("");
  const [amount, setAmount] = useState(0);
  const [ingredientId, setIngredientId] = useState("");
  const [recIngredients, setRecIngredients] = useState([]);
  const [isAddedToList, setIsAddedToList] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [loading, setLoading] = useState(false);

  const { recipeId } = route.params;
  const { token }= route.params;

  useEffect(() => {
    fetchData();
  }, [recipeId]);

  useEffect(() => {
    setIsAddedToList(recIngredients.map(() => true));
}, []);

  const fetchData = async () => { 
    try {
        setLoading(true);
        const response = await axios.get('http://192.168.56.1:3030/recipeIngredients', {
            params: {
                recipeId: recipeId
            }
        });
        const recipesData = response.data.data;
        const [ingredientsResponse, unitsResponse] = await Promise.all([
            axios.get('http://192.168.56.1:3030/ingredient'),
            axios.get('http://192.168.56.1:3030/unit')
        ]);
        const ingredientsData = ingredientsResponse.data.data.reduce((map, ingredient) => {
            map[ingredient._id] = ingredient;
            return map;
        }, {});
        const unitsData = unitsResponse.data.data.reduce((map, unit) => {
            map[unit._id] = unit;
            return map;
        }, {});
        const mappedIngredients = recipesData.map(ingredient => {
            const foundIngredient = ingredientsData[ingredient.ingredientId];
            const foundUnit = unitsData[ingredient.unitId];
            return {
                ...ingredient,
                ingredientName: foundIngredient ? foundIngredient.name : '',
                unitName: foundUnit ? foundUnit.name : '',
                amount: ingredient.amount || 0
            }; 
        });
        setRecIngredients(mappedIngredients);
        setIngredientName(mappedIngredients[0]?.ingredientName || '');
        setUnitName(mappedIngredients[0]?.unitName || '');
        
        setLoading(false);
    } catch (error) {
        console.error('Veri alma hatası:', error.response || error);
        if (error.response) {
            console.error('Sunucu yanıtı:', error.response.data);
        }
        setLoading(false);
    }
  };

  const toggleCheck = async (index) => {
    const updatedIsAddedToList = [...isAddedToList];
    updatedIsAddedToList[index] = !updatedIsAddedToList[index];
    setIsAddedToList(updatedIsAddedToList);
    const selectedIngredient = recIngredients[index];
    const amount = selectedIngredient.amount;
    const unitId = selectedIngredient.unitId;
    const ingredientId = selectedIngredient.ingredientId;
    setAmount(selectedIngredient.amount);
    setUnitId(selectedIngredient.unitId);
    setIngredientId(selectedIngredient.ingredientId)
  }; 
 
  const handleResetScreen = () => { 
    navigation.reset({
      index: 0,
      routes: [{ name: 'ShoppingListPage' }],
    });
    navigation.navigate('ShoppingListPage'); 
  };

  const handleAddShoppingList = async () => {
    const selectedItems = recIngredients
      .filter((ingredient, index) => isAddedToList[index])
      .map(ingredient => ({
        itemName: ingredient.ingredientId,
        amount: ingredient.amount,
        unit: ingredient.unitId,
        userId: userId,
        recipeId: recipeId
      })); 
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token bulunamadı");
        return; 
      } 
      const res = await axios.post("http://192.168.56.1:3030/userdata", { token: token });
      if (res.data.status === "ok") {
        setUserId(res.data._id);
        for (const selectedItem of selectedItems) {
          const shoppingListData = {
            itemName: selectedItem.itemName,
            amount: selectedItem.amount,
            unit: selectedItem.unit,
            userId: res.data._id,
          };
          console.log("Gönderilen istek:", shoppingListData);
          const response = await axios.post("http://192.168.56.1:3030/shoppingList/addIngredient", shoppingListData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log("Sunucudan Gelen Yanıt:", response.data);
        }
        handleResetScreen();
      }
    } catch (error) {
      console.error('Alışveriş listesine ekleme hatası:', error);
    }
  };
  


  return ( 
    <View style= {styles.container}>
      <>
            {loading ? (
                <View style={{alignItems:'center',marginTop:'10%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
              ) : (
          <>      
            <ScrollView style={styles.scrollContainer}>
              <Text style={{fontWeight:'bold', fontSize:20}}>Alışveriş Listesine Ekle</Text>
              <View style={{ flexDirection: 'column', alignItems:'center' }}>
                {recIngredients.map((ingredient, index) => (
                  <IngredientCard
                      key={index}
                      ingredient={ingredient}
                      isAddedToList={isAddedToList[index]}
                      toggleCheck={() => toggleCheck(index)}
                  />
                ))}
              </View>
              
            </ScrollView>
            <View style={styles.button}> 
                <TouchableOpacity onPress={() => handleAddShoppingList()}>
                  <Text style={{color:'white'}}>Alışveriş listesine ekle</Text>
                </TouchableOpacity>
              </View>
          </>
        )}
      </>
    </View>
  );
};

const styles=StyleSheet.create({
    scrollContainer: {
        marginTop: '5%', 
        marginBottom: 20,
    },
    container:{
      flex:1,
      width:'100%',
      height:'100%',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: colors.bg
    },
    card:{
        flexDirection:'row',
        borderRadius:10,
        justifyContent:'space-between',
        alignItems:'center',
        marginVertical:10,
        width:'90%',
        height:40,
        backgroundColor:colors.fg,    
    },
    text: {
        fontSize: 16,
        fontWeight: '400',
        marginHorizontal: 10,
        alignItems:'flex-start'
    },
    textView:{
        justifyContent:'flex-start',
        flexDirection:'row',
    },
    ingredientText: {
      marginHorizontal:10
    },
    button:{
        width:"94%",
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        borderWidth: 1,
        borderColor:colors.primary,
        backgroundColor:colors.primary,
        marginBottom:'6%'
    },
}) 