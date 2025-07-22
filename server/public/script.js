function getPlaces() {
    var location = document.getElementById("location").value;
    fetch("http://192.168.0.106:5000/get_places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: location })
    })
    .then(response => response.json())
    .then(data => {
        var output = "<h3>Tourist Places:</h3>";
        data.forEach(place => {
            output += `
                <div class="place-card" onclick="showPopup('${place.description}')">
                    <p><strong>${place.name}</strong></p>
                    <p>⭐ Rating: ${place.rating}</p>
                    <p><strong>📌 Address:</strong> ${place.address}</p>
                </div>
            `;
        });
        document.getElementById("results").innerHTML = output;
    });
}

function showPopup(description) {
    document.getElementById("popup-description").innerText = description;
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}
