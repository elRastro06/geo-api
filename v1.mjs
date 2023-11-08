import express from "express";
import axios from "axios";

const app = express.Router();

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
    let coordFrom = req.query.coordFrom;
    let coordTo = req.query.coordTo;
    let from = req.query.from;
    let to = req.query.to;

    if(!coordFrom && !from) {
        res.send({ error: "Bad request. Initial point not specified" }).status(400);
        return;
    } else if(!coordTo && !to) {
        res.send({ error: "Bad request. Destination point not specified" }).status(400);
        return;
    }

    let response;

    if(!coordFrom) {
        response = await axios.get(req.protocol + "://" + req.get("host") + "/v1/geocoding?location=" + from);
        coordFrom = response.data.lat + "," + response.data.lon;
    }
    if(!coordTo) {
        response = await axios.get(req.protocol + "://" + req.get("host") + "/v1/geocoding?location=" + to);
        coordTo = response.data.lat + "," + response.data.lon;
    }

    const uri = "https://router.project-osrm.org/route/v1/driving/" + coordFrom + ";" + coordTo + "?overview=false";

    response = await axios.get(uri);
    const data = response.data.routes[0];

    if(data) {
        res.send({ distance: data.distance / 1000, distance_unit: "km" }).status(200);
    } else {
        res.send({ error: "Server error. No results found" }).status(500);
    }
});

export default app;