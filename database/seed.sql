-- =====================================================================
-- Datos iniciales. IDs FIJOS: el equipo puede usarlos en Godot.
--   Planetas:  1 = Luna, 2 = Marte, 3 = Asteroides
--   Misiones:  1 = Luna, 2 = Marte, 3 = Asteroides
-- Los valores numéricos son ficticios y configurables (balance).
-- =====================================================================
USE mission_control;

INSERT INTO planetas (id, nombre, descripcion, dificultad) VALUES
 (1, 'Luna',        'Viaje corto. Ideal para la primera misión.',      1),
 (2, 'Marte',       'Viaje largo con mayor consumo de recursos.',      3),
 (3, 'Asteroides',  'Ruta con obstáculos y decisiones de navegación.', 4);

INSERT INTO misiones (id, planeta_id, titulo, objetivo, presupuesto_base, activa) VALUES
 (1, 1, 'Reconocimiento lunar', 'Tomar muestras y completar un reconocimiento de la superficie.', 100, 1),
 (2, 2, 'Exploración marciana', 'Analizar el terreno y registrar datos científicos.',             120, 1),
 (3, 3, 'Estudio de asteroide', 'Estudiar la composición de un asteroide.',                       110, 1);

INSERT INTO componentes_nave
 (id, nombre, tipo, descripcion, masa, costo, consumo_energia, capacidad_combustible, empuje, generacion_energia) VALUES
 (1,  'Motor Químico Básico', 'motor',        'Motor económico y confiable.',          100, 20,  0,   0, 30,  0),
 (2,  'Motor Iónico',         'motor',        'Ligero y eficiente, empuje bajo.',       60, 35,  0,   0, 20,  0),
 (3,  'Motor Pesado',         'motor',        'Mucho empuje, caro y pesado.',          180, 45,  0,   0, 60,  0),
 (4,  'Tanque Pequeño',       'tanque',       'Almacena poco combustible.',             40,  8,  0,  30,  0,  0),
 (5,  'Tanque Mediano',       'tanque',       'Capacidad intermedia.',                  80, 14,  0,  60,  0,  0),
 (6,  'Tanque Grande',        'tanque',       'Gran alcance, mucha masa.',             140, 22,  0, 100,  0,  0),
 (7,  'Cámara Óptica',        'instrumento',  'Toma imágenes de la superficie.',        15, 10,  5,   0,  0,  0),
 (8,  'Espectrómetro',        'instrumento',  'Analiza la composición del terreno.',    30, 18, 12,   0,  0,  0),
 (9,  'Taladro de Muestras',  'instrumento',  'Recolecta muestras del suelo.',          50, 15, 10,   0,  0,  0),
 (10, 'Sensor de Radiación',  'instrumento',  'Mide radiación del entorno.',            20,  9,  6,   0,  0,  0),
 (11, 'Panel Solar',          'energia',      'Genera electricidad para los sistemas.', 25, 12,  0,   0,  0, 20),
 (12, 'Antena Básica',        'comunicacion', 'Comunicación de corto alcance.',         10,  6,  3,   0,  0,  0),
 (13, 'Antena Alta Ganancia', 'comunicacion', 'Comunicación de largo alcance.',         25, 14,  6,   0,  0,  0);

-- ---------- Datos DEMO (para que Angular muestre algo desde el inicio) ----------
INSERT INTO usuarios (id, nombre) VALUES
 (1, 'Piloto Demo'),
 (2, 'Capitana Lira'),
 (3, 'Comandante Orión');

INSERT INTO naves (id, usuario_id, nombre, masa_total, costo_total) VALUES
 (1, 1, 'Explorador I', 230, 62),
 (2, 2, 'Halcón Lunar', 265, 67),
 (3, 3, 'Ares Prime',   220, 93);

INSERT INTO nave_componentes (nave_id, componente_id, cantidad) VALUES
 (1, 1, 1), (1, 5, 1), (1, 7, 1), (1, 11, 1), (1, 12, 1),
 (2, 1, 1), (2, 5, 1), (2, 9, 1), (2, 11, 1), (2, 12, 1),
 (3, 2, 1), (3, 5, 1), (3, 8, 1), (3, 11, 1), (3, 13, 1);

INSERT INTO resultados_mision
 (usuario_id, mision_id, nave_id, puntuacion, estado, combustible_final, energia_final, duracion_segundos) VALUES
 (1, 1, 1, 850, 'completed', 35.00, 42.00, 420),
 (2, 1, 2, 720, 'completed', 20.00, 30.00, 380),
 (3, 2, 3, 300, 'failed',     0.00, 12.00, 600),
 (1, 3, 1, 540, 'completed', 15.50, 25.00, 510),
 (3, 1, 3, 910, 'completed', 48.00, 55.00, 350);
