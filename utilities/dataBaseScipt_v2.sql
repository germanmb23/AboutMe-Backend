DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS employee;

CREATE TABLE person(
    person_id INT GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(60),
    PRIMARY KEY(person_id)
);

CREATE TABLE client(
    person_id INT,
    qualification INT,
    PRIMARY KEY(client_id),
    CONSTRAINT fk_person
        FOREIGN KEY(person_id)
            REFERENCES person(person_id)
);

CREATE TABLE employee(
    person_id INT,
    salary INT,
    PRIMARY KEY(employee_id),
    CONSTRAINT fk_person
        FOREIGN KEY(person_id)
            REFERENCES person(person_id)
);


----------------ULTIMO-------------------------------

CREATE TABLE client(
    --client_id INT GENERATED ALWAYS AS IDENTITY,
    --email VARCHAR(30),
    phone VARCHAR(15),
    rating FLOAT DEFAULT 0,
    push_notification_token VARCHAR(200) NOT NULL,
    departament VARCHAR(20) NOT NULL,
    raitings_quantity INT DEFAULT 0,
	  activo BOOLEAN DEFAULT TRUE, --por si el usuario es bloqueado por mal comportamiento o similar
    nota TEXT, --nota que se le muestra
    acum_ratings INT DEFAULT 0,
  	--client_password VARCHAR(20),
  	PRIMARY KEY(phone)
	--PRIMARY KEY(email)
);

CREATE TABLE driver(
    phone VARCHAR(15),
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20) NOT NULL,
    idAutoActual INT,
  	adress VARCHAR(30) NOT NULL,
    en_viaje BOOLEAN DEFAULT FALSE,
    notificando BOOLEAN DEFAULT FALSE,
    latitude FLOAT,
    longitude FLOAT,
    aceptados INT DEFAULT 0,
    rechazados INT DEFAULT 0,
    rate_accept FLOAT DEFAULT 0,
    foto_perfil VARCHAR(40),
    trabajando BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(phone),
  	FOREIGN KEY(phone) REFERENCES client(phone)
);


CREATE TABLE passenger(
    phone VARCHAR(15)
    PRIMARY KEY(phone),
    FOREIGN KEY(phone) REFERENCES client(phone)
);

CREATE TABLE car(
    car_id INT GENERATED ALWAYS AS IDENTITY,
  	plate_number VARCHAR(7) UNIQUE,
 	  colour VARCHAR(10),
  	model VARCHAR(7),
    PRIMARY KEY(car_id)
);

CREATE TABLE ride_driver_passenger(
    passenger_id INT NOT NULL,
  	driver_id INT NOT NULL,
	  ride_id INT NOT NULL,
    PRIMARY KEY(passenger_id, driver_id, ride_id),
  	FOREIGN KEY(passenger_id) REFERENCES passenger(passenger_id),
  	FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
		FOREIGN KEY(ride_id) REFERENCES ride(ride_id)
);


CREATE TABLE ride(
    ride_id INT GENERATED ALWAYS AS IDENTITY,
  	paid BOOLEAN DEFAULT false,
    ride_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  	chat_text VARCHAR(150),
    latitude FLOAT,
    longitude FLOAT,
    rating INT DEFAULT 0,
    done BOOLEAN DEFAULT false,
    PRIMARY KEY(ride_id)
);


CREATE TABLE driver_car(
    driver_id INT,
  	car_id INT,
    PRIMARY KEY(driver_id, car_id),
	  FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
  	FOREIGN KEY(car_id) REFERENCES car(car_id)
);

CREATE TABLE rating(
    rating_id INT GENERATED ALWAYS AS IDENTITY,
  	rating INT,
    comment_text VARCHAR(100),
    PRIMARY KEY(rating_id)
);

CREATE TABLE ride_rating(
    ride_id INT,
  	rating_id INT,
    PRIMARY KEY(ride_id, rating_id),
	  FOREIGN KEY(ride_id) REFERENCES ride(ride_id),
  	FOREIGN KEY(rating_id) REFERENCES rating(rating_id)
);

CREATE TABLE config (
	config_id INT GENERATED ALWAYS AS IDENTITY,
	id_solicitud INT DEFAULT 0,
);
----------------------------------


