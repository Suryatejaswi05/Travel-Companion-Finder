const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "travelcompanionfinder16@gmail.com",
        pass: "xybc qwsu lypx wjcz", // Use the generated App Password
    },
});

const mailOptions = {
    from: "travelcompanionfinder16@gmail.com",
    to: "buradaguntadinakar1805@gmail.com",
    subject: "Test Email",
    text: "Hello, this is a test email!",
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Email sent:", info.response);
    }
});
