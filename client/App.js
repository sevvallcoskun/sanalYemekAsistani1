import React from 'react'
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, AntDesign, MaterialCommunityIcons, FontAwesome, FontAwesome6, Feather } from '@expo/vector-icons';
import { colors } from './theme/colors';
import LoginPage from './Pages/LoginPage';
import SignupPage from "./Pages/SignupPage"
import ShoppingListPage from './Pages/ShoppingListPage';
import RecipesPage from './Pages/RecipesPage';
import ProfilePage from './Pages/ProfilePage';
import SearchPage from './Pages/SearchPage';
import SearchResultsPage from './Pages/SearchResultsPage';
import HomePage from './Pages/HomePage';
import ChatBot from "./Pages/ChatBot"
import SurveyPage from './Pages/SurveyPage';
import UserSurveyPage from './Pages/UserSurveyPage';
import AddRecipe1 from './Pages/AddRecipe1';
import AddRecipe2 from './Pages/AddRecipe2';
import AddRecipe3 from './Pages/AddRecipe3';
import AddRecipe4 from './Pages/AddRecipe4';
import StartRecipeSteps from './Pages/StartRecipeSteps';
import Rating from './Pages/Rating';
import Loading from './Pages/Loading';
import MealPlanner from './Pages/MealPlanner';
import RecipeDetailsPage from './Pages/RecipeDetailsPage';
import SurveyDetails from './Pages/SurveyDetails';
import WpCreateRecipe from './Pages/WpCreateRecipe';
import WpMyRecipes from './Pages/WpMyRecipes';
import WpSearchPage from './Pages/WpSearchPage';
import WpSearchResultsPage from './Pages/WpSearchResultsPage';
import AddShoppingList from './Pages/AddShoppingList';
import AddShoppingListRecipes from './Pages/AddShoppingListRecipes';
import AddShoppingListItem from './Pages/AddShoppingListItem';
import CategoryRecipes from './Pages/CategoryRecipes';
import BackButton from './components/BackButton';
import AsyncStorage  from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const[isLoggedIn, setIsLoggedIn]= useState(false);
  async function getData(params) {
    const data= await AsyncStorage.getItem("isLoggedIn");
    console.log(data, 'at app.js')
    setIsLoggedIn(data);
  }
  /* useEffect(()=>{
    getData();
  },[]) */
  return ( 
    <NavigationContainer> 
      <Stack.Navigator 
        initialRouteName='Login' 
        screenOptions={{
          headerShown:false
        }}>
        <Stack.Screen name="Login" component={LoginPage}/>
        <Stack.Screen name="Signup" component={SignupPage}/>
        <Stack.Screen name="Survey" component={SurveyPage}/>
        <Stack.Screen name="UserSurvey" component={UserSurveyPage}/>
        <Stack.Screen name="SurveyDetails" component={SurveyDetails}/>
        <Stack.Screen name="Main" component={BottomTabs}/>
        <Stack.Screen name="AddRecipe1" component={AddRecipe1} options={{headerLeft: () => <BackButton />}}/>
        <Stack.Screen name="AddRecipe2" component={AddRecipe2}/>
        <Stack.Screen name="AddRecipe3" component={AddRecipe3}/> 
        <Stack.Screen name="AddRecipe4" component={AddRecipe4}/>
        <Stack.Screen name="MealPlanner" component={MealPlanner}/>
        <Stack.Screen name="ChatBot" component={ChatBot}/>
        <Stack.Screen name="SearchResultsPage" component={SearchResultsPage}/>
        <Stack.Screen name="RecipeDetails" component={RecipeDetailsPage}/>
        <Stack.Screen name="WpSearchPage" component={WpSearchPage}/>
        <Stack.Screen name="WpSearchResultsPage" component={WpSearchResultsPage}/>
        <Stack.Screen name="WpMyRecipes" component={WpMyRecipes}/>
        <Stack.Screen name="WpCreateRecipe" component={WpCreateRecipe}/>
        <Stack.Screen name="AddShoppingList" component={AddShoppingList}/>
        <Stack.Screen name="AddShoppingListItem" component={AddShoppingListItem}/>
        <Stack.Screen name="AddShoppingListRecipes" component={AddShoppingListRecipes}/>
        <Stack.Screen name="CategoryRecipes" component={CategoryRecipes}/>
        <Stack.Screen name="StartRecipeSteps" component={StartRecipeSteps}/>
        <Stack.Screen name="Rating" component={Rating}/>
        <Stack.Screen name="Loading" component={Loading}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function BottomTabs() {
  return(
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: colors.fg },        
      }}
    >
      <Tab.Screen  
        name="Home" 
        component={HomePage} 
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color= {colors.primary} />
            ) : (
              <Entypo name="home" size={24} color="black" />
            ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchPage} 
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Feather name="search" size={24} color={colors.primary} />
            ) : (
              <Feather name="search" size={24} color="black" />              ),
        }}
      />
      <Tab.Screen 
        name="ShoppingListPage" 
        component={ShoppingListPage} 
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome6 name="basket-shopping" size={24} color= {colors.primary} />
            ) : (
              <FontAwesome6 name="basket-shopping" size={24} color="black" />
            ),
        }}
      />
      <Tab.Screen 
        name="RecipesPage" 
        component={RecipesPage} 
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialCommunityIcons name="notebook" size={24} color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="notebook" size={24} color="black" />
            ),
        }}
      />
      <Tab.Screen 
        name="ProfilePage" 
        component={ProfilePage} 
        options={{
          tabBarShowLabel:false,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome name="user" size={24} color={colors.primary} />
            ) : (
              <FontAwesome name="user" size={24} color="black" />
            ),
        }}
      />
    </Tab.Navigator>
  )
}
