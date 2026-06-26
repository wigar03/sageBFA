-- ═══════════════════════════════════════════════════════════════════
-- SAGE-BFA: Data Seed Inicial para PostgreSQL
-- Archivo: import.sql (cargado automáticamente por Hibernate al inicio)
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1. Insertar el módulo de prueba base (ModuloPrueba)
--    Usa MappedSuperclass: se inserta directamente en ModuloPrueba.
-- ───────────────────────────────────────────────────────────────────

INSERT INTO ModuloPrueba (id, codigoModulo, nombre, tiempoLimiteMinutos, instrucciones) VALUES (1, 'N2', 'Test Numérico - Factor N2 (Operaciones y Problemas)', 12, 'Instrucciones del Módulo BFA - Factor N2: Operaciones y Problemas.');

-- ───────────────────────────────────────────────────────────────────
-- 2. Preguntas y Opciones de Respuesta
-- ───────────────────────────────────────────────────────────────────

-- === SECCIÓN: OPERACIONES (Preguntas 1 a 10, orden 1 a 10) ===

-- Pregunta 1 (Q57)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (1, 1, 'OPERACIONES', '\\\\square - 14{,}47 - 23{,}36 = 4', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (1, 'A', '42{,}83', false, 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (2, 'B', '41{,}83', true, 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (3, 'C', '41{,}73', false, 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (4, 'D', '42{,}73', false, 1);

-- Pregunta 2 (Q58)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (2, 2, 'OPERACIONES', '7{,}28 - 2{,}53 - \\\\square = 1{,}49', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (5, 'A', '5{,}37', false, 2);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (6, 'B', '3{,}36', false, 2);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (7, 'C', '3{,}27', false, 2);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (8, 'D', '3{,}26', true, 2);

-- Pregunta 3 (Q59)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (3, 3, 'OPERACIONES', '3{,}39 - 3{,}25 + \\\\square - 2{,}33 = 2', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (9, 'A', '3{,}29', false, 3);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (10, 'B', '2{,}38', false, 3);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (11, 'C', '4{,}19', true, 3);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (12, 'D', '5{,}58', false, 3);

-- Pregunta 4 (Q60)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (4, 4, 'OPERACIONES', '\\\\square - 12{,}68 + 18{,}89 - 1{,}89 = 28{,}89', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (13, 'A', '24{,}57', true, 4);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (14, 'B', '43{,}46', false, 4);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (15, 'C', '14{,}57', false, 4);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (16, 'D', '34{,}46', false, 4);

-- Pregunta 5 (Q61)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (5, 5, 'OPERACIONES', '\\\\frac{5{,}73 + 1{,}27}{5{,}63 + \\\\square} = 1', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (17, 'A', '1{,}27', false, 5);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (18, 'B', '1{,}47', false, 5);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (19, 'C', '1{,}17', false, 5);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (20, 'D', '1{,}37', true, 5);

-- Pregunta 6 (Q62)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (6, 6, 'OPERACIONES', '\\\\frac{7{,}54 + 3{,}08}{9{,}63 - \\\\square} = 3', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (21, 'A', '6{,}09', true, 6);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (22, 'B', '3{,}54', false, 6);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (23, 'C', '5{,}09', false, 6);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (24, 'D', '3{,}59', false, 6);

-- Pregunta 7 (Q63)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (7, 7, 'OPERACIONES', '\\\\frac{\\\\square \\\\times 6}{3} = 16{,}6', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (25, 'A', '6{,}3', false, 7);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (26, 'B', '8{,}3', true, 7);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (27, 'C', '9{,}3', false, 7);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (28, 'D', '7{,}3', false, 7);

-- Pregunta 8 (Q64)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (8, 8, 'OPERACIONES', '\\\\frac{2{,}6 \\\\times 0{,}37}{\\\\square} = 1', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (29, 'A', '0{,}872', false, 8);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (30, 'B', '0{,}952', false, 8);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (31, 'C', '0{,}962', true, 8);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (32, 'D', '0{,}862', false, 8);

-- Pregunta 9 (Q65)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (9, 9, 'OPERACIONES', '\\\\frac{1}{3} + \\\\square + \\\\frac{1}{6} = \\\\frac{7}{10}', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (33, 'A', '\\\\frac{1}{4}', false, 9);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (34, 'B', '\\\\frac{1}{5}', true, 9);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (35, 'C', '\\\\frac{1}{3}', false, 9);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (36, 'D', '\\\\frac{1}{6}', false, 9);

-- Pregunta 10 (Q66)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (10, 10, 'OPERACIONES', '\\\\frac{\\\\frac{1}{2} \\\\times \\\\frac{1}{3}}{\\\\square} = \\\\frac{2}{3}', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (37, 'A', '\\\\frac{3}{4}', false, 10);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (38, 'B', '\\\\frac{3}{2}', false, 10);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (39, 'C', '\\\\frac{5}{2}', false, 10);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (40, 'D', '\\\\frac{1}{4}', true, 10);


-- === SECCIÓN: PROBLEMAS (Preguntas 11 a 20, orden 1 a 10) ===

-- Pregunta 11 (Q69)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (11, 1, 'PROBLEMAS', 'Jaime tiene 28 bolas. Juan tiene 17 bolas más que Jaime. ¿Cuántas bolas tienen entre los dos?', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (41, 'A', '73 bolas', true, 11);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (42, 'B', '65 bolas', false, 11);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (43, 'C', '63 bolas', false, 11);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (44, 'D', '45 bolas', false, 11);

-- Pregunta 12 (Q70)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (12, 2, 'PROBLEMAS', 'Para su cumpleaños a Pablo le han regalado 36 bolas. Con el mismo gasto, ¿cuántas podrían haberle regalado si las bolas valiesen cuatro veces más caras?', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (45, 'A', '8 bolas', false, 12);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (46, 'B', '14 bolas', false, 12);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (47, 'C', '12 bolas', false, 12);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (48, 'D', '9 bolas', true, 12);

-- Pregunta 13 (Q71)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (13, 3, 'PROBLEMAS', 'En el mercado, compro 3 onzas de vainilla a 4 córdobas la onza y 5 pasteles a 3 córdobas cada uno. Pago con un billete de 50 córdobas, ¿Cuántos deben devolverme?', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (49, 'A', '33 córdobas', false, 13);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (50, 'B', '27 córdobas', false, 13);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (51, 'C', '23 córdobas', true, 13);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (52, 'D', '37 córdobas', false, 13);

-- Pregunta 14 (Q72)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (14, 4, 'PROBLEMAS', 'César murió en el —44 a la edad de 57 años. ¿Cuál es su año nacimiento?', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (53, 'A', '+ 13', false, 14);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (54, 'B', '— 101', true, 14);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (55, 'C', '— 91', false, 14);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (56, 'D', '+ 101', false, 14);

-- Pregunta 15 (Q73)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (15, 5, 'PROBLEMAS', 'El historiador romano Tito Livio nació en el —59, murió a la edad de 75 años. ¿Cuál es el año de su muerte?', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (57, 'A', '+ 15', false, 15);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (58, 'B', '+ 16', false, 15);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (59, 'C', '+ 17', true, 15);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (60, 'D', '+ 18', false, 15);

-- Pregunta 16 (Q74)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (16, 6, 'PROBLEMAS', 'Dar un número que sea divisible a la vez por 7 y 17.', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (61, 'A', '38', false, 16);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (62, 'B', '119', true, 16);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (63, 'C', '139', false, 16);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (64, 'D', '57', false, 16);

-- Pregunta 17 (Q75)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (17, 7, 'PROBLEMAS', 'Cuánto debemos sumar al numerador de la fracción \\\\frac{5}{24} para hacerla igual a \\\\frac{2}{3}.', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (65, 'A', '10', false, 17);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (66, 'B', '11', true, 17);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (67, 'C', '3', false, 17);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (68, 'D', '8', false, 17);

-- Pregunta 18 (Q76)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (18, 8, 'PROBLEMAS', 'Encontrar un número que sea igual a la mitad de la diferencia entre el cuadrado de 6 y el producto de 4 por el resto de la división de 26 por 7.', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (69, 'A', '12', false, 18);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (70, 'B', '6', false, 18);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (71, 'C', '16', false, 18);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (72, 'D', '8', true, 18);

-- Pregunta 19 (Q77)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (19, 9, 'PROBLEMAS', 'Dar el resultado de la diferencia entre el cuadrado de 3 y el cociente de \\\\frac{3}{2} por \\\\frac{5}{2}.', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (73, 'A', '1,2', false, 19);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (74, 'B', '8.4', true, 19);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (75, 'C', '1,5', false, 19);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (76, 'D', '7.3', false, 19);

-- Pregunta 20 (Q78)
INSERT INTO Pregunta (id, orden, seccion, enunciado, modulo_prueba_id) VALUES (20, 10, 'PROBLEMAS', 'Qué número es igual al tercio del producto de la suma de los dos productos \\\\left( \\\\frac{2}{3} \\\\times 9 \\\\right) y \\\\left( \\\\frac{15}{2} \\\\times \\\\frac{2}{5} \\\\right) por la diferencia entre los dos productos 4 \\\\times 3 y \\\\left( \\\\frac{2}{3} \\\\times 12 \\\\right).', 1);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (77, 'A', '6', false, 20);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (78, 'B', '13', false, 20);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (79, 'C', '9', false, 20);
INSERT INTO OpcionRespuesta (id, literal, textoOpcion, esCorrecta, pregunta_id) VALUES (80, 'D', '12', true, 20);


-- ───────────────────────────────────────────────────────────────────
-- 3. Tabla del Baremo Nacional (Mapeo estricto del factor N2 y Pt.)
-- ───────────────────────────────────────────────────────────────────

INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (1, 13, 16, 99, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (2, 11, 12, 97, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (3, 9, 10, 95, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (4, 8, 8, 90, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (5, 7, 7, 85, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (6, 6, 6, 75, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (7, 5, 5, 60, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (8, 4, 4, 45, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (9, 3, 3, 35, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (10, 2, 2, 15, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (11, 1, 1, 5, NULL, 1);
INSERT INTO BaremoNacional (id, puntuacionDirectaMinima, puntuacionDirectaMaxima, percentil, nivelEstudio, modulo_prueba_id) VALUES (12, 0, 0, 1, NULL, 1);


-- ───────────────────────────────────────────────────────────────────
-- 4. Sincronizar secuencias de PostgreSQL con los IDs insertados
--    (necesario porque usamos IDENTITY con valores explícitos)
-- ───────────────────────────────────────────────────────────────────

SELECT setval(pg_get_serial_sequence('moduloprueba', 'id'), (SELECT COALESCE(MAX(id), 1) FROM ModuloPrueba));
SELECT setval(pg_get_serial_sequence('pregunta', 'id'), (SELECT COALESCE(MAX(id), 1) FROM Pregunta));
SELECT setval(pg_get_serial_sequence('opcionrespuesta', 'id'), (SELECT COALESCE(MAX(id), 1) FROM OpcionRespuesta));
SELECT setval(pg_get_serial_sequence('baremonacional', 'id'), (SELECT COALESCE(MAX(id), 1) FROM BaremoNacional));

-- ───────────────────────────────────────────────────────────────────
-- 5. Limpieza de módulos descontinuados de la tabla interna de NaviOX
-- ───────────────────────────────────────────────────────────────────
DELETE FROM oxroles_modules WHERE module_name IN ('Pregunta', 'BaremoNacional', 'Psicologo', 'UsuarioAdministrativo', 'OpcionRespuesta', 'RespuestaCandidato', 'Usuario');
DELETE FROM oxmodules WHERE name IN ('Pregunta', 'BaremoNacional', 'Psicologo', 'UsuarioAdministrativo', 'OpcionRespuesta', 'RespuestaCandidato', 'Usuario');

