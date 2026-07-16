import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, default: "javascript" },
    level: { type: String, default: "junior" },
    qa: [
      {
        question: String,
        answer: String,
      },
    ],
    results: [
      {
        score: Number,
        feedback: String,
        modelAnswer: String,
      },
    ],
    total: { type: Number, default: 0 },
    outOf: { type: Number, default: 0 },
    verdict: { type: String, default: "" },
    hireSignal: { type: String, default: "borderline" },
    videoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewResult", interviewResultSchema);
