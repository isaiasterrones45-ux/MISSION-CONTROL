-- =====================================================================
-- MISSION CONTROL: SPACE SIMULATOR  |  Esquema MySQL (v1)
-- Requiere MySQL 8.0.16+ (para que se apliquen los CHECK)
-- Se puede ejecutar varias veces: borra y recrea las tablas.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS mission_control
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mission_control;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS resultados_mision;
DROP TABLE IF EXISTS nave_componentes;
DROP TABLE IF EXISTS naves;
DROP TABLE IF EXISTS componentes_nave;
DROP TABLE IF EXISTS misiones;
DROP TABLE IF EXISTS planetas;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(50)  NOT NULL,
  correo         VARCHAR(100) NULL,
  password_hash  VARCHAR(255) NULL,            -- solo si se implementa login
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_nombre (nombre),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB;

CREATE TABLE planetas (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)  NOT NULL,
  descripcion TEXT         NULL,
  dificultad  TINYINT UNSIGNED NOT NULL,       -- 1 (fácil) a 5 (difícil)
  PRIMARY KEY (id),
  UNIQUE KEY uq_planetas_nombre (nombre),
  CONSTRAINT ck_planetas_dificultad CHECK (dificultad BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE misiones (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  planeta_id       INT UNSIGNED NOT NULL,
  titulo           VARCHAR(100) NOT NULL,
  objetivo         TEXT         NOT NULL,
  presupuesto_base INT UNSIGNED NOT NULL,
  activa           TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_misiones_planeta (planeta_id),
  CONSTRAINT fk_misiones_planeta FOREIGN KEY (planeta_id) REFERENCES planetas(id),
  CONSTRAINT ck_misiones_presupuesto CHECK (presupuesto_base > 0)
) ENGINE=InnoDB;

CREATE TABLE componentes_nave (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre                VARCHAR(80)  NOT NULL,
  tipo                  ENUM('motor','tanque','instrumento','energia','comunicacion') NOT NULL,
  descripcion           VARCHAR(255) NULL,
  masa                  INT UNSIGNED NOT NULL,
  costo                 INT UNSIGNED NOT NULL,
  consumo_energia       INT UNSIGNED NOT NULL DEFAULT 0,
  capacidad_combustible INT UNSIGNED NOT NULL DEFAULT 0,
  empuje                INT UNSIGNED NOT NULL DEFAULT 0,   -- solo motores
  generacion_energia    INT UNSIGNED NOT NULL DEFAULT 0,   -- solo paneles/energía
  PRIMARY KEY (id),
  UNIQUE KEY uq_componentes_nombre (nombre),
  KEY idx_componentes_tipo (tipo)
) ENGINE=InnoDB;

CREATE TABLE naves (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id     INT UNSIGNED NOT NULL,
  nombre         VARCHAR(80)  NOT NULL,
  masa_total     INT UNSIGNED NOT NULL,
  costo_total    INT UNSIGNED NOT NULL,
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_naves_usuario (usuario_id),
  CONSTRAINT fk_naves_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE nave_componentes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nave_id       INT UNSIGNED NOT NULL,
  componente_id INT UNSIGNED NOT NULL,
  cantidad      INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nave_componente (nave_id, componente_id),
  CONSTRAINT fk_nc_nave FOREIGN KEY (nave_id) REFERENCES naves(id) ON DELETE CASCADE,
  CONSTRAINT fk_nc_componente FOREIGN KEY (componente_id) REFERENCES componentes_nave(id),
  CONSTRAINT ck_nc_cantidad CHECK (cantidad >= 1)
) ENGINE=InnoDB;

CREATE TABLE resultados_mision (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id        INT UNSIGNED NOT NULL,
  mision_id         INT UNSIGNED NOT NULL,
  nave_id           INT UNSIGNED NOT NULL,
  puntuacion        INT UNSIGNED NOT NULL,
  estado            ENUM('completed','failed','aborted') NOT NULL,
  combustible_final DECIMAL(5,2) NOT NULL,
  energia_final     DECIMAL(5,2) NOT NULL,
  duracion_segundos INT UNSIGNED NOT NULL,
  client_ref        VARCHAR(64)  NULL,         -- evita guardar dos veces la misma partida
  fecha             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resultados_client_ref (client_ref),
  KEY idx_resultados_usuario (usuario_id),
  KEY idx_resultados_mision (mision_id),
  KEY idx_resultados_fecha (fecha),
  KEY idx_resultados_puntuacion (puntuacion),
  CONSTRAINT fk_res_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_res_mision  FOREIGN KEY (mision_id)  REFERENCES misiones(id),
  CONSTRAINT fk_res_nave    FOREIGN KEY (nave_id)    REFERENCES naves(id),
  CONSTRAINT ck_res_combustible CHECK (combustible_final BETWEEN 0 AND 100),
  CONSTRAINT ck_res_energia     CHECK (energia_final BETWEEN 0 AND 100)
) ENGINE=InnoDB;
