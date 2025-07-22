const cors = require("cors");
require('dotenv').config();
const axios = require('axios');
const mysql = require("mysql2/promise");
const express=require("express")
const app = express();
app.use(cors()); // Allow frontend requests
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});


const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // Change to your actual MySQL password
    database: "travelApp",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});  // ✅ Use `.promise()` directly here, no need for db.promise()

module.exports = db; // ✅ Export only `db`



const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


const API_KEY = process.env.GOOGLE_API_KEY;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




// Google Places API Endpoint
app.get("/rentals", async (req, res) => {
    const { place } = req.query;
    if (!place) {
        return res.status(400).json({ error: "Place is required" });
    }

    try {
        const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=car+rental+OR+scooter+rental+OR+bike+rental+in+${encodeURIComponent(place)}&key=${process.env.GOOGLE_API_KEY}`;

        const response = await axios.get(googleApiUrl);
        const places = response.data.results;

        const rentalList = places.map((rental) => ({
            id: rental.place_id,
            name: rental.name,
            address: rental.formatted_address,
            rating: rental.rating || "Not Rated",
        }));

        res.json(rentalList);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        res.status(500).json({ error: "Failed to fetch vehicle rentals" });
    }
});

// Function to get place details including description
async function getPlaceDetails(place_id) {
    try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,rating,formatted_address,editorial_summary&key=${API_KEY}`;
        const detailsResponse = await axios.get(detailsUrl);
        const place = detailsResponse.data.result;
        
        return {
            name: place.name,
            rating: place.rating || "No Rating",
            address: place.formatted_address || "No Address",
            description: place.editorial_summary?.overview || "Description not available"
        };
    } catch (error) {
        return null;
    }
}


// API to get tourist places along with descriptions
app.post("/get_places", async (req, res) => {
    const { location } = req.body;

    try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=tourist+places+in+${location}&key=${API_KEY}`;
        const searchResponse = await axios.get(searchUrl);
        const places = await Promise.all(
            searchResponse.data.results.map(async (place) => {
                return await getPlaceDetails(place.place_id);
            })
        );

        res.json(places.filter(place => place !== null)); // Remove failed requests
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
});
app.get("/api/users/search", async (req, res) => {
    const { place, date, loggedInUser,gender,sgender } = req.query;
    if (!place ||  !loggedInUser) {
        return res.status(400).json({ message: "Place, date, and logged-in user are required" });
    }
    console.log(sgender);

    let svalue = sgender

    if(sgender=="All")
    {
        svalue=gender;
    }
    else{
        svalue=sgender;
    }

    console.log('SELECT username, fullName, email, profilePic FROM users WHERE place = "'+place+'" AND  (gender = "'+gender+'" or profile_view="'+gender+'") or profile_view="All"');            

    try {

        const [users] = await db.execute(
            //"SELECT username, fullName, email, profilePic FROM users WHERE place = ? AND date = ? AND gender = ?", 
            //[place, date,gender]
            "SELECT username, fullName, email, profilePic FROM users WHERE place = ? AND  (profile_view = ? or profile_view='All')", 
            [place,gender]

        );

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // Check if loggedInUser is already friends with the searched users
        const updatedUsers = await Promise.all(users.map(async (user) => {
            const [friendCheck] = await db.execute(
                "SELECT * FROM friends WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)",
                [loggedInUser, user.username, user.username, loggedInUser]
            );

            return { 
                ...user, 
                isFriend: friendCheck.length > 0  // If a record exists, they are friends
            };
        }));

        res.json(updatedUsers);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
// Send Friend Request
app.post("/api/users/sendRequest", async (req, res) => {
    const { sender, receiver } = req.body;

    try {
        await db.execute(
            "INSERT INTO friend_requests (sender, receiver) VALUES (?, ?)",
            [sender, receiver]
        );
        res.json({ message: "Friend request sent!" });
    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Fetch Notifications
// Fetch all notifications for a user (friend requests + general notifications)
app.get("/api/users/notifications/all/:username", async (req, res) => {
    const { username } = req.params;

    try {
        // Fetch friend requests (Include profile picture)
        const [friendRequests] = await db.execute(
            `SELECT fr.id, fr.sender, 'friend_request' AS type, 
                    COALESCE(u.profilePic, '') AS profilePic
             FROM friend_requests fr
             LEFT JOIN users u ON fr.sender = u.username
             WHERE fr.receiver = ? AND fr.status = 'pending'`,
            [username]
        );

        // Fetch general notifications (Include profile picture)
        const [generalNotifications] = await db.execute(
            `SELECT n.id, n.message, 'general' AS type, 
                    COALESCE(u.profilePic, '') AS profilePic
             FROM notifications n
             LEFT JOIN users u ON n.user = u.username
             WHERE n.user = ?`,
            [username]
        );

        // Combine both notifications
        const allNotifications = [...friendRequests, ...generalNotifications];

        res.json(allNotifications);
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Accept or Decline Request
app.post("/api/users/respondRequest", async (req, res) => {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        // Fetch sender and receiver usernames from friend_requests table
        const [request] = await db.execute(
            "SELECT sender, receiver FROM friend_requests WHERE id = ?",
            [requestId]
        );

        if (request.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const { sender, receiver } = request[0];

        if (action === "accepted") {
            // ✅ Ensure the `friends` table exists before inserting
            await db.execute(
                "CREATE TABLE IF NOT EXISTS friends (id INT AUTO_INCREMENT PRIMARY KEY, user1 VARCHAR(255) NOT NULL, user2 VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            );

            // ✅ Insert into the friends table
            await db.execute(
                "INSERT INTO friends (user1, user2) VALUES (?, ?)",
                [sender, receiver]
            );

            // ✅ Remove the request after accepting
            await db.execute("DELETE FROM friend_requests WHERE id = ?", [requestId]);
            // ✅ Insert notification for sender
            await db.execute(
                "INSERT INTO notifications (user, message) VALUES (?, ?)",
                [sender, `${receiver} accepted your friend request!`]
            );
            return res.json({ message: "Friend request accepted successfully!" });
        } else {
            // ✅ Just delete the request if declined
            await db.execute("DELETE FROM friend_requests WHERE id = ?", [requestId]);
            return res.json({ message: "Friend request declined." });
        }
    } catch (error) {
        console.error("Error responding to request:", error);
        return res.status(500).json({ message: "Server error" });
    }
});
app.post("/api/users/sendNotification", async (req, res) => {
    const { receiver, message } = req.body;

    if (!receiver || !message) {
        return res.status(400).json({ message: "Invalid notification data" });
    }

    try {
        await db.execute(
            "INSERT INTO notifications (user, message) VALUES (?, ?)",
            [receiver, message]
        );

        res.json({ message: "Notification sent successfully!" });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// Mark a notification as read (delete it)
app.post("/api/users/notifications/markAsRead", async (req, res) => {
    const { notificationId } = req.body;

    try {
        // Delete the notification from the database
        await db.execute("DELETE FROM notifications WHERE id = ?", [notificationId]);

        res.json({ success: true, message: "Notification removed" });
    } catch (error) {
        console.error("Error removing notification:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// Fetch Friends List for a User
app.get("/api/users/friends/:username", async (req, res) => {
    const { username } = req.params;

    try {
        const [friends] = await db.execute(
            `SELECT user2 AS friend, u.profilePic FROM friends 
             JOIN users u ON friends.user2 = u.username
             WHERE user1 = ? 
             UNION 
             SELECT user1 AS friend, u.profilePic FROM friends 
             JOIN users u ON friends.user1 = u.username
             WHERE user2 = ?`, 
            [username, username]
        );

        res.json({ success: true, friends });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
// 📌 Save Message in Database
// 📌 Save Message in Database
app.post("/api/messages/send", async (req, res) => {
    const { sender, receiver, message } = req.body;
    if (!sender || !receiver || !message) return res.status(400).json({ message: "Missing data" });

    try {
        await db.execute(
            "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
            [sender, receiver, message]
        );

        // Emit message to the receiver via WebSocket
        io.to(receiver).emit("newMessage", { sender, message });

        res.json({ success: true, message: "Message sent!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📌 Fetch Messages Between Two Users
app.get("/api/messages/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;
    console.log(`🟢 Fetching messages between: '${user1}' and '${user2}'`); // ✅ Log user params

    try {
        const [messages] = await db.execute(
            "SELECT sender, receiver, message FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY id ASC",
            [user1.trim(), user2.trim(), user2.trim(), user1.trim()]
        );

        console.log("✅ Messages from DB:", messages);  // ✅ Debugging logs
        res.json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }
});
app.get("/api/users/notifications/:username", async (req, res) => {
    const { username } = req.params;
    
    try {
        const [notifications] = await db.execute(
            "SELECT id, message FROM notifications WHERE user = ?", [username]
        );

        res.json(notifications); // ✅ Send notifications as JSON
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 📌 WebSocket Connection
io.on("connection", (socket) => {
    socket.on("join", (username) => {
        socket.join(username);
    });

    socket.on("sendMessage", ({ sender, receiver, message }) => {
        io.to(receiver).emit("newMessage", { sender, message });

        // 🔥 Notify receiver about new message
        db.execute("INSERT INTO notifications (user, message) VALUES (?, ?)", 
            [receiver, `New message from ${sender}`]
        ).catch(error => console.error("Error inserting notification:", error));
    });
});




const PORT = 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));