select client_password, CASE
    WHEN client_password is NOT NULL THEN 'driver'
    ELSE 'passenger'
  END 
  AS tipoClient
from client  
inner join driver on  client_id = driver_id
where client_id = 8




update_driver_rating
update driver rating when a new rating is INSERTed by a passenger

INSERT INTO client (email, client_password, departament) values ('admin', 'admin','Flores') returning client_id



----------ELIMINAR TABLAS---------
DROP TABLE IF EXISTS client cAScade;
DROP TABLE IF EXISTS driver cAScade;
DROP TABLE IF EXISTS passenger cAScade;
DROP TABLE IF EXISTS car cAScade;
DROP TABLE IF EXISTS driver_car cAScade;
DROP TABLE IF EXISTS ride cAScade;
DROP TABLE IF EXISTS ride_drive_passenger cAScade;
DROP TABLE IF EXISTS rating cAScade;
DROP TABLE IF EXISTS ride_rating cAScade;

----O--------
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

--------UPDATE---------
UPDATE client
SET client_password = 'pasajero1'
WHERE client_id = 2



---------INSERTS
--driver
	WITH new_client AS (
      INSERT INTO client(phone, departament)
      values ('5','Flores')
      returning client_id
    )
    INSERT INTO driver(driver_id, rating, ratings_quantity, address) values ((select client_id from new_client),0,0,'Berro 3333')

--client
	WITH new_client AS (
      INSERT INTO client(phone, departament)
      values ('1','Flores')
      returning client_id
    )
    INSERT INTO passenger(passenger_id) values ((select client_id from new_client))



















-----------------------------------------------

-- CREATE TABLE client(
--     client_id INT GENERATED ALWAYS AS IDENTITY,
--     email VARCHAR(30),
--   	client_password VARCHAR(20),
--     departament VARCHAR(20),
--   	PRIMARY KEY(client_id)
--     PRIMARY KEY(email)
-- );

-- CREATE TABLE driver(
--     driver_id INT,
--     rating FLOAT,
--   	ratings_quantity INT,
--   	phone VARCHAR(15),
--   	address VARCHAR(30),
--     PRIMARY KEY(driver_id),
--   	FOREIGN KEY(driver_id) REFERENCES client(client_id)
-- );

-- CREATE TABLE passenger(
--   	passenger_id INT,
--     PRIMARY KEY(passenger_id),
--     FOREIGN KEY(passenger_id) REFERENCES client(client_id)
-- );

-- CREATE TABLE car(
--     car_id INT GENERATED ALWAYS AS IDENTITY,
--   	plate_number VARCHAR(7) UNIQUE,
--  	colour VARCHAR(7),
--   	model VARCHAR(10),
--     marca VARCHAR(10)
--     PRIMARY KEY(car_id)
-- );

-- CREATE TABLE ride(
--     ride_id INT GENERATED ALWAYS AS IDENTITY,
--     latitude FLOAT,
--     longitude FLOAT,
--   	paid BOOLEAN DEFAULT false,
--     ride_date timestamp DEFAULT CURRENT_TIMESTAMP,
--   	chat_text VARCHAR(150) DEFAULT NULL,
--     rating INT DEFAULT 0,
--     done BOOLEAN DEFAULT false,
--     PRIMARY KEY(ride_id)
-- );

-- CREATE TABLE ride_drive_passenger(
--     passenger_id INT NOT NULL,
--   	driver_id INT NOT NULL,
-- 	  ride_id INT NOT NULL,
--     PRIMARY KEY(passenger_id, driver_id, ride_id),
--   	FOREIGN KEY(passenger_id) REFERENCES passenger(passenger_id),
--   	FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
-- 		FOREIGN KEY(ride_id) REFERENCES ride(ride_id)
-- );
-- CREATE TABLE driver_car(
--     driver_id INT,
--   	car_id INT,
--     PRIMARY KEY(driver_id, car_id),
-- 	  FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
--   	FOREIGN KEY(car_id) REFERENCES car(car_id)
-- );

