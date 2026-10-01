import express from "express";
import {routes} from "./routes.js";
import {correlationId} from "./lib/correlation/correlationId.js";
import {errorHandler} from "./lib/error/errorHandler.js";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { env } from "./lib/config/env.js";
import helmet from "helmet";

// localhost:3000/api/health
export function createApp() {
    const app = express();
    app.set('query parser', 'extended');
    app.use(cors({origin: env.cors.origin, credentials: true}));
    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());
    app.use(correlationId);
    app.use('/api', routes);
    app.use(errorHandler);
    return app;
}