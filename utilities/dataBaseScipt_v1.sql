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
    client_id INT GENERATED ALWAYS AS IDENTITY,
    --email VARCHAR(30),
    phone VARCHAR(15) UNIQUE,
  	--client_password VARCHAR(20),
    departament VARCHAR(20),
    push_notification_token VARCHAR(200),
  	PRIMARY KEY(client_id)
	--PRIMARY KEY(email)
);

CREATE TABLE driver(
    driver_id INT GENERATED ALWAYS AS IDENTITY,
    nombre VARCHAR(20) NOT NULL,
    apellido VARCHAR(20),
    idAutoActual INT NOT NULL,
    rating float default 0,
    raitings_quantity INT default 0,
	acum_ratings Int default 0,
    en_viaje BOOLEAN default FALSE,
    notificando BOOLEAN default FALSE,
    latitude FLOAT,
    longitude FLOAT,
    aceptados INT default 0,
    rechazados INT default 0,
    rate_accept FLOAT default 0,
    adress VARCHAR(30) not null,
    foto_perfil VARCHAR(40),
    trabajando BOOLEAN NOT NULL default FALSE,
    PRIMARY KEY(client_id)
    )


Aceptados, rechazados, rate?
  	ratings_quantity int,
  	address VARCHAR(30),
    PRIMARY KEY(driver_id),
  	FOREIGN KEY(driver_id) REFERENCES client(client_id)
);

CREATE TABLE passenger(
  	passenger_id int,
    PRIMARY KEY(passenger_id),
    FOREIGN KEY(passenger_id) REFERENCES client(client_id)
);

CREATE TABLE car(
    car_id INT GENERATED ALWAYS AS IDENTITY,
  	plate_number VARCHAR(7) UNIQUE,
 	colour VARCHAR(10),
  	model VARCHAR(7),
    PRIMARY KEY(car_id)
);

CREATE TABLE ride_drive_passenger(
    passenger_id int not null,
  	driver_id int not null,
	  ride_id int not null,
    PRIMARY KEY(passenger_id, driver_id, ride_id),
  	FOREIGN KEY(passenger_id) REFERENCES passenger(passenger_id),
  	FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
		FOREIGN KEY(ride_id) REFERENCES ride(ride_id)
);


CREATE TABLE ride(
    ride_id INT GENERATED ALWAYS AS IDENTITY,
  	paid BOOLEAN default false,
    ride_date TIMESTAMP default CURRENT_TIMESTAMP,
  	chat_text VARCHAR(150) default NULL,
    latitude FLOAT,
    longitude FLOAT,
    rating int default 0,
    done BOOLEAN default false,
    PRIMARY KEY(ride_id)
);


CREATE TABLE driver_car(
    driver_id int,
  	car_id int,
    PRIMARY KEY(driver_id, car_id),
	  FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
  	FOREIGN KEY(car_id) REFERENCES car(car_id)
);

CREATE TABLE rating(
    rating_id INT GENERATED ALWAYS AS IDENTITY,
  	rating int,
    comment_text VARCHAR(100),
    PRIMARY KEY(rating_id)
);

CREATE TABLE ride_rating(
    ride_id int,
  	rating_id int,
    PRIMARY KEY(ride_id, rating_id),
	FOREIGN KEY(ride_id) REFERENCES ride(ride_id),
  	FOREIGN KEY(rating_id) REFERENCES rating(rating_id)
);

CREATE TABLE config (
	config_id INT GENERATED ALWAYS AS IDENTITY,
	id_solicitud INT NOT NULL
);
----------------------------------


select client_password, CASE
    WHEN client_password is not null THEN 'driver'
    ELSE 'passenger'
  END 
  as tipoClient
from client  
inner join driver on  client_id = driver_id
where client_id = 8




update_driver_rating
update driver rating when a new rating is inserted by a passenger

insert into client (email, client_password, departament) values ('admin', 'admin','Flores') returning client_id



----------ELIMINAR TABLAS---------
DROP TABLE IF EXISTS client cascade;
DROP TABLE IF EXISTS driver cascade;
DROP TABLE IF EXISTS passenger cascade;
DROP TABLE IF EXISTS car cascade;
DROP TABLE IF EXISTS driver_car cascade;
DROP TABLE IF EXISTS ride cascade;
DROP TABLE IF EXISTS ride_drive_passenger cascade;
DROP TABLE IF EXISTS rating cascade;
DROP TABLE IF EXISTS ride_rating cascade;

----O--------
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

--------UPDATE---------
UPDATE client
SET client_password = 'pasajero1'
WHERE client_id = 2



