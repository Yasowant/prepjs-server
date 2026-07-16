import mongoose from "mongoose";

const savedCodeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemId: { type: String, required: true }, // e.g. "rl-counter", "two-sum", "proj-lru-cache"
    code: { type: String, required: true, maxlength: 30000 },
  },
  { timestamps: true }
);

savedCodeSchema.index({ user: 1, itemId: 1 }, { unique: true });

export default mongoose.model("SavedCode", savedCodeSchema);
