import express from "express";
import mongoose from  'mongoose';
import cors  from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';
import multer from 'multer';
import * as fs from 'fs';
import url from 'url';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import moment from 'moment';
import './users.js';
import './recipes.js'
import './survey.js'
import './recipeIngredients.js'
import './ingredient.js'
import './unit.js'
import './instruction.js'
import './category.js' 
import './weeklyPlan.js' 
import './shoppingList.js'
import './rating.js'
import './userFavorites.js'
import './allergies.js'
import './diets.js'

const app = express();
const mongoUrl="mongodb+srv://admin:3UBuMpoZbPY1srja@cluster0.mc0jkkr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET="8z23Uc9$15fE!ZaS0&bYqP*w"

// const AWS = require('aws-sdk');
// AWS S3 konfigürasyonu
const s3 = new AWS.S3({
    accessKeyId: 'AKIAXYKJSINVORGPPSW6',
    secretAccessKey: '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',
    region: 'eu-north-1',
  });
// Multer yapılandırması 
const upload = multer({dest:'uploads/'});

mongoose.connect(mongoUrl)
    .then(()=> console.log('MongoDB connected'))
    .catch((err)=>console.error(err));// Görsel yükleme endpoint'i

app.use(cors());
app.use(express.json());

mongoose.connect(mongoUrl)
    .then(()=> console.log('MongoDB connected'))
    .catch((err)=>console.error(err));

const User= mongoose.model("users");
const Survey= mongoose.model("survey");
// const SurveyQuestions= mongoose.model("surveyQuestions");
const Recipe= mongoose.model("recipes");
const RecipeIngredient= mongoose.model("recipeIngredients");
const Ingredient= mongoose.model("ingredient");
const Unit= mongoose.model("unit");
const Instruction= mongoose.model("instruction");
const Category= mongoose.model("category");
const WeeklyPlan= mongoose.model("weeklyPlan");
const ShoppingList= mongoose.model("shoppingList");
const Rating= mongoose.model("rating");
const UserFavorites= mongoose.model("userFavorites");
const Allergies= mongoose.model("allergies");
const Diets= mongoose.model("diets");

app.post('/upload', upload.single('image'), (req, res) => {
    const { file } = req;

    const params = {
        Bucket: 'sanalyemekasistani1',
        Key: file.originalname,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype
    };
    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        console.log("recipeImage");

        return res.json({ imageUrl: data.Location });
    });
});
 
app.get("/", async(req, res)=> {
    console.log("conn")
    res.send({status:"connected"})
});
  
app.post("/register", async(req, res)=> {
    const{ name, surname, email, password}=req.body;
    const oldUser=await User.findOne({email:email});
    if (oldUser) {
        return res.send({data:"This user is already exist"})
    }
    const encryptedPassword= await bcrypt.hash(password,10);
    try{ 
        await User.create(
            {
                name:name,
                surname:surname,
                email:email,
                password:encryptedPassword
            }
        );
        const user = await User.findOne({ email });
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
        const userId = user._id;
        console.log("user",userId)
        res.send({status:"ok", data:token, userId});
    } catch(err){
        res.send({status:"error", data: err});
    }
});
 
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);        
        return res.send({ status: "ok", data: token });
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
});

app.post("/logout", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    invalidTokens.push(token);
    
    res.send({ status: "ok", message: "Logout successful" });
}); 

app.post("/userdata", async (req, res) => {
    const {token}=req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email;
        User.findOne({ email: useremail })
            .then((data) => {
                return res.send({ status:"ok", data: data });
            });
    } catch(error) {
        return res.send({error:error})
    }
});

app.post("/survey", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) { 
        return res.status(401).send({ error: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        // Kullanıcıyı bul ve kontrol et
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // İstek gövdesinden gelen cevapları al
        const { diets, allergies, dislikedIngredients, favoriteCategories } = req.body;
        
        // Veri doğrulaması yap
        if (!diets || !allergies || !dislikedIngredients || !favoriteCategories) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const survey = await Survey.create({
            user: userId, // Kullanıcının _id değerini kullan
            diets,
            allergies,
            dislikedIngredients,
            favoriteCategories
        });

        res.status(201).json({ status: "success", data: survey });
    } catch (error) {
        console.error("Error saving survey:", error);
        res.status(500).json({ status: "error", message: "Failed to save survey" });
    }
});

