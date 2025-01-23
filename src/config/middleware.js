import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import config from "./config.js";
import morgan from "morgan";
import logger from "../logger/index.js";
import './passport.js'
import passport from "passport";
const setupMiddlewares = (app) => {
  //cors
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(express.json());

  //morgan
  const morganFormat = config.NODE_ENV === "production" ? "combined" : "dev";

  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );


  app.use(passport.initialize())
  
};

export default setupMiddlewares;
