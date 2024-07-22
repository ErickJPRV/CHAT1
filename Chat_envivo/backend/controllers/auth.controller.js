import bcrypt from 'bcryptjs';
import mssql from 'mssql';
import generateTokenAndSetCookie from '../utils/generateToken.js';
import conectarALaBaseDeDatos from '../db/connectsqlserver.js';
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const request = new mssql.Request();
        request.input('correo', mssql.VarChar, email);
        const result = await request.query("SELECT * FROM Trabajador WHERE Correo_Electronico=@correo");

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: "Correo o contraseña inválidos" });
        }

        const user = result.recordset[0];

        // Comparar la contraseña proporcionada con la cifrada en la base de datos
        const isPasswordCorrect = await bcrypt.compare(password, user.Contraseña);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Correo o contraseña inválidos" });
        }

        // Generar token y establecer en la cookie
        generateTokenAndSetCookie(user.id_Trabajador, res);

        res.status(200).json({
            _id: user.id_Trabajador,
            Nombre: user.Nombres,
            Apellido: user.Apellidos,
            Cargo: user.Cargo,
            ImageUrl: user.ImageUrl,
        });
    } catch (error) {
        console.error("Error en el controlador de login", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "El deslogeo fue exitoso" });
    } catch (error) {
        console.log("Error en el controlador de deslogeo", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
