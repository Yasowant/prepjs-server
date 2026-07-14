// One-time migration: mark ALL existing users as email-verified.
// Use this for accounts created BEFORE the email-verification feature.
//
//   cd server && node scripts/verify-existing-users.js
//
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const { MONGO_URI } = process.env;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
const result = await mongoose.connection
  .collection("users")
  .updateMany({ isVerified: { $ne: true } }, { $set: { isVerified: true } });

console.log(`✅ Verified ${result.modifiedCount} existing user(s).`);
await mongoose.disconnect();