-- CREATE TABLE rating(
--     rating_id INT GENERATED ALWAYS AS IDENTITY,
--   	rating INT,
--     comment_text VARCHAR(100),
--     PRIMARY KEY(rating_id)
-- );

-- CREATE TABLE ride_rating(
--     ride_id INT,
--   	rating_id INT,
--     PRIMARY KEY(ride_id, rating_id),
-- 	FOREIGN KEY(ride_id) REFERENCES ride(ride_id),
--   	FOREIGN KEY(rating_id) REFERENCES rating(rating_id)
-- );


-------------------

INSERT INTO ride(paid, ride_date, chat_text)
values (TRUE,CURRENT_TIMESTAMP , 'aASdASd')

ALTER TABLE users
  ADD COLUMN "priv_user" BOOLEAN DEFAULT FALSE;


  select paid, phone, ride_date, latitude, longitude
    from client LEFT JOIN ride_drive_passenger on client.client_id = ride_drive_passenger.driver_id join ride on ride_drive_passenger.ride_id = ride.ride_id
where phone='3'

select *
from client join driver on client_id = driver_id

	WITH new_car AS (
      INSERT INTO car(plate_number, colour, model, brand)
      values ('DDD3244','white', 'Cherry','QQ')
      returning car_id
    )
    INSERT INTO driver_car(driver_id, car_id) values (17, (select car_id from new_car))

UPDATE driver
SET id_auto_actual = 6
WHERE driver_id = 17;


INSERTar nuevo viaje

from client join driver on client_id = driver_id

	WITH new_ride AS (
      INSERT INTO ride( latitude, longitude)
	values (
				-33.518925036129176,
				-56.903085912884734
				)
		      returning ride_id

    )
    INSERT INTO ride_drive_passenger(passenger_id, driver_id, ride_id) values (
		(select client_id
				from client
				where phone = '0'), 
				 (select client_id
				from client
				where phone = '3'),
		(select ride_id from new_ride))
		


---------------------------- 
    select *
from ride
order by ride_date desc

	WITH new_cab AS (
      INSERT INTO ride(paid, )
      values ('5','Flores')
      returning client_id
    )
    INSERT INTO driver(driver_id, rating, ratings_quantity, address) values ((select client_id from new_client),0,0,'Berro 3333')
	
	
	
	ALTER TABLE ride

  ADD COLUMN "ride_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  
select *
from client
where phone = '0'


INSERT INTO ride(client_id, driver_id, latitude, longitude)
values ((select client_id
				from client
				where phone = '0'), 
				 (select driver_id
				from driver
				where phone = '3'),
				-33.518925036129176,
				-56.903085912884734
				)
				
				
				
from client join driver on client_id = driver_id

	WITH new_ride AS (
      INSERT INTO ride( latitude, longitude)
	values (
				-33.518925036129176,
				-56.903085912884734
				)
		      returning ride_id

    )
    INSERT INTO ride_drive_passenger(passenger_id, driver_id, ride_id) values (
		(select client_id
				from client
				where phone = '0'), 
				 (select client_id
				from client
				where phone = '3'),
		(select ride_id from new_ride))
		
UPDATE ride
SET paid = true
WHERE ride_id = 8;
		
drop table ride_drive_passenger cAScade
ALTER TABLE ride ALTER COLUMN "paid" set true




select *
from ride r join ride_rating rr on r.ride_id = rr.ride_id join rating rg on rr.rating_id = rg.rating_id 

 
SELECT ratings_quantity, rating, acum_ratings, driver_id
		FROM client join driver on client_id = driver_id
		WHERE phone = '3'
 
SELECT ratings_quantity, rating, acum_ratings, driver_id
from driver
WHERE driver_id = 16;

select *
from ride r join ride_rating rr on r.ride_id = rr.ride_id join rating rg on rr.rating_id = rg.rating_id 

--Obtener lAS calificaicones de un chofer 
select rating.comment_text, rating.rating
from ride_drive_passenger rdp  join client c on rdp.driver_id = c.client_id join ride r on rdp.ride_id = r.ride_id join ride_rating rr on r.ride_id = rr.ride_id join rating on rating.rating_id = rr.rating_id 
where phone = '3'
