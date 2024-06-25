import { View, Text, StyleSheet, ScrollView, Pressable, Image, TouchableOpacity, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign } from '@expo/vector-icons';
import RoundedBox from '../components/RoundedBox';
import BackButton from '../components/BackButton';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'; 
import 'moment/locale/tr';
import Loading from './Loading';

const unFavorite=<MaterialIcons name="favorite-border" size={30} color="red" />
const favorite=<MaterialIcons name="favorite" size={30} color="red" />
const star= <FontAwesome name="star" size={24} color="#fcba03" />
const minus=<AntDesign name="minus" size={20} color="black" />
const plus=<AntDesign name="plus" size={20} color="black" />
const Tab = createMaterialTopTabNavigator();
const chefIcon=<MaterialCommunityIcons name="chef-hat" size={26} color={colors.primary} />

function RecipeSteps({navigation, route, recipeId, cookingTime }) {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSteps();
    }, []);

    const fetchSteps = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://192.168.56.1:3030/instruction?recipeId=${recipeId}`);
            setSteps(response.data.data);
            setLoading(false);
            const stepsData = response.data.data;
            console.log("Adımlar:", stepsData);
        } catch (error) {
            setLoading(false);
            console.error('Adımları alma hatası:', error);
        }
    };
    
    if (loading) {
        return <Loading isLoading={loading} />;
    }
    
    return (
        <View style={styles.tabStyle}>
            <ScrollView>
                {steps.map((step, index) => (
                    <View key={index}>
                        <View style={{ flexDirection:'row'}}>
                            <Text style={styles.stepTitle}>Adım {index + 1}</Text>
                        </View>
                        <Text multiline={true}>{step.description}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>  
                <TouchableOpacity 
                    style={{ 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: 40, 
                        width: '90%', 
                        borderRadius: 20, 
                        backgroundColor: colors.secondary, 
                        marginBottom: 10 
                    }} 
                    onPress={() => navigation.navigate('StartRecipeSteps', { recipeId: recipeId, cookingTime: cookingTime })}
                >
                    <Text style={{ color: "white" }}>Tarife Başla</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

function RecipeIngredients({navigation, route, servicesCount, recipeId}) {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null); 
    const currentDate= moment();
    const startOfWeek = currentDate.clone().startOf('week');
    const [count, setCount] = useState(servicesCount);
    const [recIngredients, setRecIngredients] = useState([]);
    const [unitName, setUnitName] = useState('');
    const [ingredientName, setIngredientName] = useState('');

    moment.locale('tr');

    useEffect(() => {
        fetchData();
    }, [recipeId]);

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
    
    const weeklyCalendar = startOfWeek => { 
        let weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = startOfWeek.clone().add(i, 'days');
            const isCurrentDate = date.isSame(currentDate, "day");
            weekDates.push(
                <View key={i}>
                    <View style={[styles.roundButton, selectedDay === i ? { backgroundColor: colors.secondary } : null]}>
                        <TouchableOpacity style={styles.roundButton} onPress={() => setSelectedDay(i)}>
                            <Text style={[styles.dayText, selectedDay=== i ? {color:'white'}: null]}>{date.format("dd")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
        return weekDates;
    };
    

    const renderWeeks= numWeeks => {
        let weeks= [];
        for (let i=0; i<numWeeks; i++) {
            weeks.push(
            <View key={i}>
                <View style={styles.dayContainer}>
                {weeklyCalendar(startOfWeek.clone().add(i*7, "days"))}
                </View>
            </View>
            )
        }
        return weeks;
    };

    const decreasePortion = () => {
        if (count > 1) {
            setCount(count-1);
            updateIngredientAmounts(count-1);
        }
    };

    const increasePortion = () => {
        setCount(count+1);
        updateIngredientAmounts(count+1);
    }; 

    const updateIngredientAmounts = (newCount) => {
        const updatedIngredients = recIngredients.map((ingredient) => {
            const updatedAmount = (ingredient.amount * newCount) / count;
            return { ...ingredient, amount: updatedAmount };
        });
        setRecIngredients(updatedIngredients);
        console.log("updated", updatedIngredients);
    };

    const handleAddPlanPress= () => {
        setModalVisible(true);  
    };

    const handleAddDayPress = async () => {
        if (selectedDay !== null) {
            try {
                const token = await AsyncStorage.getItem('token');
                console.log("Token:", token);
                const selectedDate = moment().startOf('week').add(selectedDay, 'days').format('YYYY-MM-DD');
                console.log(selectedDate)
                console.log(recipeId)
                const response = await axios.post('http://192.168.56.1:3030/weeklyPlan/addRecipeToPlan', {
                    date: selectedDate,
                    selectedRecipeIds: [recipeId]
                }, {
                    headers: {
                      Authorization: `Bearer ${token}`
                    } 
                });
                console.log("Tarif haftalık plana eklendi:", response.data);
                setModalVisible(false);
            } catch (error) {
                console.error('Haftalık plana tarif eklenirken bir hata oluştu:', error.response || error);
                if (error.response) {
                    console.error('Sunucu yanıtı:', error.response.data);
                }
            }
        } else {
            console.log("Bir gün seçiniz.");
        }
    };

    if (loading) {
        return <Loading isLoading={loading} />;
      }    

    return (
        <View style={styles.tabStyle}>
            <ScrollView>
                <View style={{ flexDirection: "row", marginVertical: 5 }}>
                    <Pressable onPress={decreasePortion}>{minus}</Pressable>
                    <Text style={{ marginHorizontal: 5, fontSize: 16 }}>{count} porsiyon</Text>
                    <Pressable onPress={increasePortion}>{plus}</Pressable>
                </View> 
                <View style={{ marginHorizontal: 10 }}>
                    {recIngredients.map(ingredient => (
                        <View key={ingredient._id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                            <Image source={require('../assets/healthy-food.png')} style={styles.stepImage} />
                            <Text style={{ marginHorizontal: 5, fontSize: 16 }}>{`${ingredient.amount.toFixed(2)} ${ingredient.unitName} ${ingredient.ingredientName}`}</Text>
                        </View>
                    ))}
                </View> 
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
                <TouchableOpacity
                    style={{ flex: 1, ...styles.button }}
                    onPress={() => navigation.navigate('AddShoppingList', { token: token, recipeId: recipeId })}
                >
                    <Text style={{ color: "white" }}>Alışveriş Listesine Ekle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, height: 40, width: '60%', ...styles.button }} onPress={() => handleAddPlanPress()}>
                    <Text style={{ color: "white" }}>Plana Ekle</Text>
                </TouchableOpacity>
            </View>
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
                        <View>
                            <Text style={{ fontWeight: '500', fontSize: 15 }}>Bu tarifi hangi güne eklemek istersin ?</Text>
                            {renderWeeks(1)}
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => handleAddDayPress()} style={{ flex: 1, width: '90%' }}>
                                <Text>Haftalık plana ekle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text>Kapat</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default function RecipeDetailsPage({navigation, route}) {
    const [recipes, setRecipes] = useState([]);
    const [userId, setUserId] = useState("");
    const [categories, setCategories] = useState([]); 
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true); // Başlangıçta sayfa yüklenirken loading durumunu true olarak ayarlayın
    const [averageRating, setAverageRating] = useState(null);
    const { recipeId, recipeName, recipeImage, category, recipeIngredients, unitId, amount, description, servicesCount, cookingTime, preparationTime } = route.params;
   
    console.log("rec im", recipeImage);
    
    useEffect(() => {
        const getUserId = async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            console.log("Token:", token);
            if (!token) {
              console.log("Token not found");
              return;
            }
            const res = await axios.post("http://192.168.56.1:3030/userdata", { token: token });
            setUserId(res.data.data._id);
            console.log("userId",res.data.data._id);
          } catch (error) {
            console.error("Error getting user id:", error.message);
          }
        };
        getUserId();
      }, []);

      useEffect(() => {
        setLoading(true);
        Promise.all([fetchCategories(), fetchRecipes(), fetchAverageRating()])
          .then(() => setLoading(false))
          .catch(() => setLoading(false));
      }, []);

    useEffect(() => {
        checkFavoriteStatus();
    }, [recipeId, userId]); 

    const checkFavoriteStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://192.168.56.1:3030/userFavorites/favoriteRecipes', {
                params: {
                    userId: userId,
                    recipeId: recipeId
                }, 
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }); 
            const favoriteRecipes = response.data.favoriteRecipes.flat();
            const isFavorited = favoriteRecipes.some(recipe => recipe._id === recipeId);

            if (isFavorited) {
                setIsFavorite(true);

            } else {
                setIsFavorite(false);
            }

        } catch (error) {
            console.error('Favori durumu kontrol edilirken bir hata oluştu:', error.response || error);
            if (error.response) {
                console.error('Sunucu yanıtı:', error.response.data);
            }
        }
    };

    const fetchAverageRating = async () => {
        try {
            const response = await axios.get(`http://192.168.56.1:3030/recipes/${recipeId}/average-rating`);
            setAverageRating(response.data.data.averageRating);
        } catch (error) {
            // Hata durumunda averageRating'i null olarak ayarlayabilirsiniz
            setAverageRating(null);        
        }  
    }; 

    const handleResetScreen = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RecipesPage' }],
        });
    };

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://192.168.56.1:3030/recipes');
            setRecipes(response.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Tarifi alma hatası:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response= await axios.get('http://192.168.56.1:3030/category');
            setCategories(response.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Kategoriyi alma hatası: ', error);
        }
    }

    const toggleFavorite = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!isFavorite) {
                const response = await axios.post('http://192.168.56.1:3030/userFavorites/addFavorite', {
                    recipeId: recipeId
                }, { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    } 
                });
                console.log("addFavori tarifler güncellendi:", response.data);
                setIsFavorite(true); 
                handleResetScreen(); 

            } else {
                console.log("remove")
                const response = await axios.delete('http://192.168.56.1:3030/userFavorites/removeFavorite', {
                    data: {
                        userId: userId,
                        recipeId: recipeId
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("removeFavori tarifler güncellendi:", response.data);
                setIsFavorite(false); 

            }
        } catch (error) {
            console.error('Favori işlemi sırasında bir hata oluştu:', error.response || error);
            if (error.response) {
                console.error('Sunucu yanıtı:', error.response.data);
            }
        }
    };
    

  return (
    <View style= {styles.container}>
        {/* {loading && <Loading isLoading={loading} />}  */}
        <View style={{ marginTop: '3%', flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', marginTop:'10%' }}>
                <View style={{ marginRight: 10 }}>
                    <BackButton /> 
                </View>
                <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
                    {isFavorite ? favorite : unFavorite}
                </Pressable>
            </View>
        </View>
        <Image source={recipeImage ? { uri: recipeImage } : require('../assets/addPhoto.png')} style={styles.imageContainer} />
        <View style= {{flexDirection:'row',  alignItems:'center'}} >  
            <Text style={{ fontSize: 30, fontWeight: 500,  }}>{recipeName}</Text>
        </View> 
        <Text>{category}</Text>
        <Text>Pişirme süresi: {cookingTime} dk, Hazırlama süresi: {preparationTime} dk</Text>
        <View style={{flexDirection:'row'}}>
            {star}
            <Text style={{fontSize:16, fontWeight:'500'}}>{averageRating !== null ? averageRating.toFixed(1) : "Henüz puan verilmemiş"}</Text>
        </View>

        <View style={{ flex: 1, width: '100%' }}>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: colors.primary,
                    tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
                    tabBarStyle: { backgroundColor: colors.bg, marginTop: 25, },
                    tabBarIndicatorStyle: { backgroundColor: colors.primary },
                }}
            >
                <Tab.Screen name="Malzemeler">
                    {() => <RecipeIngredients navigation={navigation} recipeId={recipeId} recipeIngredients={recipeIngredients} servicesCount= {servicesCount} />}
                </Tab.Screen>
                <Tab.Screen name="Adımlar">
                    {() => <RecipeSteps navigation={navigation} recipeId={recipeId } cookingTime= {cookingTime} />}
                </Tab.Screen>
            </Tab.Navigator>
        </View>
    </View>
  )
}

