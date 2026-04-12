const twilio = require("twilio");

// Create client
const client = new twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Function to send SMS
const sendSMS = async (message) => {
    try {
        const response = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,   // your Twilio number
            to: "+919080419519"               // your verified number
        });

        console.log("✅ SMS Sent:", response.sid);
    } catch (error) {
        console.error("❌ SMS Error:", error.message);
    }
};

module.exports = sendSMS;