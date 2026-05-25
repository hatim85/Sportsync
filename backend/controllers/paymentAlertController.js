import PaymentAlert from '../models/paymentAlertModel.js';

export const getPaymentAlerts = async (req, res) => {
  try {
    const showResolved = req.query.resolved === 'true';
    const alerts = await PaymentAlert.find({ resolved: showResolved })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('orderId', 'status totalAmount paymentMethod');
    res.status(200).json({ alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolvePaymentAlert = async (req, res) => {
  try {
    const alert = await PaymentAlert.findByIdAndUpdate(
      req.params.alertId,
      { resolved: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
