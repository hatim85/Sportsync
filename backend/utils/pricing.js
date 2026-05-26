import Settings from "../models/settingsModel.js";

export async function getDeliveryCharge() {
  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $setOnInsert: { deliveryCharge: 0 } },
    { new: true, upsert: true }
  );
  return Number(doc?.deliveryCharge || 0);
}

/** Normalize product for API responses (category name, etc.) */
export function formatProductDoc(productDoc) {
  const obj = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  obj.categoryName = obj.categoryName || obj?.categoryId?.name;
  return obj;
}
