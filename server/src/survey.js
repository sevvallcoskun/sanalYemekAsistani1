import mongoose from "mongoose";

const surveyDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  diets: { type: mongoose.Schema.Types.ObjectId, ref: 'diets', required: true },
  allergies: { type: mongoose.Schema.Types.ObjectId, ref: 'allergies', required: true },
  dislikedIngredients: [{ type: mongoose.Schema.Types.ObjectId, ref:'ingredient', required: true }],
  favoriteCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category' }],
});

mongoose.model('survey', surveyDataSchema);
 

/* import mongoose from "mongoose";


const surveyQuestionsSchema = new mongoose.Schema({
  // Şema alanları burada tanımlanır 
  // Örneğin:
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  }
});

mongoose.model('surveyQuestions', surveyQuestionsSchema);

const surveyDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  answers: [surveyQuestionsSchema], 
  createdAt: { type: Date, default: Date.now}
});

mongoose.model('survey', surveyDataSchema);
  */