app.get('/survey/:userId', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = req.params.userId;

        if (decodedToken.userId !== userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const survey = await Survey.findOne({ user: userId });

        if (!survey) {
            return res.status(404).send({ error: "Survey not found" });
        }

        res.status(200).json({ status: "success", data: survey });
    } catch (error) {
        console.error("Error retrieving survey:", error);
        res.status(500).json({ status: "error", message: "Failed to retrieve survey" });
    }
});

app.put('/survey/:userId', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = req.params.userId;

        if (decodedToken.userId !== userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const { diets, allergies, dislikedIngredients, favoriteCategories } = req.body;

        if (!diets || !allergies || !dislikedIngredients || !favoriteCategories) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const survey = await Survey.findOneAndUpdate(
            { user: userId },
            { diets, allergies, dislikedIngredients, favoriteCategories },
            { new: true, runValidators: true }
        );

        if (!survey) {
            return res.status(404).send({ error: "Survey not found" });
        }

        res.status(200).json({ status: "success", data: survey });
    } catch (error) {
        console.error("Error updating survey:", error);
        res.status(500).json({ status: "error", message: "Failed to update survey" });
    }
});

app.post("/addRecipe", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { recipeName, recipeImage, categories, ingredients, instructionSteps, servicesCount, cookingTime, preparationTime, isShared } = req.body;
    const selectedCategories = req.body.selectedCategories;

    if (!token) { 
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        
        const newRecipe = new Recipe({
            recipeName,
            recipeImage: recipeImage,
            servicesCount,
            cookingTime,
            preparationTime,
            instructionSteps,
            categories: selectedCategories,
            ingredients,
            userId,
            isShared
        });
        await newRecipe.save();

        console.log("Kategoriler:", selectedCategories);
        console.log('Yeni Tarif ID:', newRecipe._id);

        const recipeId = newRecipe._id;
        console.log('recipe', recipeId);
        for (const ingredient of ingredients) {
            const { ingredientId, unitId, amount } = ingredient;
            const recipeIngredient = new RecipeIngredient({
              recipeId: recipeId,
              ingredientId,
              unitId,
              amount
            });
            await recipeIngredient.save();
        };
        for (let step of instructionSteps) {
            await Instruction.create({
                recipeId: recipeId,
                description: step,
            });
        }
        res.send({ status: "ok", message: "Tarif başarıyla kaydedildi", recipeId: newRecipe._id });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.post("/recipes/:recipeId/rate", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { rating, userId } = req.body; 
    const { recipeId } = req.params;    
    if (!token) { 
      return res.status(401).send({ error: "Unauthorized" });
    }
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const tokenUserId = decodedToken.userId; // rename to avoid conflict
      if (tokenUserId !== userId) {
        return res.status(401).send({ error: "Unauthorized" });
      }
      const newRating = new Rating({
        recipeId,
        userId,
        rating
      });
      const savedRating = await newRating.save();
      res.status(201).send({ status: "ok", message: "Tarife puan başarıyla eklendi", data: savedRating });
    } catch (error) {
      console.error("Rating işlemi sırasında bir hata oluştu:", error);
      res.status(500).send({ error: "Rating işlemi sırasında bir hata oluştu" });
    }
});

app.get("/recipes/:recipeId/rating/:userId", async (req, res) => {
    try {
      const { recipeId, userId } = req.params;
      const rating = await Rating.findOne({ recipeId, userId });
      if (rating) {
        res.status(200).json({ status: "ok", data: rating });
      } else {
        res.status(404).json({ status: "error", message: "Rating not found" });
      }
    } catch (error) {
      console.error("Error retrieving rating:", error);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.get("/highest-rated-recipe", async (req, res) => {
    try {
        const startOfWeek = moment().startOf('week').toDate();
        const endOfWeek = moment().endOf('week').toDate();
        // Find ratings within the current week
        const ratings = await Rating.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek }
                }
            },
            {
                $group: {
                    _id: "$recipeId",
                    averageRating: { $avg: "$rating" }
                }
            },
            {
                $sort: { averageRating: -1 }
            },
            {
                $limit: 6 // Limit the number of results to 6
            }
        ]);

        if (!ratings.length) {
            return res.status(404).json({ status: "ok", message: "No ratings found for this week" });
        }

        const recipeIds = ratings.map(rating => rating._id);
        const recipes = await Recipe.find({ _id: { $in: recipeIds } });

        res.status(200).json({ status: "ok", data: recipes });
    } catch (error) {
        console.error("Error retrieving highest rated recipes:", error.message);
        console.error(error.stack);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.put("/recipes/:recipeId/rating/:ratingId", async (req, res) => {
const { recipeId, ratingId } = req.params;
const { rating, userId } = req.body;

try {
    // Belirli bir tarif ve kullanıcı için mevcut bir puanı bul
    let existingRating = await Rating.findOne({ _id: ratingId, recipeId, userId });

    if (existingRating) {
    // Eğer puan bulunduysa, mevcut puanı güncelle
    existingRating.rating = rating;
    await existingRating.save();
    res.status(200).json({ status: "ok", message: "Rating updated successfully" });
    } else {
    // Eğer puan bulunamadıysa, uygun bir hata mesajı döndür
    res.status(404).json({ status: "error", message: "Rating not found" });
    }
} catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
}
});
  
