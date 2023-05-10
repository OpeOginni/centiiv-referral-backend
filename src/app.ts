// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import express from "express";
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose'

import centiivPay_router from "./centiiv-Pay/router";

const app = express();

app.use(cors());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000/')
})

const MONGO_URI = process.env.MONGO_URI;
mongoose.Promise = Promise;
mongoose.connect(MONGO_URI);
mongoose.connection.on('error', (error: Error) => console.log(error));


app.use('/api/v1', centiivPay_router());

// app.use('marketplace/api/v1', marketplace_router());


// app.listen(3000, () => {
//     console.log("running");
//   });