//https://aboutme-backend.herokuapp.com/
//heroku restart -a aboutme-backend

const cors = require('cors');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const sendExpoPushNotification = require('./utilities/expoNotifications');
const sendFirebaseNotification = require('./utilities/firebaseNotifications');

const app = express();
var bodyParser = require('body-parser');
const port = process.env.PORT || 3333;
const mails = require('./src/emails/account');
var jsonParser = bodyParser.json();
const constants = require('./constants');

const sendPushNotification = sendFirebaseNotification;

const intervaloDeAviso = 10000; //10 segundos

//para poder obtener el cuerpo de una petición POST
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

//INITIAL CONFIG
const { Pool } = require('pg');
const mail = require('@sendgrid/mail');
const pool = new Pool({
	connectionString: 'postgres://flkcmazo:qVAZRl9H6DOBL4tgCRMEpuyON9SfornP@kesavan.db.elephantsql.com/flkcmazo',
	//"postgres://fmckbrxcweidkf:a65fbc4912953a21d47fc1a6d9f535d059d24c3ec9d985a7b1fbfe7b6a066ceb@ec2-23-20-124-77.compute-1.amazonaws.com:5432/d1tb1uo4ucldbk",
	ssl: {
		rejectUnauthorized: false,
	},
});

const getConfig = (config_id = 1) => {
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT *
		FROM config
		WHERE config_id = ${config_id}`,
			(err, res) => {
				if (err) {
					reject(err);
					console.log(err);
				} else {
					console.log('idSolicitud', res.rows[0]);
					resolve(res.rows[0]);
				}
			},
		);
	});
};

let idSolicitud = 1;
getConfig().then((res) => (idSolicitud = res.id_solicitud));

let idChofer = 1;
const isUpdated = (currentHours, currentMinutes, hours, minutes) => {
	if (Math.abs(currentHours - hours) == 0) return true;
	else if (Math.abs(currentHours - hours) > 1) return false;
	else if (Math.abs(currentHours - hours) == 0 && currentMinutes - minutes > 0) return false;
	else return true;
};
const getHM = () => {
	let date_ob = new Date();
	let currentHours = date_ob.getHours();
	let currentMinutes = date_ob.getMinutes();
	return { currentHours, currentMinutes };
};

let choferesDisponibles = new Map();

let yuberRequestsData = new Map();
let yuberRequestsAcceptedData = new Map();
let iteradorId = new Map();
let arrayChoferes = new Map();
//let waitingIdSolicitud = new Map();
let idSolititudAccepted = new Map();
let idSolicitudInterval = new Map();
let usersExpoToken = new Map();

let driverPassengerChatTokens = new Map();

let chatsMap = new Map();
chatsMap.set(2, [
	{
		id: 0,
		user: 'p',
		message: 'Hola como estas?',
		time: { hour: 23, minute: 2 },
	},
	{
		id: 1,
		user: 'p',
		message: 'Hola como estas?',
		time: { hour: 23, minute: 2 },
	},
	{ id: 2, user: 'p', message: 'lorem', time: { hour: 23, minute: 2 } },
	{
		id: 3,
		user: 'd',
		message: 'bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d',
		time: { hour: 23, minute: 2 },
	},
	{ id: 4, user: 'd', message: 'bien', time: { hour: 3, minute: 2 } },
	{ id: 5, user: 'p', message: 'bien', time: { hour: 23, minute: 2 } },
]);

app.get('/', (req, res) => {
	if (Object.keys(req.body).length === 0) {
		mails.sendMail('Empty Mail', 'Empty Body');
	} else mails.sendMail(req.body.mail, req.body.mailBody);
	res.status(200).end();
});

app.post('/', (req, res) => {
	if (Object.keys(req.body).length === 0) {
		mails.sendMail('Empty Mail', 'Empty Body');
	} else mails.sendMail(req.body.mail, req.body.mailBody);
	res.status(200).end();
});

app.get('/get-position', (req, res) => {
	res.send(actualPosition);
	res.status(200).end();
});

//CHOFERES
app.post('/sendPushNotificationUsuario', (req, res) => {
	sendPushNotification(req.body.expoToken, 'Viaje Aceptado', {
		costo: 100,
	});
	res.status(200).end();
});

app.post('/sendPushNotificationDriver', (req, res) => {
	sendPushNotification(req.body.expoToken, 'Viaje Aceptado', {
		latitude: req.body.latitude,
		longitude: req.body.longitude,
	});
	res.status(200).end();
});

app.post('/getWorking', (req, res) => {
	let username = parseInt(req.body.username);

	console.log('/getWorking', username);
	pool.query(
		`select trabajando 
		from client left join driver on client_id = driver_id
		where phone = '${username}'`,
		(err, result) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				res.send(result.rows[0]);
				try {
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
});

app.get('/state', (req, res) => {
	//let result = getConfig();
	//console.log(result);
	console.log('choferesDisponibles', choferesDisponibles);
	res.status(200).end();
	// console.log('yuberRequestsData', yuberRequestsData);
	// console.log('chatsMap', chatsMap);
	// console.log('arrayChoferes', arrayChoferes);
});

app.post('/startYuber', (req, res) => {
	let { currentHours, currentMinutes } = getHM();
	let username = parseInt(req.body.username);
	console.log('/startYuber', username, req.body.myExpoToken);
	let newRequest = {
		id: 1,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		expo_token: req.body.myExpoToken,
		push_notification_token: req.body.myExpoToken,
		calificacion: 4,
		autoModelo: 'Peugeot',
		color: 'gris',
		matricula: 'NAY 3456',
		costoViaje: 345,
		ocupado: false,
		token: req.body.myExpoToken,
		username,
		//lastUpdate: { hours: currentHours, minutes: currentMinutes },
	};
	setTrabajando(username, true);

	choferesDisponibles.set(username, newRequest);
	res.send({ idChofer });
	idChofer++;
});

app.get('/stopYuber', (req, res) => {
	const username = req.url.split('=')[1];
	console.log('/stopYuber', username);
	setTrabajando(username, false);
	choferesDisponibles.delete(username.toString());
	console.log(username);
	res.status(200).end();
});

app.get('/getYuberRequests', (req, res) => {
	let array = getArrayFromMap(yuberRequestsData);
	res.send(array);
});

app.get('/yuberRequestsAcceptedData', (req, res) => {
	let array = getArrayFromMap(yuberRequestsAcceptedData);
	res.send(array);
});

//cliente acepta
//pasajero acepta
//El cliente vio la informacion del chofer y lo acepto
app.post('/clientAccept', (req, res) => {
	let idSolicitudAccepted = parseInt(req.body.idSolicitud);
	let driverUserName = yuberRequestsAcceptedData.get(idSolicitudAccepted).username;
	let driverToken = choferesDisponibles.get(driverUserName).push_notification_token;
	let passengerToken = yuberRequestsAcceptedData.get(idSolicitudAccepted).expo_token;
	driverPassengerChatTokens.set(idSolicitudAccepted, {
		passengerToken: passengerToken,
		driverToken: driverToken,
	});
	//console.log('/clientAccept', driverPassengerChatTokens);
	chatsMap.set(idSolicitudAccepted, []);
	//console.log('clientAccepted', driverPassengerChatTokens);
	console.log('----', driverPassengerChatTokens);
	console.log(choferesDisponibles);
	console.log('driverToken ', driverToken);
	choferesDisponibles.get(driverUserName).ocupado = true;
	sendPushNotification(driverToken, '', {
		screen: constants.DRIVER_SCREEN,
		idSolicitud: idSolicitudAccepted,
		done: true,
	});

	//envio viaje a la base
	//(idSolicitud, idChofer, fecha, hora)
	// res.send({ IdChoferSolicitudDone });
	res.status(200).end();
});

app.post('/debug', (req, res) => {
	res.send(driverPassengerChatTokens);
});

app.post('/cabRequestDone', (req, res) => {
	let username = parseInt(req.body.username);
	let idSolicitud = parseInt(req.body.idSolicitud);
	// let IdChoferSolicitudDone = yuberRequestsAcceptedData.get(
	//   parseInt(req.body.idSolicitud)
	// ).idChofer;
	// sendPushNotification(
	//   choferesDisponibles.get(
	//     yuberRequestsAcceptedData.get(req.body.idSolicitud).idChofer
	//   ).expo_token,
	//   "",
	//   { done: true }
	// );
	//choferesDisponibles.get(req.body.idChofer).ocupado = false;
	console.log('/cabRequestDone', idSolicitud);
	if (!parseInt(req.body.username)) res.status(200).end();

	if (choferesDisponibles.get(username)) choferesDisponibles.get(username).ocupado = false;
	if (yuberRequestsAcceptedData.get(idSolicitud)) yuberRequestsAcceptedData.delete(idSolicitud);
	//setOcupado(username, false);
	//envio viaje a la base
	//(idSolicitud, idChofer, fecha, hora)
	//res.send({ IdChoferSolicitudDone });
	res.status(200).end();
});

//chofer Acepta
app.post('/acceptCabRequests', (req, res) => {
	const idCabRequest = parseInt(req.body.idSolicitud);
	const idChofer = req.body.idChofer;
	const myUsername = parseInt(req.body.username);

	console.log('/acceptCabRequests', myUsername, idCabRequest);
	//choferesDisponibles.get(myUsername).ocupado = true;
	choferesDisponibles.get(myUsername).latitude = req.body.latitude;
	choferesDisponibles.get(myUsername).longitude = req.body.longitude;

	//clearInterval(WaitingIdSolicitud.get(idCabRequest));
	//WaitingIdSolicitud.set(idCabRequest, true);
	const cabRequest = yuberRequestsData.get(idCabRequest)
	cabRequest.username = myUsername;
	yuberRequestsAcceptedData.set(idCabRequest, cabRequest);
	yuberRequestsData.delete(idCabRequest);
	arrayChoferes.delete(idCabRequest);
	iteradorId.delete(idCabRequest);
	console.log("yuberRequestsAcceptedData.get(idCabRequest)", yuberRequestsAcceptedData.get(idCabRequest))
	let choferLatitude = choferesDisponibles.get(myUsername).latitude;
	let choferLongitude = choferesDisponibles.get(myUsername).longitude;

	pool.query(
		`SELECT plate_number, brand, colour, model, foto_perfil, rating, nombre, apellido
  FROM driver left join car on id_auto_actual = car_id left join client on driver_id = client_id
  WHERE driver_id=(select client_id
				   from client join driver on client_id = driver_id
				   where phone = '${myUsername}')`,
		(err, res) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					console.log(result);
					sendPushNotification(yuberRequestsAcceptedData.get(idCabRequest).expo_token, '', {
						rating: res.rows[0].rating,
						foto_perfil: res.rows[0].foto_perfil,
						nombre: res.rows[0].nombre,
						apellido: res.rows[0].apellido,
						plate_number: res.rows[0].plate_number,
						brand: res.rows[0].brand,
						colour: res.rows[0].colour,
						model: res.rows[0].model,
						screen: constants.WAITING_DRIVER_SCREEN,
						aceptado: true,
						idSolicitud: idCabRequest,
						driverUserName: myUsername,
						idChoferAccepted: myUsername,
						choferLatitude,
						choferLongitude,
						requestLongitude: yuberRequestsAcceptedData.get(idCabRequest).startLongitude,
						requestLatitude: yuberRequestsAcceptedData.get(idCabRequest).startLatitude,
					});
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);

	clearInterval(idSolicitudInterval.get(idCabRequest));
	res.status(200).end();
});

app.post('/getCurrentCar', (req, res) => {
	const myUsername = parseInt(req.body.username);

	pool.query(
		`SELECT car_id plate_number, brand, colour, model
  FROM driver left join car on id_auto_actual = car_id
  WHERE driver_id=15`,
		(err, res) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					console.log(result);
					sendPushNotification(yuberRequestsAcceptedData.get(idCabRequest).expo_token, '', {
						plate_number: res.rows[0].plate_number,
						brand: res.rows[0].brand,
						colour: res.rows[0].colour,
						model: res.rows[0].model,
						screen: constants.WAITING_DRIVER_SCREEN,
						aceptado: true,
						username: myUsername,
						choferLatitude,
						choferLongitude,
						requestLongitude: yuberRequestsAcceptedData.get(idCabRequest).startLongitude,
						requestLatitude: yuberRequestsAcceptedData.get(idCabRequest).startLatitude,
					});
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);

	clearInterval(idSolicitudInterval.get(idCabRequest));
	res.status(200).end();
});

app.post('/sendPushNotificationClient', (req, res) => {
	let idSolicitud = parseInt(req.body.idSolicitud);
	let message = req.body.message;
	let screen = req.body.screen;
	console.log(yuberRequestsAcceptedData.get(idSolicitud).expo_token, message);

	sendPushNotification(yuberRequestsAcceptedData.get(idSolicitud).expo_token, { screen, message });

	res.status(200).end();
});

//CLIENTES

const limpioDatosDeSolicitud = (idSolicitudActual) => {
	try {
		//No hay mas choferes disponibles, avisar al usuario
		yuberRequestsData.delete(idSolicitudActual);
		arrayChoferes.delete(idSolicitudActual);
		iteradorId.delete(idSolicitudActual);
		driverPassengerChatTokens.delete(idSolicitudActual);
		chatsMap.delete(idSolicitudActual);
		//Le avise a todos los choferes, avisar al usuario
		clearInterval(idSolicitudInterval.get(idSolicitudActual));
	} catch (error) {
		console.log(error);
	}
};

const nextDriver = (idSolicitudActual) => {
	try {
		if (
			choferesDisponibles.get(arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].username).ocupado
		)
			iteradorId.set(idSolicitudActual, iteradorId.get(idSolicitudActual) + 1);
		else return true;
	} catch (error) {
		iteradorId.set(idSolicitudActual, iteradorId.get(idSolicitudActual) + 1);
		return false;
	}
};

app.post('/YuberRequest', async (req, res) => {
	idSolicitud++;
	let idSolicitudActual = idSolicitud;
	console.log('/YuberRequest', idSolicitudActual);
	setIdSolicitud(idSolicitud);

	let newRequest = {
		id: idSolicitudActual,
		aceptado: false,
		startLatitude: req.body.latitude,
		startLongitude: req.body.longitude,
		expo_token: req.body.myExpoToken,
		passengerUsername: req.body.passengerUsername,
		requestTime: req.body.requestTime,
	};
	//let resData = getArrayFromMap(choferesDisponibles);
	let resData;
	try {
		await getChoferesDisponibles().then((e) => {
			resData = e;
		});
	} catch (error) {
		console.log(error);
	}
	console.log('YuberRequest res data', resData.length);

	// if (resData.length == 0) {
	// 	sendPushNotification(req.body.myExpoToken, '', {
	// 		screen: constants.WAITING_DRIVER_SCREEN,
	// 		allDriversNotified: true,
	// 	});
	// 	sendPushNotification(req.body.myExpoToken, '', {
	// 		screen: constants.WAITING_DRIVER_SCREEN,
	// 		allDriversNotified: true,
	// 	});
	// 	res.send({ idSolicitud: idSolicitudActual });
	// 	return;
	// }
	yuberRequestsData.set(idSolicitudActual, newRequest);
	arrayChoferes.set(idSolicitudActual, resData);
	iteradorId.set(idSolicitudActual, 0);
	console.log(resData, resData.length);
	resData.forEach((a) => {
		if (!choferesDisponibles.get(a.phone)) {
			choferesDisponibles.set(a.phone, a);
		}
	});
	avisarConductores(
		req.body.passengerUsername,
		idSolicitudActual,
		resData.length,
		req.body.latitude,
		req.body.longitude,
		req.body.myExpoToken,
		req.body.requestTime,
	);
	let interval = setInterval(
		() =>
			avisarConductores(
				req.body.passengerUsername,
				idSolicitudActual,
				resData.length,
				req.body.latitude,
				req.body.longitude,
				req.body.myExpoToken,
				req.body.requestTime,
			),
		intervaloDeAviso,
	);
	idSolicitudInterval.set(idSolicitudActual, interval);
	res.send({ idSolicitud: idSolicitudActual });
});

const avisarConductores = (
	passengerUsername,
	idSolicitudActual,
	cantChoferes,
	latitude,
	longitude,
	clientExpoToken,
	requestTime,
) => {
	if (
		iteradorId.get(idSolicitudActual) == undefined ||
		cantChoferes == 0 ||
		iteradorId.get(idSolicitudActual) > cantChoferes - 1
	) {
		console.log('----------1-----------');
		try {
			choferesDisponibles.get(
				arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual) - 1].phone,
			).notificando = false;
		} catch (error) { }
		limpioDatosDeSolicitud(idSolicitudActual);
		sendPushNotification(clientExpoToken, '', { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });
		sendPushNotification(clientExpoToken, '', {
			screen: constants.WAITING_DRIVER_SCREEN,
			allDriversNotified: true,
		});

		return;
	}
	console.log(
		choferesDisponibles.get(arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].phone) == undefined,
	);
	while (
		(iteradorId.get(idSolicitudActual) < cantChoferes - 1 &&
			(choferesDisponibles.get(arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].phone)
				.en_viaje ||
				choferesDisponibles.get(arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].phone)
					.notificando)) ||
		!choferesDisponibles.get(arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].phone)
	) {
		console.log(iteradorId.get(idSolicitudActual), cantChoferes - 1);

		iteradorId.set(idSolicitudActual, iteradorId.get(idSolicitudActual) + 1);

		// let encontro = false;
		// while (iteradorId.get(idSolicitudActual) < cantChoferes && !encontro) {
		//   //con esto me cubro por si un chofer se da de baja luego de que cree el array de choferes disponibles
		//   encontro = nextDriver(idSolicitudActual);
		// }

		if (iteradorId.get(idSolicitudActual) >= cantChoferes) {
			console.log('----------2-----------');

			limpioDatosDeSolicitud(idSolicitudActual);
			sendPushNotification(clientExpoToken, '', { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });
			sendPushNotification(clientExpoToken, '', { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });

			return;
		}
	}
	console.log(idSolicitudActual, iteradorId.get(idSolicitudActual), cantChoferes);
	try {
		try {
			choferesDisponibles.get(
				arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual) - 1].phone,
			).notificando = false;
		} catch (error) { }

		try {
			choferesDisponibles.get(
				arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].phone,
			).notificando = true;
		} catch (error) { }
		let requestTime = new Date();
		sendPushNotification(
			arrayChoferes.get(idSolicitudActual)[iteradorId.get(idSolicitudActual)].push_notification_token,
			'Viaje disponibles',
			{
				screen: constants.DRIVER_SCREEN,
				navigateTo: constants.DRIVER_SCREEN,
				cabRequest: {
					latitude,
					longitude,
					idSolicitud: idSolicitudActual,
					passengerUsername,
					requestTime,
				},
			},
			'Nuevo viaje disponible',
		);
		//setTimeout(() => {
		// 	setNotificando(driver_id, false);
		// }, intervaloDeAviso + 2);
		iteradorId.set(idSolicitudActual, iteradorId.get(idSolicitudActual) + 1);
	} catch (error) {
		console.log('\n\n', error, '\n\n');
		return;
	}
};

// sendPushNotification("ExponentPushToken[ShUc8DPKmfX8SgFgtKQR18]", "Viaje ", {
//   id: 122,
//   user: "d",
//   message:
//     "bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d",
//   time: { hour: 3, minute: 2 },
// });

app.post('/cancelYuberRequest', (req, res) => {
	yuberRequestsData.delete(parseInt(req.body.idSolicitud));
	res.sendStatus(200).end();
});

app.post('/isDoneRequest', (req, res) => {
	console.log('/isDoneRequest', parseInt(req.body.idSolicitud));
	let result = yuberRequestsAcceptedData.get(parseInt(req.body.idSolicitud));
	if (!result) res.send({ done: true });
	else res.send({ done: false });
});

app.get('/getChoferesDisponibles', (req, res) => {
	console.log('/getChoferesDisponibles');
	let resData = getArrayFromMap(choferesDisponibles);
	res.send(resData);
});

app.post('/getChoferPosition', (req, res) => {
	console.log('/getChoferPosition', parseInt(req.body.username));
	const location = choferesDisponibles.get(parseInt(req.body.username))
	res.send(location);
});

app.get('/yuberRequestsAcceptedData', (req, res) => {
	let resData = getArrayFromMap(yuberRequestsAcceptedData);
	res.send(resData);
});

//GENERAL
app.post('/send-position', (req, res) => {
	//console.log(myYuberId, req.body.latitude, req.body.longitude);
	let username = parseInt(req.body.username);
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	console.log('/send-position', username, latitude, longitude);
	let { currentHours, currentMinutes } = getHM();
	//choferesDisponibles.get(myYuberId).lastUpdate.hours = currentHours;
	//choferesDisponibles.get(myYuberId).lastUpdate.minutes = currentMinutes;
	if (!choferesDisponibles.get(username)) choferesDisponibles.set(username, { latitude, longitude });
	choferesDisponibles.get(username).latitude = latitude;
	choferesDisponibles.get(username).longitude = longitude;

	res.status(200).end();
});

app.post('/sendMessage', (req, res) => {
	let destExpoToken;
	let idSolicitud = parseInt(req.body.idSolicitud);
	let message = {
		id: idSolicitud,
		user: req.body.clientType == 'driver' ? 'd' : 'p',
		message: req.body.message,
		time: req.body.time,
	};
	console.log(driverPassengerChatTokens.get(idSolicitud));
	console.log(message);
	console.log('/sendMessage', driverPassengerChatTokens, idSolicitud);
	if (req.body.clientType == 'passenger') destExpoToken = driverPassengerChatTokens.get(idSolicitud).driverToken;
	else destExpoToken = driverPassengerChatTokens.get(idSolicitud).passengerToken;
	let aux = chatsMap.get(idSolicitud);
	aux.push(message);
	console.log('chatArray', aux);
	chatsMap.set(idSolicitud, aux);
	console.log(destExpoToken);
	sendPushNotification(destExpoToken, '', { screen: constants.CHAT_SCREEN, message });
	res.status(200).end();
});

app.post('/getChat', (req, res) => {
	let chat = chatsMap.get(parseInt(req.body.idSolicitud));
	res.send(chat);
});

app.get('/reset', (req, res) => {
	idSolicitud = 1;
	idChofer = 1;
	for (var [key] of choferesDisponibles) {
		choferesDisponibles.delete(key);
	}
	//choferesDisponibles.set(1, chofer1);
	for (var [key] of yuberRequestsData) {
		yuberRequestsData.delete(key);
	}
	for (var [key] of arrayChoferes) {
		arrayChoferes.delete(key);
	}
	for (var [key] of iteradorId) {
		iteradorId.delete(key);
	}
	for (var [key] of arrayChoferes) {
		arrayChoferes.delete(key);
	}
	for (var [key] of yuberRequestsAcceptedData) {
		yuberRequestsAcceptedData.delete(key);
	}
	res.sendStatus(200).end();
});

app.listen(port, () => {
	console.log('Server is up on port ' + port);
});

//Uils
const notificacionChoferes = (latitude, longitude, idSolicitud) => {
	for (var [key, value] of choferesDisponibles) {
		value['key'] = key;
		sendPushNotification(value.expo_token, 'Solicitud de Viaje', {
			latitude,
			longitude,
			idSolicitud,
		});
	}
};
const getArrayFromMap = (map) => {
	let resData = [];
	let i = 0;
	console.log('map.size', map.size);
	if (map.size == 0) return [];

	for (var [key, value] of map) {
		//value["key"] = key;
		if (value) {
			value['key'] = i;
			resData.push(value);
			i++;
		}
	}
	return resData;
};

app.post('/logIn', async (req, resp) => {
	pool.query(
		`SELECT client_password, email, CASE
            WHEN driver_id IS NOT null THEN 'driver'
            ELSE 'passenger'
            END 
            AS clientType
    FROM client  
    LEFT JOIN driver ON client_id = driver_id  LEFT JOIN passenger ON  client_id = passenger_id
    WHERE email = '${req.body.email}'`,
		(err, res) => {
			if (err) {
				console.log('Error - Failed to select all from Users');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					if (result.email != req.body.email) resp.status(401).send({ message: 'invalid email' });
					else if (result.client_password != req.body.password) resp.status(401).send({ message: 'wrong password' });
					else if (result.email == req.body.email && result.client_password == req.body.password) {
						console.log(result);
						resp.status(200).send({ clientType: result.clienttype });
					}
				} catch (error) {
					resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
});

app.post('/rateDriver', async (req, resp) => {
	let driverUserName = req.body.driverUserName;
	console.log('/rateDriver', driverUserName);
	let idSolicitud = parseInt(req.body.idSolicitud);
	let rating = req.body.rating;
	let commentText = req.body.commentText;

	pool.query(
		`WITH new_rate AS (
    	INSERT INTO rating(rating, comment_text)
		VALUES (${rating}, '${commentText}')
		RETURNING rating_id
		)
		INSERT INTO ride_rating (ride_id, rating_id)
		VALUES (${idSolicitud}, (
									SELECT rating_id
									FROM new_rate
								)
		)`,
		(err, res) => {
			if (err) console.log(err);
		},
	);

	pool.query(
		` 
		SELECT ratings_quantity, rating, acum_ratings, driver_id
		FROM client join driver on client_id = driver_id
		WHERE phone = '${driverUserName}'`,

		(err, res) => {
			if (err) console.log(err);
			else {
				let newRatingsQuantity = res.rows[0].ratings_quantity + 1;
				let newAcumRatings = res.rows[0].acum_ratings + rating;
				let driver_id = res.rows[0].driver_id;
				let newRating = newAcumRatings / newRatingsQuantity;
				console.log(
					'dasdsadasdsa - ',
					newRatingsQuantity,
					res.rows[0].acum_ratings + rating,
					res.rows[0].driver_id,
					newAcumRatings / newRatingsQuantity,
				),
					pool.query(
						`UPDATE driver
					SET ratings_quantity = ${newRatingsQuantity}, rating = ${newRating}, acum_ratings = ${newAcumRatings}
					WHERE driver_id = ${driver_id}`,
						(err, res) => {
							if (err) console.log(err);
							else {
								resp.sendStatus(200).end();
							}
						},
					);
			}
		},
	);

	pool.query(
		`
    	INSERT INTO ride_drive_passenger(passenger_id, driver_id, ride_id)
		VALUES (${rating}, '${driver_id}')
		RETURNING rating_id
		)
		INSERT INTO ride_rating (ride_id, rating_id)
		VALUES (${idSolicitud}, (
									SELECT rating_id
									FROM new_rate
								)
		)`,
		(err, res) => {
			if (err) console.log(err);
		},
	);
});

app.post('/signUp', async (req, resp) => {
	pool.query(
		`WITH new_client as (
      insert into client(email, client_password, departament)
      values ('${req.body.email}','${req.body.password}','Flores')
      returning client_id
    )
    insert into passenger(passenger_id) values ((select client_id from new_client))`,
		(err, res) => {
			if (err) {
				console.log('Error - Failed to select all from Users');
				resp.status(401).send({ message: 'user exists already' });
				console.log(err);
			} else {
				resp.sendStatus(200).end();
			}
		},
	);
});

app.post('/getRidesDriver', async (req, resp) => {
	console.log('getRidesDriver', parseInt(req.body.username));
	pool.query(
		`SELECT paid, phone, ride_date, latitude, longitude
    	 FROM client LEFT JOIN ride_drive_passenger ON client.client_id = ride_drive_passenger.driver_id JOIN ride ON ride_drive_passenger.ride_id = ride.ride_id
		 where phone='${req.body.username}'
		 ORDER BY ride_date DESC`,

		(err, res) => {
			if (err) {
				console.log('Error - Failed to select all from Users');
				console.log(err);
			} else {
				try {
					resp.status(200).send(JSON.stringify(res.rows));
				} catch (error) {
					resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
});

app.post('/signIn', async (req, resp) => {
	pool.query(`select sign_in('${req.body.email}') as clientType`, (err, res) => {
		if (err) {
			console.log('Error signIn DB');
			console.log(err);
		} else {
			let result = res.rows[0];
			try {
				console.log(result);
				resp.status(200).send({ clientType: result.clienttype });
			} catch (error) {
				resp.status(401).send({ message: 'invalid email' });
			}
		}
	});
});

app.post('/setPushNotificationToken', async (req, resp) => {
	let username = parseInt(req.body.username);
	let token = req.body.pushNotificationToken;
	console.log(username, token);
	await setPushNotificationToken(username, token);
	resp.sendStatus(200).end();
});

const setPushNotificationToken = (username, token) => {
	console.log("setPushNotificationToken---username---", username)
	console.log("setPushNotificationToken---token---", token)
	return new Promise((resolve, reject) => {
		pool.query(
			`UPDATE client
		SET push_notification_token = '${token}'
		WHERE client_id = (SELECT client_id
				   		   FROM client LEFT JOIN driver ON client_id = driver_id LEFT JOIN passenger ON client_id = passenger_id
				  		   WHERE phone = '${username}')`,
			(err, res) => {
				if (err) console.log(err);
			},
		);
	});
};

const getChoferesDisponibles = (driver_phone, value) => {
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT *
			FROM driver JOIN client ON driver_id = client_id JOIN car ON car_id = id_auto_actual
				WHERE trabajando = TRUE AND notificando = FALSE AND en_viaje = FALSE`,
			(err, res) => {
				if (err) {
					reject(err);
					//console.log(err);
				} else {
					//console.log(res.rows[0]);
					resolve(res.rows);
				}
			},
		);
	});
};

