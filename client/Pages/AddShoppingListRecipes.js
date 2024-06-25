import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import Loading from './Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkIconEmpty = <Feather name="circle" size={24} color={colors.primary} />;
const checkIcon = <Feather name="check-circle" size={24} color={colors.primary} />;

const IngredientCard = ({ ingredient, isAddedToList, toggleCheck }) => (
  <View style={styles.card}>
    <Text style={styles.ingredientText}>
      {`${ingredient.amount} ${ingredient.unitName} ${ingredient.ingredientName}`}
    </Text>
    <TouchableOpacity
      style={{ justifyContent: 'flex-end', marginHorizontal: 10 }}
      onPress={toggleCheck}
    >
      {isAddedToList ? checkIcon : checkIconEmpty}
    </TouchableOpacity>
  </View>
);

export default function AddShoppingListRecipes({ route, navigation }) {
  const { recipeId, token } = route.params;
  const [userId, setUserId] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recIngredients, setRecIngredients] = useState([]);
  const [isAddedToList, setIsAddedToList] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultUncheckedIngredientIds = [
    '65e5a1ed032167d820a659e5',
    '65fea2f419f5e858af5ef301',
    '65fec29913bdd6ef5316e475',
    '65fed4c313bdd6ef5316e47c',
    '660032d27aadb3e632d2855e',
    '660032ba7aadb3e632d2855d',
    '65e5a1ed032167d820a659e7',
    '65fea2d219f5e858af5ef2ff',
    '65fea2df19f5e858af5ef300',
    '65fed48413bdd6ef5316e479',
  ];

  useEffect(() => {
    if (Array.isArray(recipeId)) { 
      fetchData();
    } else {
      console.error('recipeIds bir dizi değil');
      setLoading(false);
    }
  }, [recipeId]);

  const fetchData = async () => {
    try {
      const recipePromises = recipeId.map(recipeId => axios.get('http://192.168.56.1:3030/recipeIngredients', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          recipeId: recipeId
        }
      }));
      const responses = await Promise.all(recipePromises);
      const recipesData = responses.map(response => response.data?.data);
      const allIngredientsData = recipesData.flatMap(recipeData => recipeData);
      
      if (allIngredientsData.length > 0) {
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
        
        const mappedIngredients = allIngredientsData.map(ingredient => {
          const foundIngredient = ingredientsData[ingredient.ingredientId];
          const foundUnit = unitsData[ingredient.unitId];
          return {
            ...ingredient,
            ingredientName: foundIngredient ? foundIngredient.name : '',
            unitName: foundUnit ? foundUnit.name : '',
            amount: ingredient.amount || 0
          };
        });

        // Initialize isAddedToList based on defaultUnselectedIngredientIds
        const initialIsAddedToList = mappedIngredients.map(ingredient =>
          !defaultUncheckedIngredientIds.includes(ingredient.ingredientId)
        );
        
        setRecIngredients(mappedIngredients);
        setIsAddedToList(initialIsAddedToList);
        setLoading(false); 
      } else {
        console.error('Veri alınamadı veya uygun formatta değil');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Veri alma hatası:', error.response || error);
      if (error.response) {
        console.error('Sunucu yanıtı:', error.response.data);
      }
      setLoading(false);
    }
  };

  const groupIngredientsByNameAndUnit = (ingredients) => {
    const groupedIngredients = {};
    ingredients.forEach((ingredient) => {
      const key = `${ingredient.ingredientName}-${ingredient.unitName}`;
      if (!groupedIngredients[key]) {
        groupedIngredients[key] = { ...ingredient, amount: ingredient.amount };
      } else {
        groupedIngredients[key].amount += ingredient.amount;
      }
    });
    return groupedIngredients;
  };

  const toggleCheck = (index) => {
    setIsAddedToList(prev => {
      const updatedList = [...prev];
      updatedList[index] = !updatedList[index];
      return updatedList;
    });
  };

  const handleResetScreen = () => {
    navigation.navigate('ShoppingListPage');
  };

  const handleAddShoppingList = async () => {
    setLoading(true); // Loading bileşenini aktifleştir
    
    try {
      const selectedItems = recIngredients
        .filter((ingredient, index) => isAddedToList[index])
        .map(ingredient => ({
          itemName: ingredient.ingredientId,
          amount: ingredient.amount,
          unit: ingredient.unitId,
          userId: userId,
          recipeId: recipeId
        }));
  
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token bulunamadı");
        setLoading(false); // Hata durumunda veya işlem tamamlanınca Loading bileşenini devre dışı bırak
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
    } finally {
      setLoading(false); // İşlem tamamlandığında Loading bileşenini devre dışı bırak
    }
  };

  const renderIngredients = () => {
    const groupedIngredients = groupIngredientsByNameAndUnit(recIngredients);
    const ingredientKeys = Object.keys(groupedIngredients);

    // Combine all ingredients
    const allIngredients = ingredientKeys.map(key => groupedIngredients[key]);

    // Sort all ingredients alphabetically by ingredient name
    const sortedIngredients = allIngredients.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

    // Separate checked and unchecked ingredients
    const checkedIngredients = [];
    const uncheckedIngredients = [];

    sortedIngredients.forEach((ingredient) => {
      const ingredientIndex = recIngredients.findIndex(i => i.ingredientName === ingredient.ingredientName && i.unitName === ingredient.unitName);
      if (isAddedToList[ingredientIndex]) {
        checkedIngredients.push({ ingredient, ingredientIndex });
      } else {
        uncheckedIngredients.push({ ingredient, ingredientIndex });
      }
    });

    // Combine checked and unchecked ingredients with checked first
    const combinedIngredients = [...checkedIngredients, ...uncheckedIngredients];

    // Render combined ingredients
    return combinedIngredients.map(({ ingredient, ingredientIndex }, index) => (
      <IngredientCard
        key={index}
        ingredient={ingredient}
        isAddedToList={isAddedToList[ingredientIndex]}
        toggleCheck={() => toggleCheck(ingredientIndex)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading isLoading={loading} />
      ) : (
        <>
          <ScrollView style={styles.scrollContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Alışveriş Listesine Ekle</Text>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
              {renderIngredients()}
            </View>
            <View style={styles.container}>
              <TouchableOpacity style={styles.button} onPress={() => handleAddShoppingList()}>
                <Text style={{ color: 'white' }}>Alışveriş listesine ekle</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginTop: '5%',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    width: '90%',
    height: 40,
    backgroundColor: colors.fg,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    marginHorizontal: 10,
    alignItems: 'flex-start'
  },
  textView: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  ingredientText: {
    marginHorizontal: 10
  },
  button: {
    width: "94%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    marginVertical: 10
  },
});
