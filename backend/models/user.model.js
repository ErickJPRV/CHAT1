import mssql from 'mssql';
import conectarALaBaseDeDatos from '../db/connectsqlserver.js';

const config = {
  user: 'Administrador',
          password: 'er9865289.',
          server: 'proyecto7.database.windows.net',
          port: 1433,
          database: 'Proyecto',
          options: {
              encrypt: true,
              enableArithAbort: true,
          },
};

const poolPromise = mssql.connect(config).then(pool => {
  console.log('Connected to SQL Server');
  return pool;
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

export const findUserById = async (userId) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', mssql.Int, userId);
    const result = await request.query("SELECT id_Trabajador,Nombres, Apellidos, Cargo,ImageUrl FROM Trabajador WHERE id_Trabajador = @userId");

    if (result.recordset.length > 0) {
      return result.recordset[0];
    } else {
      console.log('Usuario no encontrado');
      return null;
    }
  } catch (err) {
    console.error('Error al encontrar el usuario:', err);
    return null;
  }
};

export const getUsersForSidebarcontroller = async (loggedInUserId) => {
  try {
    await conectarALaBaseDeDatos(); // Conectar directamente en cada función
    const request = new mssql.Request();
    request.input('loggedInUserId', mssql.Int, loggedInUserId);
    const result = await request.query(`
      SELECT 
        id_Trabajador AS id, 
        Nombres AS fullName, 
        Apellidos AS lastName, 
        Cargo AS position, 
        ImageUrl AS profilePic
      FROM Trabajador
      WHERE id_Trabajador != @loggedInUserId
    `);
    return result.recordset;
  } catch (error) {
    console.error('Error getting users for sidebar:', error);
    throw error;
  }
};
