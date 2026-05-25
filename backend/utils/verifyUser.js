import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { errorHandler } from './error.js'

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    // console.log("verifyToken - token:", token ? "Token present" : "Token missing", "Cookies:", req.cookies); // DEBUG LOG
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