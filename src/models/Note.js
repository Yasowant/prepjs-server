import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    conceptId: { type: String, required: true },
    text: { type: String, default: "", maxlength: 8000 },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, conceptId: 1 }, { unique: true });

export default mongoose.model("Note", noteSchema);
