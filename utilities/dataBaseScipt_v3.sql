DROP TABLE IF EXISTS Rol cascade;
DROP TABLE IF EXISTS Client cascade;
DROP TABLE IF EXISTS driver cascade;
DROP TABLE IF EXISTS passenger cascade;
DROP TABLE IF EXISTS car cascade;
DROP TABLE IF EXISTS ride cascade;
DROP TABLE IF EXISTS config cascade;

ALTER TABLE Driver
ALTER COLUMN fotoPerfil SET DATA TYPE TEXT;

ALTER TABLE rol
RENAME column TO role;

CREATE TABLE Rol(
    rolId INT GENERATED ALWAYS AS IDENTITY,
    meaning TEXT NOT NULL,
    PRIMARY KEY(rolId)
);

CREATE TABLE Client(
    clientId INT GENERATED ALWAYS AS IDENTITY,
    rolId INT,
    nombre TEXT NOT NULL,
    apellido TEXT,
    phone VARCHAR(15) NOT NULL,
    rating FLOAT DEFAULT 5,
    raitingsQuantity INT DEFAULT 1,
    token TEXT,
	  activo BOOLEAN DEFAULT TRUE, --por si el usuario es bloqueado por mal comportamiento o similar
    acumRatings INT DEFAULT 5,        
    PRIMARY KEY(clientid),
	firstTime BOOLEAN DEFAULT TRUE,
    FOREIGN KEY(rolId) REFERENCES Rol(rolId)
);

CREATE TABLE Driver(
    driverId INT,
    carId INT,
  	address TEXT NOT NULL,
    enViaje BOOLEAN DEFAULT FALSE,
    notificando BOOLEAN DEFAULT FALSE,
    latitude FLOAT default -33.517493545179995,
    longitude FLOAT default -56.8984942534432,
    aceptados INT DEFAULT 0,
    rechazados INT DEFAULT 0,
    rateAccept FLOAT DEFAULT 0,
    fotoPerfil TEXT,
    trabajando BOOLEAN DEFAULT FALSE,
    activeCar INT,
	--FOREIGN KEY(carId) REFERENCES car(carId),
	PRIMARY KEY(driverId),
    FOREIGN KEY(driverId) REFERENCES Client(clientId)
);


ALTER TABLE DELETE Client ADD firstTime BOOLEAN DEFAULT TRUE;

CREATE TABLE Car(
    carId INT GENERATED ALWAYS AS IDENTITY,
    driverId INT,
  	plateNumber TEXT,
 	colour TEXT,
  	model TEXT,
    brand TEXT,
    typeColour TEXT, --para identificar la imagene en el front
    PRIMARY KEY(carId),
    FOREIGN KEY(driverId) REFERENCES Driver(driverId)
);


CREATE TABLE Passenger(
    passengerId INT,
	PRIMARY KEY(passengerId),
    FOREIGN KEY(passengerId) REFERENCES Client(clientId)
);

CREATE TABLE Ride(
    rideId INT GENERATED ALWAYS AS IDENTITY,
	  idCabRequest TEXT UNIQUE, 
  	paid BOOLEAN DEFAULT false,
  	chat TEXT,
    driverId INT,
    passengerId INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ratingPassengerToDriver INT DEFAULT 0,
    ratingDriverToPassenger INT DEFAULT 0,
    commentPassengerToDriver TEXT,  
    commentDriverToPassenger TEXT,
    latitude FLOAT,
    longitude FLOAT,
    done BOOLEAN DEFAULT false,
    PRIMARY KEY(idCabRequest),
    FOREIGN KEY(driverId) REFERENCES Driver(driverId),
  	FOREIGN KEY(passengerId) REFERENCES Passenger(passengerId)
);


CREATE TABLE Config(
	config_id INT GENERATED ALWAYS AS IDENTITY,
	id_solicitud INT DEFAULT 0
);

--------Seeding--------
--Roles
INSERT INTO Rol (meaning) values ('passenger');
INSERT INTO Rol (meaning) values ('driver');

--Pasajeros
--pasajero1
WITH new_client AS (
  INSERT INTO Client (rolId, nombre, apellido, phone)
  values (1, 'German','Moreira', 0)
  returning clientId
)
INSERT INTO Passenger(passengerId) values ((select clientId from new_client));

--pasajero2
WITH new_client AS (
  INSERT INTO Client (rolId, nombre, apellido, phone)
  values (1, 'Martin','Gomez', 1)
  returning clientId
)
INSERT INTO Passenger(passengerId) values ((select clientId from new_client));

--Choferes
--Chofer 1
WITH new_client AS (
  INSERT INTO Client (rolId, nombre, apellido, phone)
  VALUES (2, 'Cholo','Rodriguez', 4)
  returning clientId
)
INSERT INTO driver(driverId, address, fotoPerfil) values ((select clientId from new_client),'Berro 1116','https://us.123rf.com/450wm/marctran/marctran1906/marctran190600935/125688059-sonriente-hombre-asi%C3%A1tico-de-pie-con-las-manos-juntas-concepto-de-trabajos-de-ingenier%C3%ADa.jpg?ver=6');

--Chofer 2
WITH new_client AS (
  INSERT INTO Client (rolId, nombre, apellido, phone)
  values (2, 'Marcelo','Bonilla', 5)
  returning clientId
)
INSERT INTO driver(driverId, address, fotoPerfil) values ((select clientId from new_client),'Berro 1116','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3SZoOmP597xM5DjWcRnwx4k5Ug8hvq0tVSBariZVSSPfpu8EoCRUKu6ngjcJweUzX9MY&usqp=CAU');

--Chofer 3
WITH new_client AS (
  INSERT INTO Client (rolId, nombre, apellido, phone)
  VALUES (2, 'Juan','Gonzalez', 6)
  returning clientId
)
INSERT INTO driver(driverId, address, fotoPerfil) values ((select clientId from new_client),'Berro 1116','https://us.123rf.com/450wm/marctran/marctran1906/marctran190600935/125688059-sonriente-hombre-asi%C3%A1tico-de-pie-con-las-manos-juntas-concepto-de-trabajos-de-ingenier%C3%ADa.jpg?ver=6');

--Autos
--Creo autos y le seteo uno a chofer con id 3 

INSERT INTO Car(driverId, plateNumber,colour,model, brand, typeColour)
VALUES  (3, 'NAY-2233', 'white', 'Suzuki', 'Alto', 'car-1-white');


WITH new_car AS (
  INSERT INTO Car(driverId, plateNumber,colour,model, brand, typeColour)
  VALUES  (3, 'NAY4444', 'white', 'Suzuki', 'Coso', 'car-2-white')
  returning carId
)
UPDATE Driver
SET carId = (select carId from new_car)
WHERE driverId = 3;


--Creo autos y le seteo uno a chofer con id 4 
WITH new_car AS (
  INSERT INTO Car(driverId, plateNumber,colour,model, brand, typeColour)
  VALUES  (4, 'NAY6666', 'white', 'volkswagen', 'Up', 'car-3-black')
  returning carId
)
UPDATE Driver
SET carId = (select carId from new_car)
WHERE driverId = 4;