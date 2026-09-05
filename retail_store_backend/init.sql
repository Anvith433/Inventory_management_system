CREATE DATABASE IF NOT EXISTS retail_store_management_system;
USE retail_store_management_system;


CREATE TABLE IF NOT EXISTS customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    street VARCHAR(255),
    city VARCHAR(255),
    pincode VARCHAR(20),
    password VARCHAR(255),
    role VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS retailshop (
    shop_id INT PRIMARY KEY,
    shop_name VARCHAR(255),
    owner_name VARCHAR(255),
    location VARCHAR(255),
    contact VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS product (
    product_id INT PRIMARY KEY,
    pname VARCHAR(255),
    category VARCHAR(255),
    price DOUBLE,
    stock_quantity INT,
    shop_id INT,
    FOREIGN KEY (shop_id) REFERENCES retailshop(shop_id) ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY,
    date DATE,
    status VARCHAR(50),
    total_amount DOUBLE,
    customer_id INT,
    delivery_mode VARCHAR(50),
    payment_mode VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orderitem (
    item_no INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    price DOUBLE,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS phone (
    phone_no VARCHAR(20) PRIMARY KEY,
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS discount (
    discount_id INT PRIMARY KEY,
    percentage INT,
    type VARCHAR(100),
    validity DATE,
    shop_id INT,
    discount_name VARCHAR(255)
);


CREATE TABLE IF NOT EXISTS payment (
    payment_id INT PRIMARY KEY,
    status VARCHAR(50),
    transaction_date DATE,
    method VARCHAR(50),
    order_id INT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS customer_discount (
    customer_id INT,
    discount_id INT
);

CREATE TABLE IF NOT EXISTS discount_product (
    discount_id INT,
    product_id INT
);


INSERT INTO retailshop (shop_id, shop_name, owner_name, location, contact) VALUES 
(1, 'SuperMart', 'Anjali Sharma', 'Delhi', '9812345678'),
(2, 'FreshBazaar', 'Rahul Gupta', 'Mumbai', '9823456789'),
(3, 'ShopEasy', 'Priya Rao', 'Bangalore', '9834567890'),
(4, 'CityMall', 'Ravi Kumar', 'Chennai', '9845678901'),
(5, 'QuickBuy', 'Vikas Joshi', 'Hyderabad', '9856789012'),
(6, 'DailyNeeds', 'Kiran Shetty', 'Bangalore', '9867890123'),
(7, 'SmartShop', 'Meena Nair', 'Bangalore', '9878901234'),
(8, 'UrbanMart', 'Sanjay Verma', 'Bangalore', '9889012345');

INSERT INTO customer (customer_id, name, email, street, city, pincode, password, role) VALUES 
(1, 'Anvith Shetty', 'anvith@email.com', 'XYZ Street', 'Bangalore', '560001', 'Anvith123', 'ROLE_USER'),
(2, 'Ashwin', 'ashwin@example.com', NULL, NULL, NULL, '$2a$10$8q0KSO9BZDOLqmJx/U57GujmUQWmm63Lzq28iWTJgYfaj65Zvo/eS', 'ROLE_USER'),
(311, 'Admin', 'admin@gmail.com', 'N/A', 'N/A', '000000', '$2y$10$B/E3yVlHSFBbDGtI8tIGMO.faAV/bP4JqcO1xKllUfWCzwTVtxUVm', 'ROLE_ADMIN');

INSERT INTO product (product_id, pname, category, price, stock_quantity, shop_id) VALUES 
(201, 'Dairy Milk', 'Chocolate', 100, 169, 1),
(202, 'Fortune Rice', 'Groceries', 500, 146, 2),
(203, 'Colgate Toothpaste', 'Personal Care', 60, 288, 3),
(204, 'Kellogg''s Corn Flakes', 'Breakfast', 220, 192, 1),
(205, 'Dettol Soap', 'Personal Care', 45, 395, 2);