const styles=StyleSheet.create({
    container:{
      flex:1,
      width:'100%',
      height:'100%',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: colors.bg
    },
    favoriteButton: {
        alignItems:'center',
        justifyContent:'center',
        height:50,
        width:50,
        position: 'absolute',
        backgroundColor: colors.fg,
        borderRadius: 25,
        top: '0%',
        right: '0%',
        zIndex: 1,
    },
    imageContainer:{
        width:"80%",
        height:"40%",
        marginTop: "5%",
        borderRadius:10
    },
    tabStyle: {
        width:'100%',
        height:'100%',
        alignItems:'flex-start',
        justifyContent:'center',
        backgroundColor: colors.bg,
        paddingHorizontal:10
    },
    stepTitle: {
        fontSize:20,
        fontWeight:'400',
        alignItems:'flex-start',
    },
    textContainer: {
        marginHorizontal:20
    },
    stepImage: {
        width:20,
        height:20,
    },
    button:{
        justifyContent: 'center', 
        alignItems: 'center', 
        marginHorizontal:10,
        height: 40, 
        width: '90%', 
        borderRadius: 20, 
        backgroundColor: colors.secondary, 
        marginBottom: 10 
    },
    modalContainer: { 
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    dayContainer: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:5,
        marginHorizontal:5,
        paddingHorizontal:0
    },
    roundButton: {
        width: 30,
        height: 30,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
})