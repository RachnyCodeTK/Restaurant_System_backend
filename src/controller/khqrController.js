const { generateKHQR } = require("../service/abaKHQRService");

const createKHQR = async (req, res) => {
  try {
    const { amount } = req.body;

    const billNumber = `INV-${Date.now()}`;

    const qr = generateKHQR({
      merchantName: "FOODIE",
      accountNumber: "123456789",
      amount,
      billNumber,
    });

    return res.status(200).json({
      success: true,
      data: {
        qr,
        billNumber,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate KHQR",
    });
  }
};

module.exports = {
  createKHQR,
};