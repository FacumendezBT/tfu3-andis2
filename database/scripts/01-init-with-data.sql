-- Database initialization script
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Create users table (customers)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_category (product_id, category_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);

-- Load sample data
-- Insertar categorías de ejemplo
INSERT INTO categories (name, description) VALUES
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Moda y vestimenta'),
('Libros', 'Libros y literatura'),
('Hogar y Jardín', 'Artículos para el hogar y jardinería'),
('Deportes', 'Equipamiento y accesorios deportivos');

-- Insertar clientes de ejemplo
INSERT INTO customers (name, email, phone, address) VALUES
('Juan Pérez', 'juan.perez@gmail.com', '+598-99-123-456', 'Av. 18 de Julio 1234, Montevideo, Uruguay'),
('María González', 'maria.gonzalez@hotmail.com', '+598-99-234-567', 'Bulevar Artigas 567, Montevideo, Uruguay'),
('Carlos Rodríguez', 'carlos.rodriguez@outlook.com', '+598-99-345-678', 'Av. Rivera 890, Montevideo, Uruguay'),
('Ana López', 'ana.lopez@gmail.com', '+598-99-456-789', 'Punta Carretas Shopping, Montevideo, Uruguay'),
('Diego Martínez', 'diego.martinez@adinet.com.uy', '+598-99-567-890', 'Rambla República de México 1245, Montevideo, Uruguay');

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, stock) VALUES
('Notebook Gamer', 'Notebook de alta performance para trabajo y juegos', 45000.00, 50),
('Smartphone Samsung', 'Último modelo de smartphone con funciones avanzadas', 32000.00, 100),
('Remera de Algodón', 'Remera cómoda de algodón en varios colores', 890.00, 200),
('Jeans Clásico', 'Jean de mezclilla clásico para uso diario', 2200.00, 150),
('Libro de Programación', 'Guía completa de programación moderna', 1800.00, 75),
('Set de Herramientas para Jardín', 'Set completo de herramientas esenciales para jardín', 4200.00, 30),
('Raqueta de Tenis', 'Raqueta de tenis profesional', 5800.00, 25),
('Cafetera Automática', 'Cafetera de goteo automática', 3600.00, 40),
('Auriculares Inalámbricos', 'Auriculares inalámbricos con cancelación de ruido', 8900.00, 60),
('Reloj Fitness', 'Dispositivo avanzado para seguimiento de actividad física y salud', 6700.00, 80);

-- Asociar productos con categorías
INSERT INTO product_categories (product_id, category_id) VALUES
-- Electrónicos
(1, 1), -- Notebook
(2, 1), -- Smartphone
(9, 1), -- Auriculares Inalámbricos
(10, 1), -- Reloj Fitness
(8, 1), -- Cafetera
-- Ropa
(3, 2), -- Remera
(4, 2), -- Jeans
-- Libros
(5, 3), -- Libro de Programación
-- Hogar y Jardín
(6, 4), -- Herramientas de Jardín
(8, 4), -- Cafetera (también artículo del hogar)
-- Deportes
(7, 5), -- Raqueta de Tenis
(10, 5); -- Reloj Fitness (también artículo deportivo)

-- Insertar pedidos de ejemplo
INSERT INTO orders (customer_id, total_amount, status) VALUES
(1, 45890.00, 'delivered'),   -- Pedido de Juan
(2, 34200.00, 'shipped'),     -- Pedido de María
(3, 11490.00, 'processing'),  -- Pedido de Carlos
(4, 4200.00, 'pending'),      -- Pedido de Ana
(5, 17290.00, 'delivered');   -- Pedido de Diego

-- Insertar artículos de pedidos
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Pedido de Juan (Pedido 1)
(1, 1, 1, 45000.00, 45000.00),  -- Notebook
(1, 3, 1, 890.00, 890.00),      -- Remera
-- Pedido de María (Pedido 2)
(2, 2, 1, 32000.00, 32000.00),  -- Smartphone
(2, 4, 1, 2200.00, 2200.00),    -- Jeans
-- Pedido de Carlos (Pedido 3)
(3, 9, 1, 8900.00, 8900.00),    -- Auriculares Inalámbricos
(3, 5, 1, 1800.00, 1800.00),    -- Libro de Programación
(3, 3, 1, 890.00, 890.00),      -- Remera
-- Pedido de Ana (Pedido 4)
(4, 6, 1, 4200.00, 4200.00),    -- Herramientas de Jardín
-- Pedido de Diego (Pedido 5)
(5, 7, 1, 5800.00, 5800.00),    -- Raqueta de Tenis
(5, 10, 1, 6700.00, 6700.00),   -- Reloj Fitness
(5, 8, 1, 3600.00, 3600.00),    -- Cafetera
(5, 3, 1, 890.00, 890.00),      -- Remera
(5, 4, 1, 2200.00, 2200.00);    -- Jeans