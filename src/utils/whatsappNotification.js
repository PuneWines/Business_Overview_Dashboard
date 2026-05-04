/**
 * Utility for sending WhatsApp notifications via Maytapi
 */

const MAYTAPI_PRODUCT_ID = import.meta.env.VITE_MAYTAPI_PRODUCT_ID || '654f0c29-bfe7-42f2-b5a9-81638a716206';
const MAYTAPI_TOKEN = import.meta.env.VITE_MAYTAPI_TOKEN || '9fcce0ed-0e27-423f-946f-14141bc6589a';
const MAYTAPI_PHONE_ID = import.meta.env.VITE_MAYTAPI_PHONE_ID || '102579';

const MAYTAPI_URL = `https://api.maytapi.com/api/${MAYTAPI_PRODUCT_ID}/${MAYTAPI_PHONE_ID}/sendMessage?token=${MAYTAPI_TOKEN}`;

/**
 * Sends a WhatsApp message
 * @param {string} number - Recipient phone number (without +91)
 * @param {string} message - The message text
 */
export async function sendWhatsAppNotification(number, message) {
  if (!number) {
    console.warn("WhatsApp notification skipped: No recipient number provided.");
    return;
  }

  // Prepend 91 if not present
  let formattedNumber = number.trim().replace(/\D/g, '');
  if (formattedNumber.length === 10) {
    formattedNumber = '91' + formattedNumber;
  }

  const payload = {
    to_number: formattedNumber,
    type: 'text',
    message: message,
    text: message,
  };

  try {
    const response = await fetch(MAYTAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.success) {
      console.error("Maytapi Error:", result.message || "Failed to send message");
    }
    return result;
  } catch (error) {
    console.error("WhatsApp Notification Error:", error);
    return { success: false, error: error.message };
  }
}
