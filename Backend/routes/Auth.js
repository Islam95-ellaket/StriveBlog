import express from 'express';
import { login, me, register } from '../controllers/Auth.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
    validateAuthorBody,
    validateAuthor,
    validateLoginBody
} from '../middlewares/authors/validateAuthorBody.js';

import passport from 'passport';


const AuthRouter = express.Router();

AuthRouter.post('/login', [validateLoginBody, validateAuthor] ,login);
AuthRouter.get('/me', authenticate , me);
AuthRouter.post('/register', [validateAuthorBody, validateAuthor], register);
AuthRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
AuthRouter.get('/google/callback', passport.authenticate('google', { session: false }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${req.user.token}`)
    }
);



export default AuthRouter;
