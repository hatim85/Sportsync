/** Ensure authenticated user owns the order (admins bypass). */
export function userOwnsOrder(req, order) {
  if (!req.user?.id) return false;
  if (req.user.userType === 'admin') return true;
  return String(order.userId) === String(req.user.id);
}

export function userMatchesParam(req, userId) {
  if (!req.user?.id) return false;
  if (req.user.userType === 'admin') return true;
  return String(userId) === String(req.user.id);
}
