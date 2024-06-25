import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Image, Pressable,} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

export default function SearchPage({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/category', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoading(false);
  };

  const handleCategoryPress = (categoryId, categoryName) => {
    navigation.navigate('CategoryRecipes', { categoryId, categoryName });
  };

  const handleTextInputFocus = () => {
    navigation.navigate('SearchResultsPage', { searchQuery: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ alignItems: 'center', marginTop: '90%', backgroundColor: colors.bg }}>
          <Loading isLoading={loading} />
        </View>
      ) : (
        <>
          <View style={styles.searchBar}>
            <AntDesign name="search1" size={24} color={colors.primary} />
            <TextInput
              placeholder=" Ara.."
              placeholderTextColor={colors.primary}
              style={{ flex: 1 }}
              onFocus={handleTextInputFocus}
            />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '300', paddingStart: 10, marginStart: 10 }}>
            Kategoriler
          </Text>
          <ScrollView>
            {categories.map(
              (category, index) =>
                index % 2 === 0 && (
                  <View key={category._id} style={styles.categoryRow}>
                    <View style={styles.categoryItem}>
                      <Pressable onPress={() => handleCategoryPress(category._id, category.name)}>
                        <Image
                          source={
                            category.categoryImage
                              ? { uri: category.categoryImage }
                              : require('../assets/gray.png')
                          }
                          style={styles.categoryImage}
                        />
                        <Text>{category.name}</Text>
                      </Pressable>
                    </View>
                    {categories[index + 1] && (
                      <View style={styles.categoryItem}>
                        <Pressable
                          onPress={() =>
                            handleCategoryPress(
                              categories[index + 1]._id,
                              categories[index + 1].name
                            )
                          }
                        >
                          <Image
                            source={
                              categories[index + 1].categoryImage
                                ? { uri: categories[index + 1].categoryImage }
                                : require('../assets/gray.png')
                            }
                            style={styles.categoryImage}
                          />
                          <Text>{categories[index + 1].name}</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )
            )}
          </ScrollView>
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
    backgroundColor: colors.bg,
  },
  searchBar: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    marginTop: '10%',
    marginBottom: '5%',
    padding: 10,
    borderColor: colors.fg,
    backgroundColor: colors.fg,
    borderRadius: 10,
  },
  categoryImage: {
    width: 175,
    height: 140,
    borderRadius: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
  },
});
