-- Tablas y datos para migrar de Firebase a Supabase
-- Ejecutar este SQL en el panel de Supabase > SQL Editor

-- ============================================
-- CREAR TABLAS
-- ============================================

-- Tabla de configuración (settings)
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'config',
    nombre_local TEXT DEFAULT 'EL TACHI Rotisería',
    horarios_por_dia JSONB DEFAULT '{"lunes": "11:00 - 23:00", "martes": "11:00 - 23:00", "miercoles": "11:00 - 23:00", "jueves": "11:00 - 23:00", "viernes": "11:00 - 00:00", "sábado": "11:00 - 00:00", "domingo": "11:00 - 23:00"}',
    abierto BOOLEAN DEFAULT true,
    mensaje_cerrado TEXT DEFAULT 'Lo sentimos, estamos cerrados en este momento.',
    precio_envio INTEGER DEFAULT 300,
    tiempo_base_estimado INTEGER DEFAULT 30,
    retiro_habilitado BOOLEAN DEFAULT true,
    colores_marca JSONB DEFAULT '{"azul": "#1e40af", "amarillo": "#f59e0b"}',
    telefono_whatsapp TEXT DEFAULT '5491122334455',
    api_key_gemini TEXT DEFAULT '',
    mantener_historial_dias INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    icono TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria TEXT,
    disponible BOOLEAN DEFAULT true,
    aderezos_disponibles TEXT[],
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    id_pedido TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    nombre_cliente TEXT,
    telefono TEXT,
    tipo_pedido TEXT DEFAULT 'retiro',
    direccion TEXT,
    pedido_detallado TEXT,
    items JSONB,
    comentarios TEXT,
    subtotal DECIMAL(10,2) DEFAULT 0,
    precio_envio INTEGER DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    estado TEXT DEFAULT 'Recibido',
    tiempo_estimado_actual INTEGER DEFAULT 30,
    user_id TEXT,
    user_email TEXT,
    user_name TEXT,
    user_photo_url TEXT,
    is_registered_user BOOLEAN DEFAULT false,
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    is_admin BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    rol TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Tabla de contadores
CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY DEFAULT 'orders',
    last_number INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo TEXT,
    mensaje TEXT,
    pedido_id TEXT,
    leido BOOLEAN DEFAULT false,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de prueba
