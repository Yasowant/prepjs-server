import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conceptId: { type: String, required: true },
    status: { type: String, enum: ["learning", "completed", "bookmarked"], default: "learning" },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, conceptId: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
