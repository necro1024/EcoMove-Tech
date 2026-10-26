const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Límite de solicitudes excedido desde esta IP. Intenta más tarde.' }
});
app.use('/api/', limitador);

const origenesPermitidos = [
  'https://necro1024.github.io/EcoMove-Tech/',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origenesPermitidos.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política de seguridad CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

const API_KEY_SECRETA = process.env.API_SECRET_KEY || 'HVFSXgdn8PgPZoPJ!T$n#';

app.use('/api', (req, res, next) => {
  const claveCliente = req.headers['x-api-key'];
  if (claveCliente !== API_KEY_SECRETA) {
    return res.status(403).json({ error: 'Acceso no autorizado: API Key ausente o inválida' });
  }
  next();
});

app.use(express.json({ limit: '50kb' }));

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, rol, referencia_id FROM usuarios WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/registro-cliente', async (req, res) => {
  const { nombre, email, password, telefono, direccion, dni } = req.body;
  try {
    const [clienteResult] = await db.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion, dni) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, telefono, direccion, dni]
    );
    const clienteId = clienteResult.insertId;

    await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol, referencia_id) VALUES (?, ?, ?, "cliente", ?)',
      [nombre, email, password, clienteId]
    );

    res.json({ message: 'Usuario y cliente registrado exitosamente', clienteId });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar: ' + err.message });
  }
});