---------INSERTS
--driver
	WITH new_client as (
      insert into client(phone, departament)
      values ('5','Flores')
      returning client_id
    )
    insert into driver(driver_id, rating, ratings_quantity, address) values ((select client_id from new_client),0,0,'Berro 3333')

--client
	WITH new_client as (
      insert into client(phone, departament)
      values ('1','Flores')
      returning client_id
    )
    insert into passenger(passenger_id) values ((select client_id from new_client))



















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
--     rating float,
--   	ratings_quantity int,
--   	phone VARCHAR(15),
--   	address VARCHAR(30),
--     PRIMARY KEY(driver_id),
--   	FOREIGN KEY(driver_id) REFERENCES client(client_id)
-- );

-- CREATE TABLE passenger(
--   	passenger_id int,
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
--   	paid BOOLEAN default false,
--     ride_date timestamp default CURRENT_TIMESTAMP,
--   	chat_text VARCHAR(150) default NULL,
--     rating int default 0,
--     done BOOLEAN default false,
--     PRIMARY KEY(ride_id)
-- );

-- CREATE TABLE ride_drive_passenger(
--     passenger_id int not null,
--   	driver_id int not null,
-- 	  ride_id int not null,
--     PRIMARY KEY(passenger_id, driver_id, ride_id),
--   	FOREIGN KEY(passenger_id) REFERENCES passenger(passenger_id),
--   	FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
-- 		FOREIGN KEY(ride_id) REFERENCES ride(ride_id)
-- );
-- CREATE TABLE driver_car(
--     driver_id int,
--   	car_id int,
--     PRIMARY KEY(driver_id, car_id),
-- 	  FOREIGN KEY(driver_id) REFERENCES driver(driver_id),
--   	FOREIGN KEY(car_id) REFERENCES car(car_id)
-- );

-- CREATE TABLE rating(
--     rating_id INT GENERATED ALWAYS AS IDENTITY,
--   	rating int,
--     comment_text VARCHAR(100),
--     PRIMARY KEY(rating_id)
-- );

-- CREATE TABLE ride_rating(
--     ride_id int,
--   	rating_id int,
--     PRIMARY KEY(ride_id, rating_id),
-- 	FOREIGN KEY(ride_id) REFERENCES ride(ride_id),
--   	FOREIGN KEY(rating_id) REFERENCES rating(rating_id)
-- );


-------------------

insert into ride(paid, ride_date, chat_text)
values (TRUE,CURRENT_TIMESTAMP , 'aasdasd')

ALTER TABLE users
  ADD COLUMN "priv_user" BOOLEAN DEFAULT FALSE;


  select paid, phone, ride_date, latitude, longitude
    from client LEFT JOIN ride_drive_passenger on client.client_id = ride_drive_passenger.driver_id join ride on ride_drive_passenger.ride_id = ride.ride_id
where phone='3'

select *
from client join driver on client_id = driver_id

	WITH new_car as (
      insert into car(plate_number, colour, model, brand)
      values ('DDD3244','white', 'Cherry','QQ')
      returning car_id
    )
    insert into driver_car(driver_id, car_id) values (17, (select car_id from new_car))

UPDATE driver
SET id_auto_actual = 6
WHERE driver_id = 17;


Insertar nuevo viaje

from client join driver on client_id = driver_id

	WITH new_ride as (
      insert into ride( latitude, longitude)
	values (
				-33.518925036129176,
				-56.903085912884734
				)
		      returning ride_id

    )
    insert into ride_drive_passenger(passenger_id, driver_id, ride_id) values (
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

	WITH new_cab as (
      insert into ride(paid, )
      values ('5','Flores')
      returning client_id
    )
    insert into driver(driver_id, rating, ratings_quantity, address) values ((select client_id from new_client),0,0,'Berro 3333')
	
	
	
	ALTER TABLE ride

  ADD COLUMN "ride_date" TIMESTAMP default CURRENT_TIMESTAMP;
  
select *
from client
where phone = '0'


insert into ride(client_id, driver_id, latitude, longitude)
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

	WITH new_ride as (
      insert into ride( latitude, longitude)
	values (
				-33.518925036129176,
				-56.903085912884734
				)
		      returning ride_id

    )
    insert into ride_drive_passenger(passenger_id, driver_id, ride_id) values (
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
		
drop table ride_drive_passenger cascade
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

--Obtener las calificaicones de un chofer 
select *
from ride_drive_passenger rdp  join client c on rdp.driver_id = c.client_id join ride r on rdp.ride_id = r.ride_id join ride_rating rr on r.ride_id = rr.ride_id join rating on rating.rating_id = rr.rating_id 
where phone = '3'
