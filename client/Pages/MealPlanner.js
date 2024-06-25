import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Alert, TouchableWithoutFeedback, Pressable } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import SliderBox from '../components/SliderBox';
import moment from 'moment';
import 'moment/locale/tr'; 
import { colors } from "../theme/colors";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';
 
export default function MealPlanner({navigation}) {
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const currentDate = moment();
  const startOfWeek = currentDate.clone().startOf('week');
  const [date, setDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); 

  const trash= <FontAwesome6 name="trash-can" size={20} color="red" />
  const addButton= <Ionicons name="add-circle" size={24} color={colors.primary} />
 
  moment.locale('tr'); 

  const fetchData = async () => {
    await fetchUserId();
    await fetchDailyPlan();
    await fetchRecipes();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    renderRecipesForDay(selectedDate);
  }, [dailyPlan]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );


  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token not found");
        return;
      }
      const res = await axios.post("http://192.168.56.1:3030/userdata", { token: token });
      setUserId(res.data.data._id);
    } catch (error) {
      console.error("Error getting user id:", error.message);
    }
  };

  const fetchRecipes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/recipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); 
      setRecipes(response.data.data);
      const recipeNames = response.data.data.map(recipe => recipe.recipeName);
    } catch (error) {
      console.error('Tarifleri alma hatası:', error);
    }
  };

  const fetchDailyPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/weeklyPlan', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("MYPLAN:", response.data);
      if (response.data) {
        setDailyPlan(response.data[0]?.dailyPlans || []);
        renderRecipesForDay(selectedDate);
      } else {
        console.error('Planlar alınamadı:', response.data);
      }
    } catch (error) {
      console.error('Planları alma hatası:', error);
    }
  };
  
  const renderWeeks = numWeeks => {
    let weeks = [];
    for (let i = 0; i < numWeeks; i++) {
      weeks.push(
        <View key={i}>
          <View style={styles.weekContainer}>
            {renderWeekDates(currentWeekStart.clone().add(i * 7, "days"))}
          </View>
        </View>
      );
    }
    return weeks;
  };
  
  const goToNextWeek = () => {
    setSelectedDate(null);
    setCurrentWeekStart(prev => {
      if (prev) {
        return prev.clone().add(1, 'week');
      } else {
        return moment().startOf('week').add(1, 'week');
      }
    });
    setDate(prev => {
      if (prev) {
        return prev.clone().add(7, 'day');
      } else {
        return moment().startOf('week').add(7, 'day');
      }
    });
  };
  
  const goToPreviousWeek = () => {
    setSelectedDate(null);
    setCurrentWeekStart(prev => {
      if (prev) {
        return prev.clone().subtract(1, 'week');
      } else {
        return moment().startOf('week').subtract(1, 'week');
      }
    });
    setDate(prev => {
      if (prev) {
        return prev.clone().subtract(7, 'day');
      } else { 
        return moment().startOf('week').subtract(7, 'day');
      }
    });
  };

  const handleResetScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
    navigation.navigate('Main'); 
  };
  
  const handleDayPress = (date) => {
    setSelectedDate(date); 
    setModalVisible(true);
  };

  const handleRecipePress = (recipeId, recipeName, recipeImage, category, ingredients, steps, servicesCount, cookingTime, preparationTime) => {
    navigation.navigate( 
      'RecipeDetails', 
      { 
        recipeId: recipeId, 
        recipeName: recipeName,
        recipeImage: recipeImage,
        category: category,
        ingredients: ingredients,
        steps: steps,
        servicesCount: servicesCount,
        cookingTime: cookingTime,
        preparationTime: preparationTime
      });
      console.log("ct",cookingTime);
  };

  const handleDeleteRecipeFromPlan = async (recipeId, selectedDay) => {
    console.log("recipeId:", recipeId);
    console.log("selectedDay:", selectedDay);
    Alert.alert(
        "Tarifi Sil",
        "Bu tarifi haftalık planınızdan kaldırmak istediğinizden emin misiniz?",
        [
            {
                text: "Vazgeç",
                style: "cancel"
            },
            {
                text: "Evet",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('token');
                        await axios.delete(`http://192.168.56.1:3030/weeklyPlan/removeRecipesFromPlan`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            data: {
                                selectedRecipeIds: [recipeId],
                                selectedDay: selectedDay.format("YYYY-MM-DD")
                            }
                        });
                        await fetchDailyPlan();
                        console.log("silindi")
                    } catch (error) {
                        console.error('Tarif silme hatası:', error);
                    }
                },
            }
        ],
    )
};


  const renderRecipesForDay = (selectedDay) => {
    if (!dailyPlan || dailyPlan.length === 0) { 
      return <Text>Günlük plan bulunamadı.</Text>;
    }
  
    const selectedDayRecipes = dailyPlan.find(plan => moment(plan.date).isSame(selectedDay, 'day'));
    if (!selectedDayRecipes || !selectedDayRecipes.recipes || selectedDayRecipes.recipes.length === 0) {
      return <Text>Seçilen gün için tarif bulunamadı.</Text>;
    }

    const recipesInfo = selectedDayRecipes.recipes.map(recipeId => {
      const recipe = recipes.find(recipe => recipe._id === recipeId);
      if (!recipe) {
        return { name: 'Tarif bulunamadı', id: 'Tarif bulunamadı' };
      }
      return { name: recipe.recipeName, id: recipe._id };
    });
  
    recipesInfo.forEach(recipe => {
      console.log(`Tarif Adı: ${recipe.name}, ID: ${recipe.id}`);
    });
  
    return selectedDayRecipes.recipes.map(recipeId => {
      const recipe = recipes.find(recipe => recipe._id === recipeId);
      if (!recipe) {
        return <Text key={recipeId}>Tarif bulunamadı.</Text>;
      }
        return (
        <View key={recipeId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ flexDirection: 'column',}}>
            <SliderBox 
              key={`${recipeId}-slider`} 
              recipeImage= {recipe.recipeImage}   
              showTrashIcon={true}
              onDeletePress={() => handleDeleteRecipeFromPlan(recipeId, selectedDay)}
            /> 
            <Pressable onPress={() => handleRecipePress(
              recipeId,
              recipe.recipeName,
              recipe.recipeImage,
              recipe.category, 
              recipe.ingredients,
              recipe.steps,
              recipe.servicesCount,
              recipe.cookingTime, 
              recipe.preparationTime
            )}>
              <View style={{flexWrap:'wrap'}}>
                <Text style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {recipe.recipeName}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      );
    });
  };
  
  const getRecipeNameById = (recipeId) => {
    const recipe = recipes.find(recipe => recipe._id === recipeId);
    return recipe ? recipe.recipeName : 'Tarif bulunamadı';
  };
  
  const renderWeekDates= startOfWeek => {
    let weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date= startOfWeek.clone().add(i, 'days');
      const isCurrentDate= date.isSame(currentDate, "day");
      weekDates.push(
        <View key={date.format("YYYY-MM-DD")}>          
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={()=>handleDayPress(date)}>
              <Text style={[styles.dayText, isCurrentDate && styles.currentDateText]}>{date.format("dddd")}</Text>
            </TouchableOpacity>
            <TouchableWithoutFeedback style={{alignItems:'center', justifyContent:'center'}} onPress={() => handleDayPress(date)}>
              {addButton}
            </TouchableWithoutFeedback>
          </View>
          <View> 
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled= {true}>
              {renderRecipesForDay(date)}
            </ScrollView>
          </View>
          { i < 6 && <View style={styles.separator} /> }
        </View>
      )
    }
    return weekDates;
  }

  const renderWeekRange = () => {
    const startOfWeek = currentWeekStart.clone().format('DD.MM.YYYY');
    const endOfWeek = currentWeekStart.clone().endOf('week').format('DD.MM.YYYY');
    return `${startOfWeek}-${endOfWeek}`; 
};