app.get('/api/vehiculos/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM vehiculos WHERE cliente_id = ? ORDER BY id DESC',
      [req.params.clienteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehiculos', async (req, res) => {
  const { cliente_id, tipo_vehiculo, marca, modelo, numero_serie, voltaje_bateria } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO vehiculos (cliente_id, tipo_vehiculo, marca, modelo, numero_serie, voltaje_bateria) VALUES (?, ?, ?, ?, ?, ?)',
      [cliente_id, tipo_vehiculo, marca, modelo, numero_serie, voltaje_bateria]
    );
    res.json({ id: result.insertId, message: 'Vehículo registrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehiculos/:id', async (req, res) => {
  const { tipo_vehiculo, marca, modelo, numero_serie, voltaje_bateria } = req.body;
  try {
    await db.query(
      'UPDATE vehiculos SET tipo_vehiculo = ?, marca = ?, modelo = ?, numero_serie = ?, voltaje_bateria = ? WHERE id = ?',
      [tipo_vehiculo, marca, modelo, numero_serie, voltaje_bateria, req.params.id]
    );
    res.json({ message: 'Vehículo actualizado con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehiculos/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehículo dado de baja correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'No se puede eliminar: tiene servicios vinculados' });
  }
});

app.get('/api/solicitudes/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
            v.marca, v.modelo, v.tipo_vehiculo, v.numero_serie, v.voltaje_bateria,
            t.nombre AS tecnico_nombre,
            u.direccion_servicio, u.referencia
      FROM solicitudes_servicio s
      JOIN vehiculos v ON s.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON s.tecnico_id = t.id
      LEFT JOIN ubicaciones u ON u.solicitud_id = s.id
      WHERE s.cliente_id = ?
      ORDER BY s.id DESC
    `, [req.params.clienteId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/solicitudes', async (req, res) => {
  const { cliente_id, vehiculo_id, modalidad, falla_reportada, direccion, referencia, metodo_pago } = req.body;
  try {
    const [resSol] = await db.query(
      'INSERT INTO solicitudes_servicio (cliente_id, vehiculo_id, modalidad, falla_reportada, metodo_pago, estado_servicio) VALUES (?, ?, ?, ?, ?, "Pendiente")',
      [cliente_id, vehiculo_id, modalidad, falla_reportada, metodo_pago || 'Efectivo_Taller']
    );
    const solicitud_id = resSol.insertId;

    if (modalidad === 'Domicilio' && direccion) {
      await db.query(
        'INSERT INTO ubicaciones (solicitud_id, direccion_servicio, referencia) VALUES (?, ?, ?)',
        [solicitud_id, direccion, referencia || '']
      );
    }
    res.json({ id: solicitud_id, message: 'Solicitud creada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/solicitudes/admin', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
            c.nombre AS cliente_nombre, 
            v.marca, v.modelo, v.tipo_vehiculo,
            t.nombre AS tecnico_nombre,
            u.direccion_servicio, u.referencia
      FROM solicitudes_servicio s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN vehiculos v ON s.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON s.tecnico_id = t.id
      LEFT JOIN ubicaciones u ON u.solicitud_id = s.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/solicitudes/:id/asignar', async (req, res) => {
  const { tecnico_id } = req.body;
  try {
    await db.query(
      'UPDATE solicitudes_servicio SET tecnico_id = ?, estado_servicio = "Asignado" WHERE id = ?',
      [tecnico_id, req.params.id]
    );
    res.json({ message: 'Técnico asignado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tecnicos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id,
        t.nombre,
        t.especialidad,
        t.telefono,
        t.disponibilidad,
        CAST(COALESCE(SUM(CASE WHEN s.estado_servicio IN ('Asignado', 'En camino', 'Recibido') THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS trabajos_pendientes
      FROM tecnicos t
      LEFT JOIN solicitudes_servicio s ON s.tecnico_id = t.id
      GROUP BY t.id, t.nombre, t.especialidad, t.telefono, t.disponibilidad
      ORDER BY trabajos_pendientes ASC, t.nombre ASC
    `);

    const tecnicosLimpios = rows.map(t => ({
      ...t,
      trabajos_pendientes: parseInt(t.trabajos_pendientes, 10) || 0
    }));

    res.json(tecnicosLimpios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/repuestos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, c.nombre as categoria_nombre 
      FROM repuestos r
      LEFT JOIN categorias_repuesto c ON r.categoria_id = c.id
      WHERE r.stock_disponible > 0
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/solicitudes/tecnico/:tecnicoId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
            c.nombre AS cliente_nombre, 
            v.marca, v.modelo, v.tipo_vehiculo,
            u.direccion_servicio, u.referencia
      FROM solicitudes_servicio s
      JOIN clientes c ON s.cliente_id = c.id
      JOIN vehiculos v ON s.vehiculo_id = v.id
      LEFT JOIN ubicaciones u ON u.solicitud_id = s.id
      WHERE s.tecnico_id = ?
      ORDER BY s.id DESC
    `, [req.params.tecnicoId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/solicitudes/:id/estado', async (req, res) => {
  const { estado_servicio } = req.body;
  try {
    await db.query(
      'UPDATE solicitudes_servicio SET estado_servicio = ? WHERE id = ?',
      [estado_servicio, req.params.id]
    );
    res.json({ message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/solicitudes/:id/finalizar', async (req, res) => {
  const { id } = req.params;
  const { 
    estado_bateria, 
    estado_motor, 
    estado_frenos, 
    trabajo_realizado, 
    costo_mano_obra, 
    costo_final, 
    periodo_garantia,
    repuestos_usados 
  } = req.body;

  try {
    await db.query(
      'INSERT INTO diagnosticos (solicitud_id, estado_bateria, estado_motor, estado_frenos) VALUES (?, ?, ?, ?)',
      [id, estado_bateria, estado_motor, estado_frenos]
    );

    const [repResult] = await db.query(
      'INSERT INTO reparaciones (solicitud_id, trabajo_realizado, costo_mano_obra, costo_final, periodo_garantia_meses) VALUES (?, ?, ?, ?, ?)',
      [id, trabajo_realizado, costo_mano_obra, costo_final, periodo_garantia || 3]
    );
    const reparacionId = repResult.insertId;

    if (Array.isArray(repuestos_usados) && repuestos_usados.length > 0) {
      for (const item of repuestos_usados) {
        await db.query(
          'INSERT INTO reparacion_repuestos (reparacion_id, repuesto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
          [reparacionId, item.id, item.cantidad, item.subtotal]
        );
        await db.query(
          'UPDATE repuestos SET stock_disponible = stock_disponible - ? WHERE id = ?',
          [item.cantidad, item.id]
        );
      }
    }

    await db.query(
      'UPDATE solicitudes_servicio SET estado_servicio = "Finalizado" WHERE id = ?',
      [id]
    );

    res.json({ message: 'Atención finalizada con repuestos asentados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/historial/:clienteId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id AS orden_id,
        s.fecha_solicitud,
        s.modalidad,
        s.falla_reportada AS problema,
        s.estado_servicio,
        v.marca,
        v.modelo,
        v.tipo_vehiculo,
        v.numero_serie,
        v.voltaje_bateria,
        t.nombre AS tecnico_nombre,
        COALESCE(r.trabajo_realizado, 'Diagnóstico preventivo') AS trabajo_realizado,
        COALESCE(r.costo_final, 60.00) AS costo,
        COALESCE(d.estado_bateria, v.voltaje_bateria) AS bateria_medida,
        COALESCE(d.estado_motor, 'Operativo') AS estado_motor,
        COALESCE(d.estado_frenos, 'Calibrado') AS estado_frenos
      FROM solicitudes_servicio s
      JOIN vehiculos v ON s.vehiculo_id = v.id
      LEFT JOIN tecnicos t ON s.tecnico_id = t.id
      LEFT JOIN diagnosticos d ON d.solicitud_id = s.id
      LEFT JOIN reparaciones r ON r.solicitud_id = s.id
      WHERE s.cliente_id = ?
      ORDER BY s.id DESC
    `, [req.params.clienteId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor seguro corriendo en puerto ${PORT}`));