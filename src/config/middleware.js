import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import { config } from 'dotenv';

const setupMiddlewares = (app) => {

    //cors
    app.use(cors({
        origin: config.CORS_ORIGIN,
        credentials: true,
    }))

    app.use(express.urlencoded({
        extended: true,
    }))

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(express.json());
}

export default setupMiddlewares;