const getRecipesForCurrentWeek = () => {
  let recipesForCurrentWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = currentWeekStart.clone().add(i, 'days');
    const dayPlan = dailyPlan.find(plan => moment(plan.date).isSame(date, 'day'));
    const recipeIds = dayPlan ? dayPlan.recipes : [];
    recipesForCurrentWeek.push({ date: date.format("YYYY-MM-DD"), recipes: recipeIds });
  }
  console.log("recipesForCurrentWeek",recipesForCurrentWeek)
  return recipesForCurrentWeek;
};

  const handleAddShoppingListForCurrentWeek = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token bulunamadı");
        return;
      }
  
      const recipesForCurrentWeek = getRecipesForCurrentWeek();
      const selectedRecipeIds = recipesForCurrentWeek.flatMap(day => day.recipes);

      for (const selectedDayRecipes of recipesForCurrentWeek) {
        for (const recipeId of selectedDayRecipes.recipes) {
          const response = await axios.get(`http://192.168.56.1:3030/recipeIngredients`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              recipeIds: selectedRecipeIds,
            }
          });
          console.log("recid", recipeId)
          navigation.navigate('AddShoppingListRecipes', { recipeId: selectedRecipeIds, token: token });
        }
      }
    } catch (error) {
      console.error('Alışveriş listesine ekleme hatası:', error);
    }
};

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
          <View style={{alignItems:'center',marginTop:'90%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
        ) : (
      <ScrollView>
        <View style={{ marginRight: 10 }}>
          <BackButton onPress={handleResetScreen} />
        </View>
        <Text style={{fontSize:26, fontWeight:'bold', marginTop:15, marginStart:10}}>Takvim</Text>
        <View style= {styles.weekRange}>
          <TouchableOpacity onPress={goToPreviousWeek}>
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={{fontSize:20, fontWeight:'500'}}>{renderWeekRange()}</Text>
          <TouchableOpacity onPress={goToNextWeek}>
            <Ionicons name="chevron-forward" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          {renderWeeks(1)} 
        </View>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleAddShoppingListForCurrentWeek}>
          <Text style={{color: "white"}}>Alışveriş listesine ekle</Text>
        </TouchableOpacity>
      </ScrollView>
      
    )}
      <Modal 
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => navigation.navigate('WpSearchPage', { selectedDate: selectedDate.format("YYYY-MM-DD") })}>
            <View style={styles.modalButton}>
              <Ionicons name="search-circle" size={30} color={colors.primary} />
              <Text style={styles.modalText}>Tarif ara</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity onPress={() => navigation.navigate('WpMyRecipes', { selectedDate: selectedDate.format("YYYY-MM-DD") })}>
            <View style={styles.modalButton}>
              <MaterialCommunityIcons name="notebook" size={26} color={colors.primary} />
              <Text style={styles.modalText}>Tariflerim</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Kapat</Text>
          </TouchableOpacity>
        </View>
        </View>
      </Modal>
    </SafeAreaView>
  ) 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  weekRange: {
    flexDirection:'row',
    justifyContent: 'space-between',
    fontSize:20,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weekContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateText: {
    fontSize: 18,
  },
  dayText: {
    fontSize: 24,
    color: colors.textSecondary,
    flexDirection:'column'
  },
  currentDateText: {
    color: colors.primary,
  },
  separator: {
    marginTop: 5,
    borderBottomWidth: 0.4,
    borderColor: 'gray',
    marginHorizontal: 10,
  },
  saveButton: {
    alignSelf:"center",
    alignItems:"center",
    justifyContent:'center',
    width:"75%",
    height:40,
    marginBottom:10, 
    marginTop:5,
    borderRadius:20,
    borderWidth: 1,
    borderColor:colors.primary,
    backgroundColor:colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent:'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom:0
  },
  modalButton: {
    flexDirection:'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    alignItems:'center'
  },
  modalText:{
    paddingHorizontal:5,
    fontSize:16,
  },
}); 