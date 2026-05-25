import mongoose from "mongoose";

const settingsSchema = mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    makingCharge: { type: Number, required: true, default: 0, min: 0 },
    deliveryCharge: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;