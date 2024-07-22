import { getUsersForSidebarcontroller } from '../models/user.model.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user.id_Trabajador;
        const filteredUsers = await getUsersForSidebarcontroller(loggedInUserId);

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error en la funcion de obtener usuarios filtrados: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