CREATE TABLE IF NOT EXISTS test (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERTAR DATOS
-- ============================================

-- Insertar configuración por defecto
INSERT INTO settings (id, nombre_local) VALUES ('config', 'EL TACHI Rotisería')
ON CONFLICT (id) DO NOTHING;

-- Insertar contador inicial
INSERT INTO counters (id, last_number) VALUES ('orders', 0)
ON CONFLICT (id) DO NOTHING;

-- Insertar usuario admin
INSERT INTO admins (id, email, nombre, is_admin, activo, rol) 
VALUES ('bae2d67c-0fec-43ec-8b04-361404e0b945', 'admin@gmail.com', 'Admin', true, true, 'admin')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERTAR CATEGORÍAS
-- ============================================
INSERT INTO categories (id, nombre, orden) VALUES
('3rzzXodjmigAAbm9JZUK', '🍕 Pizzas', 2),
('piAWHHJ7sgylmhmm43TQ', '🥪 Carlitos', 3),
('g1KKmGEWPN08eMTXlotG', '🍔 Hamburguesas o Bifes Chorizos (con papas)', 4),
('kGcU2bEJhBxDxpbwSu5o', '🥪 Torpedos (con papas)', 4),
('5SR7cNdUyornmukKiDxp', '🥟 Empanadas', 5),
('CTzHNy5fuEli27jVDqd3', '🍔 Familiares (con papas)', 5),
('2D2TSadkH1qRJGKhDsce', '🍟 Papas Fritas', 6),
('ZtHiKfv1UaF8fdvC4uLu', '🍽️ Pizzanesa para 3 Personas', 7),
('uwjq5PHomO97rx2hQYq6', '🍽️ Pizzanesa para 2 Personas', 8),
('TVVOqLfmBq4EtrGjohMe', 'Al Plato', 9),
('acompañamientos', 'Acompañamientos', 9),
('8RbEvu6qdzVnSlULlwye', 'Gaseosas – Descartables', 10),
('hI30xuxgVydPG6Gn1YSh', '🥤 Gaseosas – Retornables', 11),
('vs09QccM6ccgwLAx1luN', '🧃 Jugos', 12),
('JP2aTFxROM2tAeYOTXOj', 'Otras gaseosas', 13),
('KwjA1eXl5cTg8rkp77Fo', 'Cervezas – Botellas', 14),
('I1IyfzVrJJmjpdDa9IXC', '🍺 Cervezas – Latas', 15),
('XjTxoQvz2Q9PmImUNxuh', '⚡ Energizantes y otros', 16),
('J2QdDONrik4vOuLHAm7o', '🍷 Vinos caja', 17)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERTAR PRODUCTOS
-- ============================================
INSERT INTO products (id, nombre, descripcion, precio, categoria, disponible, aderezos_disponibles) VALUES
('0FnKbZVX51CDHDdsP7uB', 'Pizza 1/2 Salame', 'Muzzarella y salame', 4500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('1K086nbzzyFEDLpAIztW', 'Torpedo Especial Hamburguesa (2)', '', 10900, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('1sYsDun8G4e0KnEISMgZ', 'Carlito Especial', 'Jamón, queso, ketchup, huevo rallado, morrón', 7500, 'piAWHHJ7sgylmhmm43TQ', true, ARRAY[]::TEXT[]),
('3079tK6B23RO3gmPxpt6', 'Sprite x 1,5L', '', 3500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('48CNTiTbEintb7tzsP3v', 'Baggio Fresh', '', 1300, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('4M6AV08qssVtfH5jiOf6', 'Fanta x 2L', '', 3000, 'hI30xuxgVydPG6Gn1YSh', true, ARRAY[]::TEXT[]),
('4mhaYyOfHXMfVFGh3DYD', 'Empanada de Pollo', '', 1100, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('58L6TxOZvdgdGnwXp3lG', 'Torpedo Especial Milanesa', '', 12500, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('5Co56pnqZdxGMJ2uCVbl', 'Agua x 1,5L', '', 1000, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('5IzxMKhHyydOCKLBx9Bf', 'Familiar Común Suprema', '', 6000, 'CTzHNy5fuEli27jVDqd3', true, ARRAY[]::TEXT[]),
('5kBVodcyI6tujsMHpovL', 'Saborizada 500cc', '', 650, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('72w1OpmfJqkCXZ3lwofP', 'Pizzanesa Carne Roquefort (3)', '', 25000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('739Dr9nAtJN6Mf0H2w2s', 'Termidor Blanco', '', 1600, 'J2QdDONrik4vOuLHAm7o', true, ARRAY[]::TEXT[]),
('78Ej7bFpSxUgb4JSfXXm', 'Pizzanesa Carne Especial (2 Personas)', '', 16500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('8xeWxqONipzqwj4vi9xK', 'Pizza Dante', 'Salsa de tomate, queso muzzarella y toppings especiales', 9000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('A6XIWakf16WHXn5PNxVi', 'Bandeja Mediana', '', 4000, '2D2TSadkH1qRJGKhDsce', true, ARRAY[]::TEXT[]),
('Awe5lLVEcKU0oHsFkNKo', 'Torpedo Especial Hamburguesa (3)', '', 12000, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('C0SHpBArTTwnLVAyf4Yo', 'Sprite lata', '', 1400, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('DmH3ZaqcNmTZG4ORVdyW', 'Familiar Común Milanesa', '', 6500, 'CTzHNy5fuEli27jVDqd3', true, ARRAY[]::TEXT[]),
('E68tipIW25FMSdT54Dqi', 'Lata Brahma', '', 1600, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('F3Moag8CJ8nwAIdtMZWf', 'Pizzanesa Pollo Napolitana (3)', '', 23000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('FdQDafaVQtjfM7BZNIRl', 'Pizza Salame', 'Muzzarella y salame', 8500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('FpwUGY84gzzknMwdmv60', 'Pizzanesa Carne Salame (2 Personas)', '', 16500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('GGHYKKY0BO5YokKy0hkS', 'Doble Cola x 3L', '', 2100, 'JP2aTFxROM2tAeYOTXOj', true, ARRAY[]::TEXT[]),
('GbMRZiJAYGq7zI7zW5Xv', 'Pizzanesa Carne Bomba (3)', '', 25000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('HFuPzJnmsya83msHm0AM', 'Pizzanesa Pollo Especial (2 Personas)', '', 15500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('Hfvw7MehJm2I1lnFk5cC', 'Casoni', '', 1100, 'J2QdDONrik4vOuLHAm7o', true, ARRAY[]::TEXT[]),
('HgMWPRCVOI3ltiVKNCUL', 'Gatorade x 500cc', '', 1400, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('HjGmXIqBI5mvVKaSNeQn', 'Fanta lata', '', 1400, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('Hnlx9u8dEaMXi4MZmHUP', 'Pizzanesa Pollo Bomba (2 Personas)', '', 16500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('I47HuramHSZkB8PZhz0V', 'Pizzanesa Pollo Salame (2 Personas)', '', 15500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('IbZ29ZwbDPGe2Eo42qZX', 'Lata 1890', '', 1500, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('IoccmLjLDeXUKCevygOq', 'Sprite x 2L', '', 3000, 'hI30xuxgVydPG6Gn1YSh', true, ARRAY[]::TEXT[]),
('JioK1Yiv8KW8wr4VCrQP', 'Pizzanesa Pollo Bomba (3)', '', 24000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('JqJXB4TpzQG9TtF6DKAn', 'Milanesa con Papas', '', 5000, 'TVVOqLfmBq4EtrGjohMe', true, ARRAY[]::TEXT[]),
('L3mZHo2JPfrm2HLyJZWO', 'Termidor Tinto', '', 1900, 'J2QdDONrik4vOuLHAm7o', true, ARRAY[]::TEXT[]),
('LDDzQH6wlFSWH7ZJa6T0', 'Pizzanesa Carne Muzzarella (3)', '', 22000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('LM9f3KdRjbrHgQOaEgY8', 'Empanada de Carne', '', 1100, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('LRhWm3n8wAC8S4VZKBTB', 'Pizza Muzza con Jamón', 'Salsa de tomate, queso muzzarella y jamón', 7500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('M3HeTvBeXxn4M9jnYVSr', 'Pizzanesa Carne Roquefort (2 Personas)', '', 17000, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('MFjprcUwmp2ufEKQfERt', 'Quilmes 1L', '', 2900, 'KwjA1eXl5cTg8rkp77Fo', true, ARRAY[]::TEXT[]),
('MzhpBlXj6GXbdbnTLgJK', '361 descartable', '', 2000, 'KwjA1eXl5cTg8rkp77Fo', true, ARRAY[]::TEXT[]),
('NEbPHf9gJQJUtYXs1GnN', 'Pizzanesa Pollo Napolitana (2 Personas)', '', 15500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('No2L1ak33ykxcO09gWYd', 'Pizzanesa Pollo Roquefort (2 Personas)', '', 16500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('O84tgEQRDhPUH3j2YQx8', 'Baggio x 1L', '', 1700, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('OwdZCSaetbAjvLnb9TOx', 'Pizzanesa Carne Especial (3)', '', 24000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('P0M7HbovsHQxvCkhaSnz', 'Coca x 2,5L', '', 4500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('PbvxtQJhNEc0RDGsSY9z', 'Fanta x 1,5L', '', 3500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('QVVlUnSHXQKx94SGwPZI', 'Pizzanesa Carne Muzzarella (2 Personas)', '', 15000, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('R0t2qjBT6KY25AP37siZ', 'Coca lata', '', 1400, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('R8LEpH2Ine5PFasQ5WeQ', 'Pizzanesa Carne Napolitana (2 Personas)', '', 16500, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('RFnSL2qEO60TFggG1RTR', 'Brahma 1L', '', 2900, 'KwjA1eXl5cTg8rkp77Fo', true, ARRAY[]::TEXT[]),
('RO4sxmrDmG2Zg5kvnM30', 'Speed grande', '', 2500, 'XjTxoQvz2Q9PmImUNxuh', true, ARRAY[]::TEXT[]),
('Rfvk1RhVXg0kPKMKHHNR', 'Lata Isenbeck', '', 1400, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('RykrBglBw56t4YNUML5R', 'Familiar Especial Suprema', '', 6500, 'CTzHNy5fuEli27jVDqd3', true, ARRAY[]::TEXT[]),
('SBsW8DmysZRFiekOocic', 'Coca vidrio chica', '', 1000, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('SVpDU21XelttN9FklqZO', 'Pizza Viena', 'Muzzarella, salchicha y huevo revuelto', 8500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('U0wBk55exZ1AJcuXmuGq', 'Pizza 1/2 Va como Piña', 'Muzzarella, huevo frito y papas fritas', 5000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('V10ND4j1xwqEdKeTD4pQ', 'Docena de Empanadas', '', 13000, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('VFyp6nltYXaVwu86f1O0', 'Pizza Napolitana', 'Muzzarella, tomate, ajo', 8000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('VRiLoQy1WffU9eU7bZqc', 'Cunnington', '', 1500, 'JP2aTFxROM2tAeYOTXOj', true, ARRAY[]::TEXT[]),
('VSivQo4YbHBTUZPMtacz', 'Pizzanesa Pollo Salame (3)', '', 23000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('VeN6AFfMTSxhmW98NNAY', 'Pizzanesa Carne Bomba (2 Personas)', '', 17000, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('WwA2iKeafV3fcEGFiFHc', 'Torpedo Vegetariano', '', 7500, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('XDk1g1xp0NdkedwVdrPh', 'Pizzanesa Pollo Roquefort (3)', '', 24000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('XDyhmzbEjtlDNJl0Wqlf', 'Carlito Común', 'Jamón, queso y ketchup', 6500, 'piAWHHJ7sgylmhmm43TQ', true, ARRAY[]::TEXT[]),
('XL2C9qwsXjEPFJCnE99v', 'Adicional Papas Fritas', '', 1500, 'piAWHHJ7sgylmhmm43TQ', true, ARRAY[]::TEXT[]),
('Y0Gumh3ZoC6Hzs7wrk60', 'Lata 361', '', 1300, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('ZJGvAS8hQPVFhU42CRYP', 'Pizza Especial', 'Jamón, muzzarella, huevo, morrón', 8000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('ZbQCM3FB9cQb9DMkdLen', 'Pizza 1/2 Dante', 'Salsa de tomate, queso muzzarella y toppings especiales', 5000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('ZpG9XZebloDWc047QbaF', '1/2 Docena de Empanadas', '', 6500, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('aLXEfVOEoqcMhESEMPGj', 'Pizza Doble Muzza', 'Salsa de tomate, doble muzzarella y aceitunas', 7500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('awhlf8C7nx3oxIUgrC1M', 'Pizzanesa Pollo Especial (3)', '', 23000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('b55HHCy4208wSaNM03BF', 'Agua x 2L', '', 1100, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('bFQOoB3hVHcNQYn9QEEz', 'Lata Schneider 710cc', '', 3000, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('bGt7mHQFqL7tkPlPFlME', 'Bandeja Grande', '', 5500, '2D2TSadkH1qRJGKhDsce', true, ARRAY[]::TEXT[]),
('dCHh5QkktyDnhYQ0s6HJ', 'Empanada de J y Q', '', 1100, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('dagm83zJGY9SOlqBXxZl', 'Pizza Muzzarella', 'Salsa de tomate, queso muzzarella y aceitunas', 7000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('duy665u7iqhRcuCAarE5', 'Soda', '', 1300, 'JP2aTFxROM2tAeYOTXOj', true, ARRAY[]::TEXT[]),
('ez0VydYHgUhfQv6mH9Ro', 'Toro Tinto', '', 2300, 'J2QdDONrik4vOuLHAm7o', true, ARRAY[]::TEXT[]),
('fFig3mN3Tlsyv0YRbcFw', 'Sprite x 500cc', '', 1500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('fRgbVc7RVlWdbqaoYed5', 'Coca x 500cc', '', 1500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('fV6vSNmS16ba5u7fy8FL', 'Agua 500cc', '', 650, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('fy3WkYk6AAuHVdN9xUCn', 'Lata Santa Fe', '', 1700, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('g7MdFavMZwQf62LzeHiN', 'Pizza 1/2 Napolitana', 'Muzzarella, tomate, ajo', 4500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('gKLnaIjYAdE4xGcDzfZf', 'Pizza 1/2 Viena', 'Muzzarella, salchicha y huevo revuelto', 4500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('gKg7dtaxUmDYZ3C5zr1n', 'Familiar Especial Milanesa', '', 7500, 'CTzHNy5fuEli27jVDqd3', true, ARRAY[]::TEXT[]),
('gQ1vkXyLkAsKmguzwlS8', 'Suprema con Papas', '', 5000, 'TVVOqLfmBq4EtrGjohMe', true, ARRAY[]::TEXT[]),
('gU7yMfVSHyoLjt9yJWse', 'Coca x 1,5L', '', 3500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('h0Ao25IetozPWYCfXjzA', 'Pizzanesa Pollo Muzzarella (2 Personas)', '', 14000, 'uwjq5PHomO97rx2hQYq6', true, ARRAY[]::TEXT[]),
('h9bVBc7zifptsrIApJ5A', 'Speed chico', '', 1800, 'XjTxoQvz2Q9PmImUNxuh', true, ARRAY[]::TEXT[]),
('i1RcCd7jRTGCIjv07TYw', 'Pizza Va como Piña', 'Muzzarella, huevo frito y papas fritas', 9000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('i2aa0bu0lwzmVzopwO6N', 'Pizza Roquefort', 'Muzzarella y queso roquefort', 9000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('l3KXf9tTjk0mDMfcJRiD', 'Secco x 3L', '', 1700, 'JP2aTFxROM2tAeYOTXOj', true, ARRAY[]::TEXT[]),
('lEtaeTfF1Od9YDkMrskv', 'Hamburguesa Especial', 'Pan, carne, jamón, queso, huevo, lechuga, tomate y aderezo', 7500, 'g1KKmGEWPN08eMTXlotG', true, ARRAY[]::TEXT[]),
('lI13ZvjF6Y4aycAieBwh', 'Iguana 1L', '', 2400, 'KwjA1eXl5cTg8rkp77Fo', true, ARRAY[]::TEXT[]),
('mVIxZhcjIjjLIUI2zUer', 'Baggio chico', '', 500, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('nvv8yoyjHEDmlU4oa4zh', 'Empanada de Verdura', '', 1100, '5SR7cNdUyornmukKiDxp', true, ARRAY[]::TEXT[]),
('okP9WzjSJVu3sb1fgeG9', 'Pizza 1/2 Muzzarella', 'Salsa de tomate, queso muzzarella y aceitunas', 3500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('ookKepWZIGgCzy0kAcsn', 'Pizza 1/2 Doble Muzza', 'Salsa de tomate, doble muzzarella y aceitunas', 4000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('p0QNtAgycksQIm43mg2y', 'Pizza 1/2 Muzza con Jamón', 'Salsa de tomate, queso muzzarella y jamón', 4000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('papas-fritas', 'Papas Fritas', 'Porción grande con sal y perejil', 800, 'acompañamientos', true, ARRAY['Con cheddar', 'Con bacon']),
('pe0Exps07a6FchOW3NPU', 'Pizzanesa Carne Napolitana (3)', '', 24000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('qYgXcXZvdR6wUuu6tS5g', 'Pizza 1/2 Roquefort', 'Muzzarella y queso roquefort', 5000, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[]),
('qgxRPziUhQApH2gCEEfo', 'Hamburguesa Común', 'Pan, carne, lechuga, tomate y aderezo', 6500, 'g1KKmGEWPN08eMTXlotG', true, ARRAY[]::TEXT[]),
('r5wu2QRCtVsYQYrNYzcN', 'Lata Quilmes', '', 1600, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('rBGp9pf0B3voBO839Lin', 'Pizzanesa Pollo Muzzarella (3)', '', 21000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('tg1TyIeWfNzTBrRC5ais', 'Torpedo Primavera', '', 7500, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('v6wYDrZwsjZcg2zGjWiS', 'Aderezo adicional', '', 1000, '2D2TSadkH1qRJGKhDsce', true, ARRAY[]::TEXT[]),
('vigakmJbP71DTURKZOvw', 'Cepita', '', 3200, 'vs09QccM6ccgwLAx1luN', true, ARRAY[]::TEXT[]),
('wFq9o91dH7OMyEwBRatI', 'Torpedo Especial Suprema', '', 11000, 'kGcU2bEJhBxDxpbwSu5o', true, ARRAY[]::TEXT[]),
('wSoLMTJrvYCCT6wqWOAu', 'Tortilla de Papas', '', 7000, 'TVVOqLfmBq4EtrGjohMe', true, ARRAY[]::TEXT[]),
('wfcuyLnlseARKulZpWA4', 'Fanta x 500cc', '', 1500, '8RbEvu6qdzVnSlULlwye', true, ARRAY[]::TEXT[]),
('xD5lHJ0gR2XjwHakMBgA', 'Pritty x 3L', '', 2800, 'JP2aTFxROM2tAeYOTXOj', true, ARRAY[]::TEXT[]),
('xYVLo4QOpou3Slq7Z0j7', 'Lata Schneider', '', 1700, 'I1IyfzVrJJmjpdDa9IXC', true, ARRAY[]::TEXT[]),
('y5h9uC6jsb6imaZMSS7Z', 'Coca x 2L', '', 3000, 'hI30xuxgVydPG6Gn1YSh', true, ARRAY[]::TEXT[]),
('yIslXnTUSkWaXeyBcmx8', 'Pizzanesa Carne Salame (3)', '', 24000, 'ZtHiKfv1UaF8fdvC4uLu', true, ARRAY[]::TEXT[]),
('yVhIn9tInxWctZvdKaHb', 'Pizza 1/2 Especial', 'Jamón, muzzarella, huevo, morrón', 4500, '3rzzXodjmigAAbm9JZUK', true, ARRAY[]::TEXT[])
ON CONFLICT (id) DO NOTHING;

SELECT '✅ Base de datos configurada correctamente' as resultado;
