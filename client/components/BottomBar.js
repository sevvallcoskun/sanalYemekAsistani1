import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import HomePage from "../Pages/HomePage";
import SearchPage from "../Pages/SearchPage";
import IngredientsPage from "../Pages/IngredientsPage"; 
import RecipesPage from "../Pages/RecipesPage";
import ProfilePage from "../Pages/ProfilePage";
import { Entypo, AntDesign, MaterialCommunityIcons, FontAwesome, FontAwesome6 } from '@expo/vector-icons';



const Tab=createBottomTabNavigator();
export default function BottomBar() {
    return(
        <Tab.Navigator
            screenOptions={{ 
                tabBarLabelPosition:'below-icon',
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor:"black"              
            }}
            tabBarOptions ={{
                style: { backgroundColor: colors.fg },
                tabBarShowLabel: false
            }}
        >
            <Tab.Screen name="Home" component={HomePage}  options={{tabBarIcon:() =><Entypo name="home" size={24} />}} />
            <Tab.Screen name="Search" component={SearchPage} options={{tabBarIcon:() =><AntDesign name="search1" size={24} />}}/>
            <Tab.Screen name="Ingredients" component={IngredientsPage} options={{tabBarIcon:() =><FontAwesome6 name="basket-shopping" size={24} />}} />
            <Tab.Screen name="Recipes" component={RecipesPage} options={{tabBarIcon:() =><MaterialCommunityIcons name="notebook" size={24}  />}} />
            <Tab.Screen name="Profile" component={ProfilePage} options={{tabBarIcon:() =><FontAwesome name="user" size={24} />}} />
        </Tab.Navigator>
    )
}
