import Settings from "../models/settingsModel.js";

export async function getMakingCharge() {
  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $setOnInsert: { makingCharge: 0, deliveryCharge: 0 } },
    { new: true, upsert: true }
  );
  return Number(doc?.makingCharge || 0);
}

export async function getDeliveryCharge() {
  const doc = await Settings.findOneAndUpdate(
    { key: "pricing" },
    { $setOnInsert: { makingCharge: 0, deliveryCharge: 0 } },
    { new: true, upsert: true }
  );
  return Number(doc?.deliveryCharge || 0);
}

export function applyMakingChargeToProductDoc(productDoc, makingCharge) {
  const obj = productDoc.toObject ? productDoc.toObject() : { ...productDoc };
  obj.basePrice = obj.price;
  obj.price = Number(obj.price || 0) + Number(makingCharge || 0);
  obj.categoryName = obj.categoryName || obj?.categoryId?.name;

  // Temporarily disable image path normalization
  // if (obj.image && Array.isArray(obj.image)) {
  //   obj.image = obj.image.map((img) => {
  //     if (typeof img === 'string') {
  //       const parts = img.split('/');
  //       return '/' + parts[parts.length - 1];
  //     }
  //     return img;
  //   });
  // }

  return obj;
}