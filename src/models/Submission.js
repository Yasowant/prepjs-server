import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    problemId: { type: String, required: true, index: true },
    status: { type: String, enum: ["accepted", "failed"], required: true },
    passed: { type: Number, required: true },
    total: { type: Number, required: true },
    code: { type: String, required: true, maxlength: 20000 },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problemId: 1, createdAt: -1 });

export default mongoose.model("Submission", submissionSchema);
