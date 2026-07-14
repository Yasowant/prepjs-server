import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} }, // { questionId: optionIndex }
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
