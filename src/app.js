import express from 'express'
import setupMiddlewares from './config/middleware.js';

const app = express();

setupMiddlewares(app);

import router from './routes/index.js';

app.use('/api/v1', router);``

export default app;