require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get("/rentals", async (req, res) => {
    const { place, type } = req.query;
    if (!place) {
        return res.status(400).json({ error: "Place is required" });
    }

    let query = "vehicle rental in " + encodeURIComponent(place);
    if (type === "2wheeler") query = "bike rental OR scooter rental in " + encodeURIComponent(place);
    if (type === "4wheeler") query = "car rental in " + encodeURIComponent(place);

    try {
        const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${process.env.GOOGLE_API_KEY}`;
        const response = await axios.get(googleApiUrl);
        const places = response.data.results;

        // Fetch contact details using Place Details API
        const rentalList = await Promise.all(places.map(async (rental) => {
            let contact = "Not Available";
            try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${rental.place_id}&fields=formatted_phone_number&key=${process.env.GOOGLE_API_KEY}`;
                const detailsResponse = await axios.get(detailsUrl);
                contact = detailsResponse.data.result.formatted_phone_number || "Not Available";
            } catch (error) {
                console.warn(`No contact found for ${rental.name}`);
            }

            return {
                id: rental.place_id,
                name: rental.name,
                address: rental.formatted_address,
                rating: rental.rating || "Not Rated",
                contact: contact,
            };
        }));

        res.json(rentalList);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        res.status(500).json({ error: "Failed to fetch vehicle rentals" });
    }
});

// Fetch vehicle details with INR prices
app.get("/rental-details", async (req, res) => {
    const { rentalId, type } = req.query;

    // Dummy vehicle details based on type
    let vehicles = [];
    if (type === "2wheeler") {
        vehicles = [
            { name: "Yamaha R15", price: "₹800/hour" },
            { name: "Honda Activa", price: "₹500/hour" },
            { name: "Royal Enfield Classic", price: "₹1000/hour" },
            { name: "Honda Shine", price: "₹650/hour" }
        ];
    } else if (type === "4wheeler") {
        vehicles = [
            { name: "Honda City", price: "₹1200/hour" },
            { name: "Hyundai Creta", price: "₹1500/hour" },
            { name: "Toyota Fortuner", price: "₹2500/hour" },
            { name: "Suzuki Swift", price: "₹800/hour" }
        ];
    } else {
        vehicles = [
            { name: "Yamaha R15", price: "₹800/hour" },
            { name: "Honda City", price: "₹1200/hour" },
            { name: "Toyota Fortuner", price: "₹2500/hour" },
            { name: "Royal Enfield Classic", price: "₹1000/hour" },
            { name: "Honda Shine", price: "₹650/hour" },
            { name: "Suzuki Swift", price: "₹800/hour" }
        ];
    }

    res.json({ vehicles });
});

app.listen(PORT, () => {
    console.log(`Server running on http://192.168.0.106:${PORT}`);
});
