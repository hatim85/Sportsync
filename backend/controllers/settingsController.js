import Settings from "../models/settingsModel.js";

export const getPricingSettings = async (req, res) => {
  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $setOnInsert: { deliveryCharge: 0 } },
    { new: true, upsert: true }
  );
  res.status(200).json({ deliveryCharge: doc.deliveryCharge });
};

export const updatePricingSettings = async (req, res) => {
  const deliveryCharge = Number(req.body?.deliveryCharge);
  if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
    return res.status(400).json({ message: "deliveryCharge must be a number >= 0" });
  }

  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $set: { deliveryCharge } },
    { new: true, upsert: true }
  );

  res.status(200).json({ deliveryCharge: doc.deliveryCharge });
};
