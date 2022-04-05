--------CARGA DE DATOS nuevo--------

--chofer1
WITH new_client as (
	insert into client(phone, departament)
	values ('+59890000000','Flores')
	returning client_id
)
insert into driver(driver_id, rating, ratings_quantity, address)  values ((select client_id from new_client), 0, 0, 'Berro');

--chofer2
WITH new_client as (
	insert into client(phone, departament)
	values ('+59891111111','Flores')
	returning client_id
)
insert into driver(driver_id, rating, ratings_quantity, address)  values ((select client_id from new_client), 0, 0, 'Berro');

--chofer3
WITH new_client as (
	insert into client(phone, departament)
	values ('+59892222222','Flores')
	returning client_id
)
insert into driver(driver_id, rating, ratings_quantity, address)  values ((select client_id from new_client), 0, 0, 'Berro');

--pasajero1
WITH new_client as (
	insert into client(phone, departament)
	values ('+59893333333','Flores')
	returning client_id
)
insert into passenger(passenger_id) values ((select client_id from new_client));

--pasajero2
WITH new_client as (
	insert into client(phone, departament)
	values ('+59894444444','Flores')
	returning client_id
)
insert into passenger(passenger_id) values ((select client_id from new_client));

--pasajero3
WITH new_client as (
	insert into client(phone, departament)
	values ('+59895555555','Flores')
	returning client_id
)
insert into passenger(passenger_id) values ((select client_id from new_client));


--------CARGA DE DATOS VIEJO--------
WITH new_client as (
	insert into client(email, client_password, departament)
	values ('chofer1','chofer1','Flores')
	returning client_id
)
insert into driver(driver_id, rating, ratings_quantity, phone, address)  values ((select client_id from new_client), 0, 0, 098511622, 'Berro');

WITH new_client as (
	insert into client(email, client_password, departament)
	values ('pasajero1','pasajero1','Flores')
	returning client_id
)
insert into passenger(passenger_id) values ((select client_id from new_client))





create or replace function sign_in(in_phone VARCHAR(15))
returns VARCHAR(15)
language plpgsql
as
$$
declare   
begin
IF EXISTS (SELECT * FROM client where client.phone = in_phone) THEN
      IF EXISTS (select * from client inner join driver on client_id = driver_id where phone = in_phone) then
	  	RETURN 'driver' as clientType;
	  ELSE
	  	RETURN 'passenger' as clientType;
	  END IF;
   ELSE
   	 WITH new_client as (
		insert into client(phone, departament)
		values (in_phone,'Flores')
		returning client_id
		)
		insert into passenger(passenger_id) values ((select client_id from new_client));
      return 'passenger' as clientType;
   END IF;
end;
$$;


select sign_in('+59899999999') as clientType