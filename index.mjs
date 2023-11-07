import express from "express";
import axios from "axios";

const app = express();
const port = 5006;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.get("/geocoding", async (req, res) => {
    const uri = "https://geocode.maps.co/search?q=";
    const location = req.query.location;

    if (!location) {
        res.send({ error: "Bad request. No location specified" }).status(400);
        return;
    }

    const response = await axios.get(uri + location);

    const data = response.data[0];
    if (data) {
        res.send({ lat: data.lat, lon: data.lon, name: data.display_name }).status(200);
    } else {
        res.send({ error: "Server error. No results found" }).status(500);
    }
});

app.get("/distance", async (req, res) => {
    const coordFrom = req.query.from;
    const coordTo = req.query.to;

    if(!coordFrom) {
        res.send({ error: "Bad request. Initial point not specified" }).status(400);
    } else if(!coordTo) {
        res.send({ error: "Bad request. Destination point not specified" }).status(400);
    }

    const uri = "https://router.project-osrm.org/route/v1/driving/" + coordFrom + ";" + coordTo + "?overview=false";

    const response = await axios.get(uri);
    const data = response.data.routes[0];

    if(data) {
        res.send({ distance: data.distance / 1000, distance_unit: "km" }).status(200);
    } else {
        res.send({ error: "Server error. No results found" }).status(500);
    }
});