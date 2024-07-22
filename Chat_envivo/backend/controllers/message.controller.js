import { findConversation,createConversation,addMessageToConversation,getMessagess } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";


export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id_Trabajador;
        let conversationId = await findConversation(senderId, receiverId);

        if (!conversationId) {
            conversationId = await createConversation(senderId, receiverId);
        }

        const newMessage = await addMessageToConversation(conversationId, senderId, receiverId, message);

        if (!newMessage) {
            return res.status(400).json({ error: "Failed to send message" });
        }
        //Socket.io participacion
            const receiverSocketId=getReceiverSocketId(receiverId);
            if(receiverId){
                io.to(receiverSocketId).emit("newMessage",newMessage)
            }

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error en el controlador de envio de mensajes", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMessages= async(req,res)=>{
    try{
        const{id:userToChatId}=req.params;
        const senderId=req.user.id_Trabajador;
        
        const conversationId = await findConversation(senderId, userToChatId);

        if (!conversationId) {
            return res.status(200).json([]);
        }

        // Obtener los mensajes de la conversación encontrada
        const messages = await getMessagess(conversationId);

        res.status(200).json(messages);
    } catch(error){
        console.log("Error en el controlador de obtencion de mensajes", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}