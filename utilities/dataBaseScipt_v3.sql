--Para eliminar el conenido de una tabla
--TRUNCATE usersetting;
--DELETE FROM table_name;

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
    cabInProgress BOOLEAN DEFAULT FALSE,
    notifying BOOLEAN DEFAULT FALSE,
    latitude FLOAT default -33.517493545179995,
    longitude FLOAT default -56.8984942534432,
    acceptedNumber INT DEFAULT 0,
    rejectedNumber INT DEFAULT 0,
    rateAccept FLOAT DEFAULT 0,
    photo TEXT,
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
    car TEXT;
    PRIMARY KEY(carId),
    FOREIGN KEY(driverId) REFERENCES Driver(driverId)
);


CREATE TABLE Passenger(
    passengerId INT,
	PRIMARY KEY(passengerId),
    FOREIGN KEY(passengerId) REFERENCES Client(clientId)
);

CREATE TABLE Opinion(
  	"opinionId" INT GENERATED ALWAYS AS IDENTITY, 
    "date" TIMESTAMP DEFAULT null,
    "clientId" INT,
    message TEXT,
  PRIMARY KEY("opinionId"),
    FOREIGN KEY("clientId") REFERENCES Client("clientId")
);

CREATE TABLE Ride(
    -- rideId INT GENERATED ALWAYS AS IDENTITY,
	  "idCabRequest" INT GENERATED ALWAYS AS IDENTITY, 
  	paid BOOLEAN DEFAULT false,
  	chat TEXT,
    "driverId" INT,
    "passengerId" INT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ratingPassengerToDriver" INT,
    "ratingDriverToPassenger" INT,
    "commentPassengerToDriver" TEXT,  
    "commentDriverToPassenger" TEXT,
    "originDescription" TEXT,
    "destinationDescription" TEXT,
    latitude FLOAT,
    longitude FLOAT,
    "startLatitude" FLOAT,
    "startLongitude" FLOAT,
    "endLatitude" FLOAT,
    "endLongitude" FLOAT,
    done BOOLEAN DEFAULT false,
    "state" SMALLINT default 1,
    "timeStart" TIMESTAMP,
    "timeEnd" TIMESTAMP,
    PRIMARY KEY("idCabRequest"),
    -- PRIMARY KEY(idCabRequest),
    "carId" int,
    cost INT,
    FOREIGN KEY("driverId") REFERENCES Driver("driverId"),
  	FOREIGN KEY("passengerId") REFERENCES Passenger("passengerId"),AUTO_INCREMENT,
    FOREIGN KEY("carId") REFERENCES Car("carId"),

);

CREATE TABLE Channel(
	  "idChannel" INT GENERATED ALWAYS AS IDENTITY,
	  "name" TEXT
   );

INSERT INTO Channel (name) values ('Facebook');
INSERT INTO Channel (name) values ('Radio');
INSERT INTO Channel (name) values ('Televisión');
INSERT INTO Channel (name) values ('Me contaron');
INSERT INTO Channel (name) values ('otro');

CREATE TABLE PendingRide(
  	"idCabRequest" INT, 
    "driverId" INT,
    PRIMARY KEY("idCabRequest", "driverId"),
    FOREIGN KEY("idCabRequest") REFERENCES Ride("idCabRequest"),
    FOREIGN KEY("driverId") REFERENCES Driver("driverId")
);

CREATE TABLE UserChannel(
	  "idChannel" INT,
	  "clientId" INT,
    PRIMARY KEY("idChannel", "clientId"),
    FOREIGN KEY("clientId") REFERENCES client("clientId")
   );

CREATE TABLE Notification(
    -- rideId INT GENERATED ALWAYS AS IDENTITY,
	  "idNotification" INT GENERATED ALWAYS AS IDENTITY,
    --Si tiene idCabRequest son notificaciones a conductores, si no para usuarios (ofertas, noticias, etc)
    "idCabRequest" INT,
    "expirationDate" TIMESTAMP,
    "title" TEXT,
    "body" TEXT,
    "titleAction" TEXT,
    PRIMARY KEY("idNotification"),
    FOREIGN KEY("idCabRequest") REFERENCES Ride("idCabRequest")
);

CREATE TABLE SentNotification(
	  "idSentNotification" INT GENERATED ALWAYS AS IDENTITY,
    "idNotification" INT,
    "clientId" INT,
    "readDate" TIMESTAMP,
    "actioned" BOOLEAN,
    "deletedDate" TIMESTAMP,
    PRIMARY KEY("idSentNotification"),
    FOREIGN KEY("idNotification") REFERENCES Notification("idNotification"),
    FOREIGN KEY("clientId") REFERENCES client("clientId")
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
  INSERT INTO Client ("rolId", name, surname, phone)
  values (1, 'German','Moreira', 1)
  returning "clientId"
)
INSERT INTO Passenger("passengerId") values ((select "clientId" from new_client));

--pasajero2
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  values (1, 'Martin','Gomez', 2)
  returning "clientId"
)
INSERT INTO Passenger("passengerId") values ((select "clientId" from new_client));

--Choferes
--Chofer 3
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  VALUES (2, 'Cholo','Rodriguez', 3)
  returning "clientId"
)
INSERT INTO driver("driverId", address, "photo") values ((select "clientId" from new_client),'Berro 1116','https://i.imgur.com/RGLP0wg.png');

--Chofer 4
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  values (2, 'Marcelo','Bonilla', 4)
  returning "clientId"
)
INSERT INTO driver("driverId", address, "photo") values ((select "clientId" from new_client),'Berro 1116','https://i.imgur.com/59vbu16.png');

