import express from 'express';
import startServer from './config/db.js';
import cors from 'cors';

// middlewares import
import logger from './middlewares/logger.js';
import errorHandler from './middlewares/errors/errorHandler.js';
import { authenticate } from './middlewares/authenticate.js';

// Routes import
import AuthRouter from './routes/Auth.js' ;
import AuthorRouter from './routes/Authors.js';
import PostRouter from './routes/Posts.js';
import passport from 'passport';
import googleStrategy from './strategies/google.js';


const server = express();

server.use(express.json());
server.use(cors());
server.use(logger);
passport.use(googleStrategy)

//Routes
server.use('/auth', AuthRouter);
server.use(authenticate)
server.use('/authors', AuthorRouter);
server.use('/blogPosts', PostRouter);

// error handlers middleware
server.use(errorHandler);

startServer(process.env.PORT, server);
