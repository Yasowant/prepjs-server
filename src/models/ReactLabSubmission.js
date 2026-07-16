import mongoose from "mongoose";

const reactLabSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    challengeId: { type: String, required: true, index: true },
    code: { type: String, required: true, maxlength: 30000 },
    score: { type: Number, default: 0 }, // 0-10 from the AI reviewer
    passed: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    feedback: { type: [String], default: [] },
  },
  { timestamps: true }
);

reactLabSubmissionSchema.index({ user: 1, challengeId: 1, createdAt: -1 });

export default mongoose.model("ReactLabSubmission", reactLabSubmissionSchema);