--Chofer 5
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  VALUES (2, 'Juan','Gonzalez', 5)
  returning "clientId"
)
INSERT INTO driver("driverId", address, "photo") values ((select "clientId" from new_client),'Berro 1116','https://i.imgur.com/sVOuTkm.png');

--Chofer 6
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  VALUES (2, 'Mariela','Hernandez', 6)
  returning "clientId"
)
INSERT INTO driver("driverId", address, "photo") values ((select "clientId" from new_client),'Berro 1116','https://i.imgur.com/T1fZfLH.png');

--Chofer 7
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  VALUES (2, 'Jimena','Silva', 7)
  returning "clientId"
)
INSERT INTO driver("driverId", address, "photo") values ((select "clientId" from new_client),'Berro 1116','https://i.imgur.com/W5VVtBl.png');

--pasajero 8
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  values (1, 'Roberto','Suarez', 8)
  returning "clientId"
)
INSERT INTO Passenger("passengerId") values ((select "clientId" from new_client));


--pasajero 9
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  values (1, 'Sebastian','Varela', 9)
  returning "clientId"
)
INSERT INTO Passenger("passengerId") values ((select "clientId" from new_client));

--pasajero 10
WITH new_client AS (
  INSERT INTO Client ("rolId", name, surname, phone)
  values (1, 'Diego','Acosta', 10)
  returning "clientId"
)
INSERT INTO Passenger("passengerId") values ((select "clientId" from new_client));

--Autos
--Creo autos y le seteo uno a chofer con id 3 

-- INSERT INTO Car(driverId, plateNumber,colour,model, brand, typeColour)
-- VALUES  (3, 'NAY-2233', 'white', 'Suzuki', 'Alto', 'car-1-white');


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
  INSERT INTO Car("driverId", "plateNumber",colour,model, brand, "typeColour")
  VALUES  (4, 'NAY6666', 'white', 'volkswagen', 'Up', 'car-3-black')
  returning "carId"
)
UPDATE Driver
SET "activeCar" = (select "carId" from new_car)
WHERE "driverId" = 4;

--Creo autos y le seteo uno a chofer con id 5 
WITH new_car AS (
  INSERT INTO car("driverId", "plateNumber",colour,model, brand, "typeColour")
  VALUES  (5, 'NAY5555', 'white', 'volkswagen', 'Up', 'car-3-black')
  returning "carId"
)
UPDATE Driver
SET "activeCar" = (select "carId" from new_car)
WHERE "driverId" = 5;

--Creo autos y le seteo uno a chofer con id 6 
WITH new_car AS (
  INSERT INTO car("driverId", "plateNumber",colour,model, brand, "typeColour")
  VALUES  (6, 'NAY5555', 'white', 'volkswagen', 'Up', 'car-3-black')
  returning "carId"
)
UPDATE Driver
SET "activeCar" = (select "carId" from new_car)
WHERE "driverId" = 6;


--Creo autos y le seteo uno a chofer con id 7 
WITH new_car AS (
  INSERT INTO car("driverId", "plateNumber",colour,model, brand, "typeColour")
  VALUES  (7, 'NAY6666', 'white', 'volkswagen', 'Up', 'car-3-black')
  returning "carId"
)
UPDATE Driver
SET "activeCar" = (select "carId" from new_car)
WHERE "driverId" = 7;


--Preferencias Configuracion de usuario
CREATE TABLE UserSetting(
    "idUserSetting" INT GENERATED ALWAYS AS IDENTITY,
    "clientId" INT,
    "idSetting" INT,
    "value" BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    primary key ( "clientId", "idSetting"),
    FOREIGN KEY("clientId") REFERENCES Client("clientId"),
    FOREIGN KEY("idSetting") REFERENCES Setting("idSetting")
);

CREATE TABLE Setting(
    "idSetting" INT,
    title TEXT,
    subtitle TEXT,
    primary key ("idSetting")
);

INSERT INTO setting("idSetting",title,subtitle)  VALUES (1, 'Como se calcula la tarifa', 'La tarifa se calcula en base a las tarifas de los conductores que se encuentran disponibles actualmente, ten en cuenta que pueden tener pequeñas variaciones.');
INSERT INTO Setting("idSetting",title,subtitle) VALUES (2, 'Puedo solicitar viajes para otras personas', 'Si puedes hacerlo, ten en cuenta que debes asegurarte  coordinar adecuadamente con la personas a la que le solicita el viaje y poder tener comunicacion con ella por si surge algun inconveniente.');
INSERT INTO Setting("idSetting",title,subtitle) VALUES (3, 'Metodos de pago', 'Actualmente el metodos de pagos aceptado es solamente efectivo.');

insert into usersetting("clientId","idSetting",activo)
select "clientId", "idSetting", True
from client
cross join setting;

CREATE TABLE Help(
    "idHelp" INT,
    title TEXT,
    subtitle TEXT,
    primary key ("idHelp")
);

INSERT INTO help("idHelp",title,subtitle)  VALUES (1, 'Como se calcula la tarifa', 'La tarifa se calcula en base a las tarifas de los conductores que se encuentran disponibles actualmente, ten en cuenta que pueden tener pequeñas variaciones.');
INSERT INTO help("idHelp",title,subtitle) VALUES (2, 'Puedo solicitar viajes para otras personas', 'Si puedes hacerlo, ten en cuenta que debes asegurarte  coordinar adecuadamente con la personas a la que le solicita el viaje y poder tener comunicacion con ella por si surge algun inconveniente.');
INSERT INTO help("idHelp",title,subtitle) VALUES (3, 'Metodos de pago', 'Actualmente el metodos de pagos aceptado es solamente efectivo.');


