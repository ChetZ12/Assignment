import express from 'express';
import axios from 'axios';
import csvwriter from 'csv-writer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import current from './casting/current.js';
import forecast from './casting/forecast.js';

let API_KEY = '7306e9e6b7fa46d18b553238222505';

let createCsvWriter = csvwriter.createObjectCsvWriter;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


let curheader = [];
let forheader = [];
for (let key in current) {
    curheader.push({
        id: key,
        title: current[key]
    })
}
for (let key in forecast) {
    forheader.push({
        id: key,
        title: forecast[key]
    })
}
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile('./app.html', { root: __dirname });
})
app.post('/', (req, res) => {

    let url;
    let town = req.body.town;
    if (req.body.choice == "current") {
        getCurrentData(town);
        url = `http://api.weatherapi.com/v1/current.json?`;
    } else if (req.body.choice == "forecast") {
        getForecastData(town);
        url = `http://api.weatherapi.com/v1/forecast.json?`;
    }

    const requestData = {
        url: url,
        API_KEY: API_KEY,
        town: town,
        aqi: "no",
        alerts: "no"
    }
    const csvWriter = createCsvWriter({
        path: `Data/request_${town}.csv`,
        header: [
            { id: "url", title: "URL" },
            { id: "API_KEY", title: "API_KEY" },
            { id: "town", title: "Town" },
            { id: "aqi", title: "AQI" },
            { id: "alerts", title: "Alerts" }
        ]
    });

    csvWriter
        .writeRecords([requestData])
        .then(() => console.log('Data uploaded into csv successfully'));

    res.redirect('/');
})


async function getCurrentData(town) {
    try {
        let url = `http://api.weatherapi.com/v1/current.json?`;
        let urlF = `${url}key=${API_KEY}&q=${town}&aqi=no`;
        let data = await axios.get(urlF);

        const csvWriter = createCsvWriter({
            path: `Data/current_results_${town}.csv`,
            header: curheader
        });

        csvWriter
            .writeRecords([data["data"]["location"]])
            .then(() => console.log('Data uploaded into csv successfully'));

    } catch (error) {
        console.log(error.message);
    }

}
async function getForecastData(town) {
    try {
        let url = `http://api.weatherapi.com/v1/forecast.json?`;
        let urlF = `${url}key=${API_KEY}&q=${town}&aqi=no&alerts=no`;
        let data = await axios.get(urlF);

        const csvWriter = createCsvWriter({
            path: `Data/forecast_results_${town}.csv`,
            header: forheader
        });

        csvWriter
            .writeRecords([data["data"]["forecast"]["forecastday"][0]["astro"]])
            .then(() => console.log('Data uploaded into csv successfully'));

    } catch (error) {
        console.log(error.message);
    }

}


app.listen(3000);