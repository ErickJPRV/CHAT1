import express from 'express';
import path from "path";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';

import conectarALaBaseDeDatos from './db/connectsqlserver.js';
import { app,server } from './socket/socket.js';

const PORT = process.env.PORT || 5000;
const __dirname=path.resolve()
dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/users", userRoutes);

app.use(express.static(path.join(__dirname,"/frontend/dist")))

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

server.listen(PORT, async () => {
    try {
        await conectarALaBaseDeDatos();
        console.log(`Server Running on port ${PORT}`);
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
    }
});
