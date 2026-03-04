CREATE TABLE country (
    country_name VARCHAR(50) PRIMARY KEY
);

INSERT INTO `country` VALUES ('Argentina'),('Australia'),('Brazil'),('Canada'),('China'),('Egypt'),('England'),('France'),('Germany'),('Japan'),('Mexico'),('South Korea'),('Spain'),('USA');
CREATE TABLE city (
    city_id int AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(50) NOT NULL,
    country_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (country_name)
        REFERENCES country(country_name)
        ON DELETE CASCADE
);

INSERT INTO `city` (city_name, country_name) VALUES ('Buenos Aires','Argentina'),('Melbourne','Australia'),('Sydney','Australia'),('Brasilia','Brazil'),('Calgary','Canada'),('Toronto','Canada'),('Vancouver','Canada'),('Beijing','China'),('Shanghai','China'),('Cairo','Egypt'),('London','England'),('Paris','France'),('Berlin','Germany'),('Tokyo','Japan'),('Mexico City','Mexico'),('Seoul','South Korea'),('Madrid','Spain'),('Los Angeles','USA'),('NYC','USA'),('WashingtonDC','USA');

CREATE TABLE airport (
    airport_code VARCHAR(10) PRIMARY KEY,
    airport_name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    FOREIGN KEY (city_id)
        REFERENCES city(city_id)
        ON DELETE CASCADE
);

INSERT INTO `airport` VALUES ('EZE', 'Ministro Pistarini International Airport', 1),('MEL', 'Melbourne Airport', 2),('SYD', 'Sydney Kingsford Smith Airport', 3),('BSB', 'Brasilia International Airport', 4),('YYC', 'Calgary International Airport', 5),('YYZ', 'Toronto Pearson International Airport', 6),('YVR', 'Vancouver International Airport', 7),('PEK', 'Beijing Capital International Airport', 8),('PVG', 'Shanghai Pudong International Airport', 9),('CAI', 'Cairo International Airport', 10),('LHR', 'London Heathrow Airport', 11),('CDG', 'Paris Charles de Gaulle Airport', 12),('TXL', 'Berlin Tegel Airport', 13),('HND', 'Tokyo Haneda Airport', 14),('MEX', 'Mexico City International Airport', 15),('ICN', 'Seoul Incheon International Airport', 16),('MAD', 'Madrid Barajas Airport', 17),('LAX','Los Angeles International Airport',18),('JFK','John F. Kennedy International Airport',19),('DCA','Washington Dulles International Airport',20);
CREATE TABLE airline (
    airline_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO `airline` (company_name) VALUES ('Air Canada'), ('Delta Airlines'),('United Airlines'),('American Airlines'),('Southwest Airlines'),('Alaska Airlines'),('JetBlue Airways'),('Air France'),('Lufthansa'),('British Airways');

CREATE TABLE passenger (
    passport_number VARCHAR(30) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    country_name VARCHAR(50),
    
    FOREIGN KEY (country_name)
        REFERENCES country(country_name)
        ON DELETE SET NULL
);

CREATE TABLE flight (
    flight_number VARCHAR(20) PRIMARY KEY,
    airline_id INT NOT NULL,
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    number_of_seats INT NOT NULL,
    departure_gate VARCHAR(10),
    arrival_gate VARCHAR(10),
    
    FOREIGN KEY (airline_id)
        REFERENCES airline(airline_id)
        ON DELETE CASCADE,
        
    FOREIGN KEY (departure_airport)
        REFERENCES airport(airport_code)
        ON DELETE CASCADE,
        
    FOREIGN KEY (arrival_airport)
        REFERENCES airport(airport_code)
        ON DELETE CASCADE
);

INSERT INTO flight 
(flight_number, airline_id, departure_airport, arrival_airport, departure_time, arrival_time, number_of_seats, departure_gate, arrival_gate)
VALUES
('AC1001', 1, 'YYC', 'LAX', '2024-07-01 08:00:00', '2024-07-01 10:00:00', 150, 'A1', 'B2'),
('DL2002', 2, 'JFK', 'YYZ', '2024-07-01 09:00:00', '2024-07-01 11:00:00', 200, 'C3', 'D4'),
('UA3003', 3, 'DCA', 'YVR', '2024-07-01 10:00:00', '2024-07-01 12:00:00', 175, 'E5', 'F6'),
('AF4004', 8, 'CDG', 'EZE', '2024-07-01 12:00:00', '2024-07-01 15:30:00', 250, 'G7', 'H8'),
('LH5005', 9, 'LHR', 'MEL', '2024-07-01 13:30:00', '2024-07-01 18:30:00', 350, 'I9', 'J1'),
('BA6006', 10, 'LHR', 'SYD', '2024-07-01 14:35:35', '2024-07-01 23:35:35', 385, 'K2', 'L3');

CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    passport_number VARCHAR(30) NOT NULL,
    flight_number VARCHAR(20) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (passport_number)
        REFERENCES passenger(passport_number)
        ON DELETE CASCADE,
        
    FOREIGN KEY (flight_number)
        REFERENCES flight(flight_number)
        ON DELETE CASCADE
);

CREATE TABLE loyalty_plan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    passport_number VARCHAR(30) UNIQUE NOT NULL,
    tier ENUM('Silver','Gold','Platinum') DEFAULT 'Silver',
    points INT DEFAULT 0,
    
    FOREIGN KEY (passport_number)
        REFERENCES passenger(passport_number)
        ON DELETE CASCADE
);

