import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { errorHandler } from './error.js'

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers?.authorization;
    let token = req.cookies?.access_token;

    // Cross-origin production (e.g. Vercel → Render) may not send cookies; accept Bearer token too.
    if (!token && authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    }

    if (!token) {
        return next(errorHandler(401, 'Unauthorized'))
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return next(errorHandler(401,'Unauthorized'))
        }
        req.user=user;
        next();
    })
}