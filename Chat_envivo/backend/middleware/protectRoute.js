import jwt from 'jsonwebtoken';
import { findUserById } from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        // Verificar si el token existe
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        // Decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar si el token es válido
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" });
        }

        // Extraer userId del token
        const userId = decoded.userId;

        // Encontrar el usuario en la base de datos
        const user = await findUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Agregar el usuario a la solicitud
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in route protection middleware:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default protectRoute;
