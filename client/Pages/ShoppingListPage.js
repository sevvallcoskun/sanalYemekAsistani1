import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons'; 
import ShopListCard from '../components/ShopListCard';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

const addIcon = <Ionicons name="add-circle" size={50} color={colors.primary} />;
const tarifImage = require('../assets/gray.png');
const noFruitImage = require('../assets/nofruit.png');


export default function ShoppingListPage({ navigation, route }) {
  const [listItems, setListItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [recipeNames, setRecipeNames] = useState({});
  const [ingredientNames, setIngredientNames] = useState({});
  const [unitNames, setUnitNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRecipeNames(), fetchIngredientNames(), fetchUnitNames()])
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  useFocusEffect( 
    useCallback(() => {
      const fetchData = async () => {
        await fetchShoppingList();
      };
      fetchData();
    }, [])
  );

  const groupItemsByName = (items) => {
    const groupedItems = {};
    items.forEach(item => {
      if (!groupedItems[item.itemName]) {
        groupedItems[item.itemName] = [];
      }
      groupedItems[item.itemName].push(item);
    });
    return groupedItems;
  };

  const fetchRecipeNames = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/recipes');
      const recipeData = response.data.data;
      const names = {};
      recipeData.forEach(recipe => {
        names[recipe._id] = recipe.name;
      });
      setRecipeNames(names);
    } catch (error) {
      console.error('Malzeme isimlerini alma hatası:', error);
    }
  };

  const fetchIngredientNames = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/ingredient');
      const ingredientData = response.data.data;
      const names = {};
      ingredientData.forEach(ingredient => {
        names[ingredient._id] = ingredient.name;
      });
      setIngredientNames(names);
    } catch (error) {
      console.error('Malzeme isimlerini alma hatası:', error);
    }
  };

  const fetchUnitNames = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/unit');
      const unitData = response.data.data;
      const names = {};
      unitData.forEach(unit => {
        names[unit._id] = unit.name;
      });
      setUnitNames(names);
    } catch (error) {
      console.error('Birim isimlerini alma hatası:', error);
    }
  };

  const fetchShoppingList = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/shoppingList', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const items = response.data.data;
      setListItems(items);
      const groupedItems = groupItemsByName(items);
      setGroupedItems(groupedItems);
    } catch (error) {
      console.error('Listeyi alma hatası:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`http://192.168.56.1:3030/shoppingList/removeItemFromList/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchShoppingList(); 
      console.log("Item successfully deleted:", itemId);
    } catch (error) {
      console.error('Öğeyi silme hatası:', error);
    }
  }; 

  const handleAddButton = async () => {
    navigation.navigate('AddShoppingListItem');
  };

  const handleAmountChange = async (itemId, newAmount) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://192.168.56.1:3030/shoppingList/updateAmount/${itemId}`, { newAmount }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchShoppingList();  // Wait for fetchShoppingList to complete
    } catch (error) {
      console.error('Miktarı güncelleme hatası:', error);
    }
  };

  const toggleGroupVisibility = (itemName) => {
    setExpandedGroups(prevState => ({
      ...prevState,
      [itemName]: !prevState[itemName]
    }));
  };

  const handleCheckBoxChange = (itemId, isChecked) => {
    setCheckedItems((prevState) => ({
      ...prevState,
      [itemId]: isChecked,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ alignItems: 'center', marginTop: '10%', backgroundColor: colors.bg }}>
          <Loading isLoading={loading} />
        </View>
      ) : (
        <>
          <ScrollView>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 15, marginStart: 10 }}>Alışveriş Listem</Text>
            {Object.keys(groupedItems).map((itemName, index) => (
              <View key={index}>
                {groupedItems[itemName] && groupedItems[itemName].length > 1 ? (
                <View>
                  <Pressable onPress={() => toggleGroupVisibility(itemName)} style={styles.groupHeader}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ingredientNames[itemName] || itemName}</Text>
                    <Ionicons name={expandedGroups[itemName] ? "chevron-up" : "chevron-down"} size={24} color={colors.primary} />
                  </Pressable>
                  {expandedGroups[itemName] && groupedItems[itemName].map((listItem, subIndex) => (
                    <View style={styles.indentedCard} key={subIndex}>
                      <ShopListCard
                        id={listItem._id}
                        recipeNames={recipeNames}
                        itemName={ingredientNames[listItem.itemName] || listItem.itemName}
                        listItem={listItem}
                        amount={listItem.amount}
                        unit={listItem.unit}
                        ingredientNames={ingredientNames}
                        unitNames={unitNames}
                        onDelete={() => handleDeleteItem(listItem._id)}
                        onAmountChange={newAmount => handleAmountChange(listItem._id, newAmount)}
                        
                      />
                    </View>
                  ))}
                </View>
                ) : (
                  groupedItems[itemName] && groupedItems[itemName].map((listItem, subIndex) => (
                    <ShopListCard
                      key={subIndex}
                      id={listItem._id}
                      recipeNames={recipeNames}
                      itemName={listItem.itemName}
                      amount={listItem.amount}
                      unit={listItem.unit}
                      ingredientNames={ingredientNames}
                      unitNames={unitNames}
                      onDelete={() => handleDeleteItem(listItem._id)}
                      onAmountChange={newAmount => handleAmountChange(listItem._id, newAmount)}
                    />
                  ))
                )}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.addIconContainer} onPress={handleAddButton}>
            {addIcon}
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
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
  addIconContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 5,
    margin: 8, 
    backgroundColor: colors.fg, 
    width: 360, 
    height: 40, 
    borderRadius: 15 
  },
  indentedCard: {
    marginLeft: 20, // Add indentation for expanded cards
  },
});