app.get("/recipes/:recipeId/average-rating", async (req, res) => {
    const { recipeId } = req.params;
  
    try {
      const ratings = await Rating.find({ recipeId });
      if (ratings.length > 0) {
        const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
        const averageRating = totalRating / ratings.length;
        res.status(200).json({ status: "ok", data: { averageRating } });
      } else {
        res.status(404).json({ status: "error", message: "No ratings found for this recipe" });
      }
    } catch (error) {
      console.error("Error calculating average rating:", error);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
  
app.post("/ingredient", async (req, res) => {
    let ingredient = new Ingredient(req.body);
    try {
        ingredient = await ingredient.save();
        res.status(201).send({ status: "created", id: ingredient._id })
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post('/userFavorites/addFavorite', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { recipeId } = req.body;
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const userFavorite = await UserFavorites.findOne({ userId });
        if (!userFavorite) {
            const newUserFavorite = new UserFavorites({
                userId: userId,
                favoriRecipes: [{ recipes: recipeId }]
            });
            await newUserFavorite.save();
        } else {
            userFavorite.favoriRecipes.push({ recipes: recipeId });
            await userFavorite.save();
        }
        res.status(201).json({ message: 'Favori tarif başarıyla eklendi' });
    } catch (error) {
        console.error('Favori tarif ekleme hatası:', error);
        res.status(500).json({ error: 'Favori tarif ekleme hatası' });
    }
});

app.post("/weeklyPlan/addRecipeToPlan", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { date, selectedRecipeIds } = req.body;
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const weeklyPlan = await WeeklyPlan.findOne({ userId});
        if (!weeklyPlan) {
            const newWeeklyPlan = new WeeklyPlan({
                userId,
                dailyPlans: [{ date: new Date(date), recipes: selectedRecipeIds }]
            });      
            await newWeeklyPlan.save();
        }else {
            const dailyPlanIndex = weeklyPlan.dailyPlans.findIndex(plan => plan.date.toDateString() === new Date(date).toDateString());
            if (dailyPlanIndex === -1) {
                weeklyPlan.dailyPlans.push({ date: new Date(date), recipes: selectedRecipeIds });
            } else {
                weeklyPlan.dailyPlans[dailyPlanIndex].recipes.push(...selectedRecipeIds);
            }
            await weeklyPlan.save();
        }
        res.status(201).send({ message: "Tarifler haftalık programa eklendi" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.post("/shoppingList/addIngredient", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { itemName, amount, unit, recipeId } = req.body;
    
    if (!token) {
      console.log("401");
      return res.status(401).send({ error: "Unauthorized" });
    }
  
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      const userId = decodedToken.userId;
      
      if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
      }
  
      let shoppingListItem = await ShoppingList.findOne({ userId: userId, itemName: itemName, unit: unit });
  
      if (shoppingListItem) {
        // Malzeme zaten varsa üzerine ekle
        const currentAmount = parseFloat(shoppingListItem.amount);
        const addedAmount = parseFloat(amount);
        const updatedAmount = currentAmount + addedAmount;
  
        shoppingListItem.amount = updatedAmount.toString();
      } else {
        // Malzeme yoksa yeni bir öğe oluştur
        shoppingListItem = new ShoppingList({
          itemName: itemName,
          amount: amount,
          unit: unit,
          recipeId: recipeId,
          userId: userId
        });
      }
  
      await shoppingListItem.save();
  
      res.send({ status: "ok", message: "Malzemeler alışveriş listesine eklendi." });
    } catch (error) {
      console.error("Alışveriş listesine malzeme eklerken bir hata oluştu:", error);
      res.status(500).send({ error: "Alışveriş listesine malzeme eklerken bir hata oluştu." });
    }
  });
   
app.delete("/deleteRecipe/:recipeId", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const recipeId = req.params.recipeId;

    if (!token) { 
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        
        // Tarifi veritabanından sil
        await Recipe.deleteOne({ _id: recipeId, userId });

        // Tarife ait malzemeleri de sil
        await RecipeIngredient.deleteMany({ recipeId });

        // Tarife ait talimatları da sil
        await Instruction.deleteMany({ recipeId });

        res.send({ status: "ok", message: "Tarif başarıyla silindi" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.delete("/shoppingList/removeItemFromList/:itemId", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const itemId = req.params.itemId;
        await ShoppingList.findOneAndDelete(
            { userId: userId, _id: itemId},
        );

        return res.status(200).json({ message: "Item removed from shopping list successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/weeklyPlan/removeRecipesFromPlan', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: 'Unauthorized' });
        }
        const { selectedRecipeIds, selectedDay } = req.body;
        if (!selectedRecipeIds || !Array.isArray(selectedRecipeIds) || !selectedDay) {
            return res.status(400).send({ error: 'Invalid request body' });
        }
        
        const result = await WeeklyPlan.updateOne(
            { userId: userId, 'dailyPlans.date': selectedDay },
            { $pull: { 'dailyPlans.$.recipes': { $in: selectedRecipeIds } } }
        );

        if (result.nModified === 0) {
            return res.status(404).send({ error: 'No recipes found in the daily plan for the specified day' });
        }

        return res.status(200).send({ message: 'Selected recipes removed from the daily plan for the specified day' });
    } catch (error) {
        console.error('Error removing recipes from the weekly plan:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
  
app.delete('/userFavorites/removeFavorite', async (req, res) => {
    const { userId, recipeId } = req.body;
    try {
        const userFavorite = await UserFavorites.findOne({ userId });
        if (!userFavorite || userFavorite.favoriRecipes.length === 0) {
            return res.status(404).json({ error: 'Favori tarif bulunamadı.' });
        }
        const index = userFavorite.favoriRecipes.findIndex(favorite => favorite.recipes.toString() === recipeId);
        if (index === -1) {
            return res.status(404).json({ error: 'Belirtilen tarif favorilerde bulunamadı.' });
        }
        userFavorite.favoriRecipes.splice(index, 1);
        await userFavorite.save();
        res.json({ message: 'Favori tarif başarıyla kaldırıldı.' });
    } catch (error) {
        console.error('Favori tarif kaldırma hatası:', error);
        res.status(500).json({ error: 'Favori tarif kaldırma işlemi sırasında bir hata oluştu.' });
    }
});

app.get("/weeklyPlan", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const user= jwt.verify(token, JWT_SECRET);
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const weeklyPlanData= await WeeklyPlan.find({userId: user.userId});
        if (!weeklyPlanData || weeklyPlanData.length==0) {
            return  res.status(200).json([]);
        }
        res.status(200).json(weeklyPlanData);
    } catch (error) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/recipes", async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('categories');
        res.send({ status: "ok", data: recipes });
    } catch (err) {
        res.status(500).send({ error: err.message });
    } 
});

app.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        const recipes = await Recipe.find({ recipeName: { $regex: query, $options: 'i' } }).populate('categories');
        res.send({ status: "ok", data: recipes });
    } catch (err) {
        res.status(500).send({ error: err.message });
    } 
});


app.get('/userFavorites/favoriteRecipes', async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        
        // Fetch user favorites and populate the necessary fields
        const userFavorites = await UserFavorites.findOne({ userId })
            .populate({
                path: 'favoriRecipes.recipes',
                populate: { path: 'categories' }
            });
        
        if (!userFavorites) {
            return res.status(404).json({ message: 'Favori tarifler bulunamadı' });
        }

        // Flatten the nested arrays of recipes
        const favoriteRecipes = userFavorites.favoriRecipes.reduce((acc, favorite) => {
            return acc.concat(favorite.recipes);
        }, []);

        console.log("favrec", favoriteRecipes);
        
        // Respond with the flattened array of favorite recipes
        res.status(200).json({ favoriteRecipes });
    } catch (error) {
        console.error('Favori durumu kontrol edilirken bir hata oluştu:', error);
        res.status(500).json({ error: 'Favori durumu kontrol edilemedi.' });
    }
});


app.put('/recipes/:recipeId/addedToPlan', async (req, res) => {
    const { recipeId } = req.params;
    const { isAddedToPlan } = req.body;

    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, { isAddedToPlan }, { new: true });
        if (!updatedRecipe) {
            return res.status(404).json({ error: 'Tarif bulunamadı' });
        }
        res.status(200).json({ status: 'success', data: updatedRecipe });
    } catch (error) {
        console.error('Plana eklenme durumu güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.put("/shoppingList/updateAmount/:itemId", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    const { newAmount } = req.body;

    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.userId;
        if (!userId) {
            return res.status(401).send({ error: "Unauthorized" });
        }
        const itemId = req.params.itemId;
        const shoppingListItem = await ShoppingList.findByIdAndUpdate(itemId, { amount: newAmount }, { new: true });
        if (!shoppingListItem) {
            return res.status(404).json({ error: "Alışveriş listesi öğesi bulunamadı" });
        }
        console.log("newAmount",newAmount)
        console.log("shoppingListItem", shoppingListItem)
        return res.status(200).json({ message: "Alışveriş listesi öğesi başarıyla güncellendi" });
    } catch (error) {
        console.error("Alışveriş listesi öğesi güncelleme hatası:", error);
        return res.status(500).json({ error: "Alışveriş listesi öğesi güncelleme hatası" });
    }
});

app.get("/userRecipes", async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    try {
        const user= jwt.verify(token, JWT_SECRET);
        const userRecipes = await Recipe.find({userId: user.userId}).populate('categories');
        res.send({ status: "ok", data: userRecipes});
    } catch (error) {
        console.error('Tarifleri alma hatası:', error);
        res.status(500).send({ error: "Tarifleri alma hatası" });
    }
});

app.get("/allergies", async (req, res) => {
    try {
        const allergies = await Allergies.find();
        res.send({ status: "ok", data: allergies });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/diets", async (req, res) => {
    try {
        const diets = await Diets.find();
        res.send({ status: "ok", data: diets });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/ingredient", async (req, res) => {
    try {
        const ingredient = await Ingredient.find();
        res.send({ status: "ok", data: ingredient });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/unit", async (req, res) => {
    try {
        const unit = await Unit.find();
        res.send({ status: "ok", data: unit });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/recipeIngredients", async (req, res) => {
    const { recipeId } = req.query;
    try {
        const recipeIngredients = await RecipeIngredient.find({ recipeId });
        res.send({ success: true, data: recipeIngredients });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/instruction", async (req, res) => {
    const { recipeId } = req.query;
    try {
        const description = await Instruction.find({ recipeId });
        res.send({ success: true, data: description });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/category", async (req, res) => {
    const { recipeId } = req.query;
    try {
        const categories = await Category.find({ recipeId });
        res.send({ status: "ok", data: categories });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/shoppingList", async(req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    try {
        const user= jwt.verify(token, JWT_SECRET);
        const shoppingList = await ShoppingList.find({userId: user.userId});
        res.send({ status: "ok", data: shoppingList });
    } catch (err) {
        res.status(500).send({ error: err.message });
    } 
});


const scriptPath = 'C:/Users/okul/Desktop/chatbotV4.1.3/chatbotV4.1/';

// Python kodunu çalıştırma endpoint'i
app.post('/run-python', async (req, res) => {
  try {
    // Python kodunu çalıştırma işlemi gerçekleştirilir
    const { stderr, stdout } = await promisify(exec)(`python chat_test.py`, { cwd: scriptPath });
    if (stderr) {
      console.error(stderr.toString());
    }
    console.log('Python script executed successfully');
    console.log(stdout);

    res.json({ message: "Python script executed successfully" });
  } catch (error) {
    console.error("Error executing Python script:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


const PORT = 3030;
app.listen(3030, () => {
    console.log(`SERVER STARTED PORT ${PORT}`);
});

