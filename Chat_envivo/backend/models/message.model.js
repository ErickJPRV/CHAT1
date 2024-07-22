import mssql from 'mssql';
import conectarALaBaseDeDatos from '../db/connectsqlserver.js';

export const getMessagess = async (conversationId) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);

        const result = await request
            .input('conversationId', mssql.Int, conversationId)
            .query(`
                SELECT message_id AS id, conversation_id, sender_id AS senderId, receiver_id AS receiverId, message, created_at AS createdAt
                FROM Messages
                WHERE conversation_id = @conversationId
                ORDER BY created_at ASC;
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error en obtener mensaje', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};
export const createMessage = async (conversationId, userId, content) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);

        await request
            .input('conversationId', mssql.Int, conversationId)
            .input('userId', mssql.Int, userId)
            .input('content', mssql.NVarChar(mssql.MAX), content)
            .query(`
                INSERT INTO Messages (conversation_id, user_id, content)
                VALUES (@conversationId, @userId, @content);
            `);
    } catch (error) {
        console.error('Error en crear mensaje:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};
export const addParticipant = async (conversationId, userId) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);

        await request
            .input('conversationId', mssql.Int, conversationId)
            .input('userId', mssql.Int, userId)
            .query(`
                INSERT INTO Participants (conversation_id, user_id)
                VALUES (@conversationId, @userId);
            `);
    } catch (error) {
        console.error('Error en añadir participante', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};
export const addMessageToConversation = async (conversationId, senderId, receiverId, message) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);

        // Insertar el nuevo mensaje en la tabla Messages
        const result = await request
            .input('conversationId', mssql.Int, conversationId)
            .input('senderId', mssql.Int, senderId)
            .input('receiverId', mssql.Int, receiverId)
            .input('message', mssql.NVarChar, message)
            .query(`
                INSERT INTO Messages (conversation_id, sender_id, receiver_id, message, created_at)
                OUTPUT INSERTED.message_id AS id, 
                       INSERTED.sender_id AS senderId, 
                       INSERTED.receiver_id AS receiverId, 
                       INSERTED.message AS message, 
                       INSERTED.created_at AS createdAt
                VALUES (@conversationId, @senderId, @receiverId, @message, GETDATE())
            `);

        const newMessage = result.recordset[0];

        // Actualizar la fecha de actualización de la conversación
        await request
            .input('updateConversationId', mssql.Int, conversationId) // Cambia el nombre del parámetro para evitar conflictos
            .query(`
                UPDATE Conversations
                SET updated_at = GETDATE()
                WHERE conversation_id = @updateConversationId
            `);

        return newMessage;
    } catch (error) {
        console.error('Error en añadir mensaje a la conversacion', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};
export const createConversation = async (senderId, receiverId) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);

        // Insertar una nueva conversación
        const result = await request.query(`
            INSERT INTO Conversations (created_at, updated_at)
            OUTPUT INSERTED.conversation_id
            VALUES (GETDATE(), GETDATE())
        `);

        const conversationId = result.recordset[0].conversation_id;

        // Insertar participantes
        await request
            .input('conversationId', mssql.Int, conversationId)
            .input('senderId', mssql.Int, senderId)
            .input('receiverId', mssql.Int, receiverId)
            .query(`
                INSERT INTO Participants (conversation_id, user_id)
                VALUES (@conversationId, @senderId),
                       (@conversationId, @receiverId)
            `);

        return conversationId;
    } catch (error) {
        console.error('Error en crear la conversacion:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};
export const findConversation = async (senderId, receiverId) => {
    let connection;
    try {
        connection = await conectarALaBaseDeDatos();
        const request = new mssql.Request(connection);
  
        // Consulta SQL para encontrar la conversación
        const result = await request
            .input('senderId', mssql.Int, senderId)
            .input('receiverId', mssql.Int, receiverId)
            .query(`
                SELECT p1.conversation_id
                FROM Participants p1
                JOIN Participants p2 ON p1.conversation_id = p2.conversation_id
                WHERE p1.user_id = @senderId AND p2.user_id = @receiverId
                GROUP BY p1.conversation_id
                HAVING COUNT(DISTINCT p1.user_id) = 1 AND COUNT(DISTINCT p2.user_id) = 1
            `);
        return result.recordset.length > 0 ? result.recordset[0].conversation_id : null;
    } catch (error) {
        console.error('Error en encontrar la conversacion:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.close(); // Cierra la conexión después de la consulta
        }
    }
};