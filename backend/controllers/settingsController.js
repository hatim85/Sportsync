import Settings from "../models/settingsModel.js";

export const getPricingSettings = async (req, res) => {
  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $setOnInsert: { makingCharge: 0, deliveryCharge: 0 } },
    { new: true, upsert: true }
  );
  res.status(200).json({ makingCharge: doc.makingCharge, deliveryCharge: doc.deliveryCharge });
};

export const updatePricingSettings = async (req, res) => {
  const makingCharge = Number(req.body?.makingCharge);
  const deliveryCharge = Number(req.body?.deliveryCharge);
  if (
    Number.isNaN(makingCharge) || makingCharge < 0 ||
    Number.isNaN(deliveryCharge) || deliveryCharge < 0
  ) {
    return res.status(400).json({ message: "Both makingCharge and deliveryCharge must be numbers >= 0" });
  }

  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $set: { makingCharge, deliveryCharge } },
    { new: true, upsert: true }
  );

  res.status(200).json({ makingCharge: doc.makingCharge, deliveryCharge: doc.deliveryCharge });
};