const setNotificando = (driver_phone, value) => {
	pool.query(
		`UPDATE driver
		SET notificando = ${value ? 'TRUE' : 'FALSE'}
		WHERE driver_id = (SELECT driver_id
					   FROM driver JOIN client ON driver_id = client_id
				  	   WHERE phone = '${driver_phone}')`,
		(err, res) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					console.log(result);
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
};

const setEnViaje = (driver_phone, value) => {
	pool.query(
		`UPDATE driver
		SET en_viaje = ${value ? 'TRUE' : 'FALSE'}
		WHERE driver_id = (SELECT driver_id
					   FROM driver JOIN client ON driver_id = client_id
				  	   WHERE phone = '${driver_phone}')`,
		(err, res) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					console.log(result);
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
};

const setTrabajando = (driver_phone, value) => {
	pool.query(
		`UPDATE driver
		SET trabajando = ${value ? 'TRUE' : 'FALSE'}
		WHERE driver_id = (SELECT driver_id
					   FROM driver JOIN client ON driver_id = client_id
				  	   WHERE phone = '${driver_phone}')`,
		(err, res) => {
			if (err) {
				console.log('Error signIn DB');
				console.log(err);
			} else {
				let result = res.rows[0];
				try {
					console.log(result);
					//resp.status(200).send({ clientType: result.clienttype });
				} catch (error) {
					//resp.status(401).send({ message: 'invalid email' });
				}
			}
		},
	);
};

const getWorking = (phone, value) => {
	return new Promise((resolve, reject) => {
		pool.query(
			`SELECT trabajando
			FROM driver JOIN client ON driver_id = client_id JOIN car ON car_id = id_auto_actual
				WHERE phone = '3'`,
			(err, res) => {
				if (err) {
					reject(err);
					//console.log(err);
				} else {
					//console.log(res.rows[0]);
					resolve(res.rows[0].trabajando);
				}
			},
		);
	});
};

app.post('/saveRide', async (req, resp) => {
	let latitude = req.body.latitude;
	let longitude = req.body.longitude;
	let driverUsername = req.body.driverUserName;
	let passengerUsername = req.body.passengerUsername;
	let idSolicitud = parseInt(req.body.idSolicitud);

	console.log('/saveRide', driverUsername, passengerUsername, latitude, longitude);
	pool.query(
		`WITH new_ride as (
		    INSERT INTO ride( latitude, longitude, ride_id)
			VALUES (
				${latitude},
				${longitude},
				${idSolicitud}
				)
		      returning ride_id
    		)
    		INSERT INTO ride_drive_passenger(passenger_id, driver_id, ride_id) VALUES (
				(SELECT client_id
				FROM client
				WHERE phone = '${passengerUsername}'), 
				 (SELECT client_id
				FROM client
				WHERE phone = '${driverUsername}'),
				(SELECT ride_id
				FROM new_ride)
			)`,
		(err, res) => {
			if (err) {
				console.log('Error - Failed to select all from Users');
				resp.status(401).send({ message: 'error on save ride' });
				console.log(err);
			} else {
				resp.sendStatus(200).end();
			}
		},
	);
});

const setIdSolicitud = (idSolicitud, config_id = 1) => {
	pool.query(
		`UPDATE config
		SET id_solicitud = ${idSolicitud}
		WHERE config_id = ${config_id}`,
		(err, res) => {
			if (err) console.log(err);
		},
	);
};
