import express from 'express';
import path from 'path';
const router = express.Router();

router.get('/Empleado.html', (req, res) => {
  if (req.session.trabajador) {
    const trabajador = req.session.trabajador;
    res.sendFile(path.join(process.cwd(), 'server', 'Interfaz_trabajador', 'Empleado.html'));
  } else {
    res.status(401).send('No autorizado');
  }
});

// Nueva ruta para obtener datos del trabajador como JSON
router.get('/obtenerDatosTrabajador', (req, res) => {
  if (req.session.trabajador) {
    const trabajador = req.session.trabajador;
    // Enviar los datos del trabajador como JSON al cliente
    res.json(trabajador);
  } else {
    res.status(401).send('No autorizado');
  }
});

export default router;