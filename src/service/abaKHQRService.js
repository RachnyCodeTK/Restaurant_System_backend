const crypto = require("crypto");

const generateKHQR = ({
  merchantName,
  accountNumber,
  amount,
  currency = "USD",
  billNumber,
}) => {
  const qrString = `00020101021129160014aba.com.kh520459995303840540${amount}5802KH5910${merchantName}6009PhnomPenh62140510${billNumber}6304`;

  return qrString;
};

module.exports = {
  generateKHQR,
};