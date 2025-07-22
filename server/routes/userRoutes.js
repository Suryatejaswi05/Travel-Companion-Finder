const express = require("express");
const bcrypt = require("bcryptjs"); // Secure password hashing
const db = require("../config/db"); // MySQL connection
const router = express.Router();
const nodemailer = require("nodemailer");
const os = require('os');
const crypto = require('crypto');

// Register User (Signup)


router.get("/verification/:data", async (req, res) => {
   
    let raw_data = req.params.data;
    console.log(raw_data);


    try {
        // Hash password before storing

        const sql = `select * from users where token="`+raw_data+`"`;
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Database Search Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }            
            
        });

        const sql2 = `update users set verified="1" where token="`+raw_data+`"`;
        console.log(sql2);
        db.query(sql2, (err, result) => {
            if (err) {
                console.error("Database Search Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }            
            
        });
        res.status(200).json({ message: " Mail Verification successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }






});


router.post("/register", async (req, res) => {
    const { username, fullName, age, gender, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, Email, and Password are required" });
    }

    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const randomString = (length = 16) => {
            return crypto.randomBytes(length).toString('hex').slice(0, length);
        };
        var rand=randomString(10);

        const sql = `INSERT INTO users (username, fullName, age, gender, email, password,token) VALUES (?, ?, ?, ?, ?, ? ,?)`;
        db.query(sql, [username, fullName, age, gender, email, hashedPassword,rand], (err, result) => {
            if (err) {
                console.error("Database Insert Error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "travelcompanionfinder16@gmail.com", // Your Gmail address
                    pass: "xybc qwsu lypx wjcz", // Use the generated App Password here
                },
            });
            const getLocalIP = () => {
                const interfaces = os.networkInterfaces();
                for (const iface of Object.values(interfaces)) {
                    for (const config of iface) {
                        if (config.family === 'IPv4' && !config.internal) {
                            return config.address; // Return the first non-internal IPv4 address
                        }
                    }
                }
                return 'IP not found';
            };
            var ip =getLocalIP();

            
            var vlink = "http://"+ip+":5000/api/users/verification/"+rand;
            console.log(vlink);
            
            // Email options
            const mailOptions = {
                from: "travelcompanionfinder16@gmail.com",
                to: email,
                subject: "Mail Verification From Travel Companion Finder",
                text: "Please verify your email address by clicking the link sent to your inbox. This ensures the security of your account and access to all features "+vlink,
            };
            
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error:", error);
                } else {
                    console.log("Email sent:", info.response);
                }
            });

            res.status(200).json({ message: "User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/login", (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and Password are required" });
    }

    username = username.trim(); // Remove extra spaces

    console.log("\n[LOGIN REQUEST] Received Username:", username); // Debug log

    const sql = "SELECT * FROM users WHERE BINARY username = ?";
    db.query(sql, [username], async (err, result) => {
        if (err) {
            console.error("[DATABASE ERROR]:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("[DATABASE QUERY RESULT]:", result); // Debug log

        if (result.length === 0) {
            console.log("[USER NOT FOUND] Username:", username);
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];
        console.log("[STORED PASSWORD]:", user.password);

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("[PASSWORD MATCH]:", isMatch);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }
            let verified = user.verified;

            if(verified=="0")
            {
                return res.status(401).json({ message: "User is Not Verified" });
            }
            else
            {
                console.log("[LOGIN SUCCESSFUL]:", username);
                res.status(200).json({ message: "Login successful", user: { username: user.username, email: user.email } });
            }

        } catch (error) {
            console.error("[BCRYPT COMPARE ERROR]:", error);
            res.status(500).json({ message: "Error comparing password", error });
        }
    });
});


// ✅ GET USER PROFILE (Load saved profile data)
router.get("/getProfile/:username", (req, res) => {
    const username = req.params.username.trim();

    const sql = "SELECT username, gender, email, phone, place, date, profilePic,profile_view FROM users WHERE BINARY username = ?";
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error("[DATABASE ERROR]:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            console.log("[USER NOT FOUND]:", username);
            return res.status(404).json({ message: "User not found" });
        }

        let userProfile = result[0];

        if (userProfile.date) {
            let originalDate = new Date(userProfile.date);
            userProfile.date = `${originalDate.getDate().toString().padStart(2, '0')}-${(originalDate.getMonth() + 1).toString().padStart(2, '0')}-${originalDate.getFullYear()}`;
        }

        console.log("[USER PROFILE FOUND]:", userProfile);
        res.status(200).json(userProfile); // Return all required fields
    });
});
// ✅ SAVE/UPDATE USER PROFILE (Ensure data remains after logout)
router.post("/saveProfile", (req, res) => {
    const { username, phone, email, place, date, profilePic, sgender } = req.body;
    console.log("////////////////////////////////");
    console.log(sgender);

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    // Check if user exists
    const checkUserSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkUserSql, [username], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        formattedDate = null;
        if (date && date.trim() !== "") {
            // Convert dd-mm-yyyy to YYYY-MM-DD before storing
            const [day, month, year] = date.split("-");
            formattedDate = `${year}-${month}-${day}`;
        }

        // Update all profile fields
        const updateSql = `
            UPDATE users 
            SET phone = ?, email = ?, place = ?, date = ?, profilePic = ? , profile_view = ?
            WHERE username = ?`;

        db.query(updateSql, [phone, email, place, formattedDate, profilePic, sgender , username ], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Error updating profile:", updateErr);
                return res.status(500).json({ error: "Error updating profile" });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(400).json({ error: "No changes were made" });
            }

            res.json({ success: true, message: "Profile updated successfully" });
        });
    });
});



module.exports = router;