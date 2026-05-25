/** Sort products newest-first using createdAt or MongoDB ObjectId timestamp */
export function getProductTimestamp(product) {
  if (product?.createdAt) {
    return new Date(product.createdAt).getTime();
  }
  const id = product?._id;
  if (id && String(id).length >= 8) {
    return parseInt(String(id).substring(0, 8), 16) * 1000;
  }
  return 0;
}

export function sortByNewest(products) {
  return [...(products || [])].sort(
    (a, b) => getProductTimestamp(b) - getProductTimestamp(a)
  );
}
