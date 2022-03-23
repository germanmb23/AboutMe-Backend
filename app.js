//https://aboutme-backend.herokuapp.com/
//heroku restart -a aboutme-backend

const cors = require("cors");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const sendExpoPushNotification = require("./utilities/expoNotifications");
const sendFirebaseNotification = require("./utilities/firebaseNotifications");

const app = express();
var bodyParser = require("body-parser");
const port = process.env.PORT || 3333;
const mails = require("./src/emails/account");
var jsonParser = bodyParser.json();
const constants = require("./constants");

const sendPushNotification = sendFirebaseNotification;

const intervaloDeAviso = 10000; //10 segundos

//para poder obtener el cuerpo de una petición POST
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

//INITIAL CONFIG
const { Pool } = require("pg");
const mail = require("@sendgrid/mail");
const pool = new Pool({
   connectionString: "postgres://flkcmazo:qVAZRl9H6DOBL4tgCRMEpuyON9SfornP@kesavan.db.elephantsql.com/flkcmazo",
   //"postgres://fmckbrxcweidkf:a65fbc4912953a21d47fc1a6d9f535d059d24c3ec9d985a7b1fbfe7b6a066ceb@ec2-23-20-124-77.compute-1.amazonaws.com:5432/d1tb1uo4ucldbk",
   ssl: {
      rejectUnauthorized: false,
   },
});

app.listen(port, () => {
   console.log("Server is up on port " + port);
});

const getConfig = () => {
   const ret = pool.query(
      `
         UPDATE driver
         SET notifying = false	
         WHERE driverid = 4`,
      (err, res) => {
         if (err) {
            reject(err);
            console.log(err);
            return res;
         } else {
         }
      }
   );
   console.log(ret);
};

pool.query(
   `
         UPDATE driver
         SET notifying = false	
         WHERE driverid = 4`,
   (err, res) => {
      if (err) {
         reject(err);
         console.log(err);
         return res;
      } else {
      }
   }
);

// const date = new Date()
// const idSolicitud = date.getMonth().toString() + date.getDay().toString() + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString() + date.getMilliseconds().toString()

let choferesDisponibles = new Map();

let yuberRequestData = new Map();
let yuberRequestsAcceptedData = new Map();
let rideInProgressData = new Map();
let waitingPassengerAcceptData = new Map();
let iteradorId = new Map();
let arrayChoferes = new Map();
//let waitingIdSolicitud = new Map();
let idSolititudAccepted = new Map();
let idSolicitudInterval = new Map();
let usersExpoToken = new Map();
let chatMap = new Map();

//------------CLIENTS---------------
app.post("/rate", (req, resp) => {
   const { toClientType, idSolicitud, rating, comment } = req.body;
   if (toClientType == "driver") {
      pool.query(
         `UPDATE ride
            SET ratingPassengerToDriver = ${rating}
            ${", commentPassengerToDriver = '" + comment + "'"}
            WHERE idCabRequest = ${idSolicitud}`,
         (err, res) => {
            if (err) {
               resp.status(401).send({ message: "error on save ride" });
               console.log(err);
            } else {
               resp.sendStatus(200).end();
            }
         }
      );
   } else if ((toClientType = "driver")) {
      pool.query(
         `UPDATE ride
            SET ratingDriverToPassenger = ${rating}
            ${", commentDriverToPassenfer = '" + comment + "'"}
            WHERE idCabRequest = ${idSolicitud}`,
         (err, res) => {
            if (err) {
               resp.status(401).send({ message: "error on save ride" });
               console.log(err);
            } else {
               resp.sendStatus(200).end();
            }
         }
      );
   }
});

app.post("/logIn", (req, res) => {
   const { idClient, phone } = req.body;
   let result;
   let cabs;

   pool.query(
      `SELECT *
        FROM client FULL JOIN driver ON client.clientId = driver.driverId
        FULL JOIN passenger ON client.clientId = passenger.passengerId
        FULL JOIN role ON client.rolId = role.rolId
        where phone = '${phone}'`,
      (err, res1) => {
         if (err) {
            console.log(err);
            return res1;
         } else {
            console.log(res1.rows);
            if (res1.rows.length == 0) {
               res.status(401).end();
               return;
            }
            res1.rows[0].clientType = res1.rows[0].clienttype;
            res1.rows[0].username = res1.rows[0].clientid;
            if (res1.rows[0].rolid == 2) {
               pool.query(
                  `select *
                        from car 
                        where driverId = ${res1.rows[0].clientid}
                        `,
                  (err, res2) => {
                     if (err) {
                        console.log("**** Error res 2 ****");
                        console.log(err);
                        return;
                     } else {
                        console.log("**** Error res 2 else****");

                        let currentCar = null;
                        if (res1.rows[0].carid) {
                           currentCar = res2.rows.find((c) => c.carid == res1.rows[0].activecar);
                        }

                        pool.query(
                           `select *
                                    from ride 
                                    where driverid = ${res1.rows[0].clientid} OR passengerId = ${res1.rows[0].clientid}
                                    `,
                           (err, res3) => {
                              if (err) {
                                 console.log("**** Error res 2 ****");
                                 console.log(err);
                                 return;
                              } else {
                                 console.log("**** Error res 2 else****");

                                 let currentCar = null;
                                 if (res1.rows[0].carid) {
                                    currentCar = res2.rows.find((c) => c.carid == res1.rows[0].activecar);
                                 }
                                 console.log(res3.rows);
                                 //  result = { ...res1.rows[0], cars: res2.rows, currentCar, cabs: res3.rows };
                                 result = { ...res1.rows[0], cars: res2.rows, currentCar };
                                 res.send(result);
                                 res.status(200).end();
                              }
                           }
                        );
                     }
                  }
               );
            } else {
               res.send({ ...res1.rows[0], username: res1.rows[0].clientid });
               res.status(200).end();
            }
            // pool.query(
            //     `
            //     select *
            //     from ride
            //     where driverId = ${idClient} OR passengerId = ${idClient}
            //     `,
            //     (err, res3) => {
            //         if (err) {
            //             console.log(err)
            //             return
            //         } else {
            //             result = { ...result, viajes: res3.rows, username: res1.rows[0].clientid }

            //         }
            //         res.send(result)
            //         res.status(200).end();
            //     }
            // );
         }
      }
   );
});

app.post("/isDoneRequest", (req, resp) => {
   console.log("/isDoneRequest", req.body.idSolicitud);
   pool.query(
      `SELECT done
        FROM ride
        WHERE idCabRequest = ${req.body.idSolicitud} `,
      (err, res) => {
         if (err) {
            resp.status(401).send({ message: "error on save ride" });
            console.log(err);
         } else {
            resp.send(res.rows);
            resp.status(200).end();
         }
      }
   );
});

app.post("/saveRide", async (req, resp) => {
   const { latitude, longitude, driverUsername, passengerUsername, idSolicitud } = req.body;

   console.log("/saveRide", driverUsername, passengerUsername, latitude, longitude, idSolicitud);
   pool.query(
      `INSERT INTO ride(idCabRequest, driverId, passengerId, latitude, longitude)
        VALUES (${idSolicitud}, ${driverUsername}, ${passengerUsername}, ${latitude}, ${longitude})`,
      (err, res) => {
         if (err) {
            resp.status(401).send({ message: "error on save ride" });
            console.log(err);
         } else {
            resp.sendStatus(200).end();
         }
      }
   );
});

app.post("/setPushNotificationToken", async (req, resp) => {
   const { username, token } = req.body;
   console.log("setPushNotificationToken", username, token);
   await setPushNotificationToken(username, token);
   resp.sendStatus(200).end();
});

const setPushNotificationToken = (username, token) => {
   return new Promise((resolve, reject) => {
      pool.query(
         `UPDATE client
            SET token = '${token}'
            WHERE clientId = ${username}`,
         (err, res) => {
            if (err) console.log(err);
         }
      );
   });
};

app.post("/sendMessage", (req, res) => {
   let destToken;

   const { clientType, message, time } = req.body;
   let idSolicitud = parseInt(req.body.idSolicitud);

   let messageData = {
      id: idSolicitud,
      user: clientType == "driver" ? "d" : "p",
      message: message,
      time: time,
   };

   const chat = chatMap.get(idSolicitud);
   console.log(driverPassengerChatTokens.get(idSolicitud));
   console.log(messageData);
   console.log("/sendMessage", driverPassengerChatTokens, idSolicitud);
   if (clientType == "driver") destToken = chat.tokens.driver;
   else destToken = chat.tokens;

   chatMap.set(idSolicitud, { chat: [...chat.chat, messageData], tokens: chat.tokens });

   clientType == "driver" ? "d" : "p",
      sendPushNotification(destToken, "", { screen: constants.CHAT_SCREEN, messageData });
   res.status(200).end();
});

app.post("/getChat", (req, res) => {
   let chat = chatMap.get(parseInt(req.body.idSolicitud));
   res.send(chat);
});

const limpioDatosDeSolicitud = (idSolicitud) => {
   try {
      console.log(idSolicitudInterval);
      const coso = idSolicitudInterval.get(idSolicitud);
      clearInterval(coso);

      //No hay mas choferes disponibles, avisar al usuario
      yuberRequestData.delete(idSolicitud);
      arrayChoferes.delete(idSolicitud);
      idSolicitudInterval.delete(idSolicitud);
      //chatMap.delete(idSolicitud);
      // driverPassengerChatTokens.delete(idSolicitud);
      //Le avise a todos los choferes, avisar al usuario
      console.log(idSolicitudInterval);
      console.log("limpioDatosDeSolicitud", idSolicitudInterval.get(idSolicitud), idSolicitud);
   } catch (error) {
      console.log(error);
   }
};

const isFreeDriver = (username, checkNotificando, check) => {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT *
			FROM driver
		    WHERE driverId = ${username} AND working = TRUE AND notifying = FALSE AND cabInProgress = FALSE`,
         (err, res) => {
            if (err) {
               console.log(err);
               reject(err);
            } else {
               resolve(res.rows.length > 0);
            }
         }
      );
   });
};

const handleNotificationDriverState = (driverid) => {
   setNotificando(driverid, true);
   setTimeout(() => setNotificando(driverid, false), intervaloDeAviso);
};
//------------PASSENGERS---------------

app.post("/getChoferPosition", (req, res) => {
   const username = req.body.username;
   console.log("/getChoferPosition", username);
   const location = choferesDisponibles.get(username);
   res.send(location);
   res.status(200).end();
});

app.post("/YuberRequest", async (req, res) => {
   const date = new Date();
   let idSolicitud =
      date.getMonth().toString() +
      date.getDay().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      date.getMilliseconds().toString();

   console.log("/YuberRequest", idSolicitud);

   const { token, latitude, longitude, passengerUsername, requestTime } = req.body;

   let newRequest = {
      idCabRequest: idSolicitud,
      accepted: false,
      startLatitude: latitude,
      startLongitude: longitude,
      passengerToken: req.body.token,
      passengerUsername: passengerUsername,
      requestTime: requestTime,
      iterador: 0,
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
   console.log("new req", resData.length);

   // if (resData.length == 0) {
   // 	sendPushNotification(req.body.myExpoToken, '', {
   // 		screen: constants.WAITING_DRIVER_SCREEN,
   // 		allDriversNotified: true,
   // 	});
   // 	sendPushNotification(req.body.myExpoToken, '', {
   // 		screen: constants.WAITING_DRIVER_SCREEN,
   // 		allDriversNotified: true,
   // 	});
   // 	res.send({ idSolicitud: idSolicitud });
   // 	return;
   // }

   yuberRequestData.set(idSolicitud, newRequest);
   arrayChoferes.set(idSolicitud, resData);

   // resData.forEach((a) => {
   //     if (!choferesDisponibles.get(a.phone)) {
   //         choferesDisponibles.set(a.phone, a);
   //     }
   // });

   const interval = setInterval(
      () => avisarConductores(passengerUsername, idSolicitud, resData.length, latitude, longitude, token, requestTime),
      intervaloDeAviso
   );

   avisarConductores(passengerUsername, idSolicitud, resData.length, latitude, longitude, token, requestTime);

   idSolicitudInterval.set(idSolicitud, interval);

   console.log(idSolicitudInterval, interval);
   res.send({ idSolicitud });
});

const avisarConductores = async (
   passengerUsername,
   idSolicitud,
   cantChoferes,
   latitude,
   longitude,
   clientExpoToken,
   requestTime
) => {
   try {
      console.log("INTERVAL");
      let requestData = yuberRequestData.get(idSolicitud);
      let iterador = requestData ? yuberRequestData.get(idSolicitud).iterador : null;
      let passengerToken = requestData ? yuberRequestData.get(idSolicitud).passengerToken : null;

      if (iterador == null || cantChoferes == 0 || iterador > cantChoferes - 1) {
         console.log("----------1-----------");

         sendPushNotification(passengerToken, "", {
            screen: constants.WAITING_DRIVER_SCREEN,
            allDriversNotified: true,
         });
         setTimeout(() => limpioDatosDeSolicitud(idSolicitud), 1000);
         return;
      }
      console.log("----------2-----------");
      console.log("arrayChoferes.get(idSolicitud)[iterador]", arrayChoferes.get(idSolicitud)[iterador], idSolicitud);
      while (iterador != null && iterador != undefined && iterador <= cantChoferes - 1) {
         const driverid = arrayChoferes.get(idSolicitud)[iterador].driverid;
         const freeDriver = await isFreeDriver(driverid);
         console.log("----------2.1-----------");

         if (freeDriver) {
            let requestTime = new Date();

            handleNotificationDriverState(driverid);

            sendPushNotification(
               arrayChoferes.get(idSolicitud)[iterador].token,
               "Viaje disponibles",
               {
                  screen: constants.DRIVER_SCREEN,
                  navigateTo: constants.DRIVER_SCREEN,
                  cabRequest: {
                     latitude,
                     longitude,
                     idSolicitud,
                     passengerUsername,
                     requestTime,
                  },
               },
               "Nuevo viaje disponible"
            );
            return;
         }

         iterador++;
         yuberRequestData.get(idSolicitud).iterador = iterador;

         // if (iterador > cantChoferes - 1) {
         //     console.log('----------3-----------');
         //     limpioDatosDeSolicitud(idSolicitud);
         //     sendPushNotification(passengerToken, '', { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });
         // }

         // let encontro = false;
         // while (iteradorId.get(idSolicitud) < cantChoferes && !encontro) {
         //   //con esto me cubro por si un chofer se da de baja luego de que cree el array de choferes disponibles
         //   encontro = nextDriver(idSolicitud);
         // }
      }

      console.log("----------4-----------", idSolicitud);
      limpioDatosDeSolicitud(idSolicitud);
      sendPushNotification(passengerToken, "", { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });
      return;
   } catch (error) {
      console.log("\n\n", error, "\n\n");
      return;
   }
   // try {
   //     let driver = arrayChoferes.get(idSolicitud)[iteradorId]
   //     console.log("arrayChoferes.get(idSolicitud)", arrayChoferes.get(idSolicitud))
   //     setNotificando(choferesDisponibles.get(
   //         driver.driverid,
   //     ), true)

   //     let requestTime = new Date();
   //     sendPushNotification(
   //         driver.token,
   //         'Viaje disponibles',
   //         {
   //             screen: constants.DRIVER_SCREEN,
   //             navigateTo: constants.DRIVER_SCREEN,
   //             cabRequest: {
   //                 latitude,
   //                 longitude,
   //                 idSolicitud: idSolicitud,
   //                 passengerUsername,
   //                 requestTime,
   //             },
   //         },
   //         'Nuevo viaje disponible',
   //     );

   //     setTimeout(() => {
   //         setNotificando(driver.driverid, false);
   //     }, intervaloDeAviso);
   //     yuberRequestData.get(idSolicitud).iterador = iterador + 1

   // } catch (error) {
   //     console.log('\n\n', error, '\n\n');
   //     return;
   // }
};

//Passenger accepta
app.post("/clientAccept", (req, resp) => {
   let idSolicitud = req.body.idSolicitud;
   const requestData = waitingPassengerAcceptData.get(idSolicitud);
   pool.query(
      `SELECT token
            FROM Client  
            WHERE clientId = ${requestData.choferUsername} `,
      (err, res) => {
         if (err) {
            console.log(err);
         } else {
            const data = waitingPassengerAcceptData.get(idSolicitud);
            const driverToken = res.rows[0].token;
            rideInProgressData.set(idSolicitud, { ...data, driverToken });
            waitingPassengerAcceptData.delete(idSolicitud);
            sendPushNotification(driverToken, "", {
               screen: constants.DRIVER_SCREEN,
               idSolicitud,
               done: true,
               requestData,
            });
            resp.status(200).end();
         }
      }
   );

   return;
   let driverUserName = yuberRequestsAcceptedData.get(idSolicitudAccepted).username;
   let driverToken = choferesDisponibles.get(driverUserName).push_notification_token;
   let passengerToken = yuberRequestsAcceptedData.get(idSolicitudAccepted).expo_token;
   driverPassengerChatTokens.set(idSolicitudAccepted, {
      passengerToken: passengerToken,
      driverToken: driverToken,
   });
   //console.log('/clientAccept', driverPassengerChatTokens);
   chatMap.set(idSolicitudAccepted, []);
   //console.log('clientAccepted', driverPassengerChatTokens);
   console.log("----", driverPassengerChatTokens);
   console.log(choferesDisponibles);
   console.log("driverToken ", driverToken);
   choferesDisponibles.get(driverUserName).ocupado = true;
   sendPushNotification(driverToken, "", {
      screen: constants.DRIVER_SCREEN,
      idSolicitud: idSolicitudAccepted,
      done: true,
   });

   //envio viaje a la base
   //(idSolicitud, idChofer, fecha, hora)
   // res.send({ IdChoferSolicitudDone });
   res.status(200).end();
});

// sendPushNotification("ExponentPushToken[ShUc8DPKmfX8SgFgtKQR18]", "Viaje ", {
//   id: 122,
//   user: "d",
//   message:
//     "bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d",
//   time: { hour: 3, minute: 2 },
// });

const getChoferesDisponibles = (driver_phone, value) => {
   return new Promise((resolve, reject) => {
      pool.query(
         `SELECT *
            FROM Driver JOIN Client ON driver.driverId = client.clientId 
            WHERE working = TRUE AND cabInProgress = FALSE AND notifying = FALSE `,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows);
            }
         }
      );
   });
};

//------------DRIVERS---------------

app.post("/startYuber", (req, res) => {
   const username = parseInt(req.body.username);
   console.log("/startYuber", username);
   setTrabajando(username, true);
});

app.post("/stopYuber", (req, res) => {
   const username = parseInt(req.body.username);
   console.log("/stopYuber", username);
   setTrabajando(username, false);
});

//chofer Acepta
app.post("/acceptCabRequests", (req, resp) => {
   console.log("-------------------111-------------------------");
   const { idSolicitud, username, choferLocation } = req.body;
   const requestData = yuberRequestData.get(idSolicitud);
   console.log(requestData);
   const passengerToken = requestData.passengerToken;
   const startLatitude = requestData.startLatitude;
   const startLongitude = requestData.startLongitude;
   console.log(requestData);
   waitingPassengerAcceptData.set(idSolicitud, { ...requestData, choferUsername: username, choferLocation });
   limpioDatosDeSolicitud(idSolicitud);
   console.log("-------------------222-------------------------");

   pool.query(
      `SELECT *
        FROM client FULL JOIN driver ON client.clientId = driver.driverId FULL JOIN car ON driver.activeCar = car.carId
        WHERE clientId = ${username} `,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         } else {
            try {
               console.log("/acceptCabRequestsOk", {
                  screen: constants.WAITING_DRIVER_SCREEN,
                  ...res.rows[0],
                  aceptado: true,
                  idSolicitud,
                  driverUserName: username,
                  idChoferAccepted: username,
                  choferLatitude: choferLocation.latitude,
                  choferLongitude: choferLocation.longitude,
                  requestLongitude: startLongitude,
                  requestLatitude: startLatitude,
               });
               sendPushNotification(passengerToken, "", {
                  screen: constants.WAITING_DRIVER_SCREEN,
                  ...res.rows[0],
                  aceptado: true,
                  idSolicitud,
                  driverUserName: username,
                  idChoferAccepted: username,
                  choferLatitude: choferLocation.latitude,
                  choferLongitude: choferLocation.longitude,
                  requestLongitude: startLongitude,
                  requestLatitude: startLatitude,
               });
               resp.status(200).end();
               return;
               //resp.status(200).send({ clientType: result.clienttype });
            } catch (error) {
               console.log(error);
               //resp.status(401).send({ message: 'invalid email' });
            }
         }
      }
   );

   return;
   //choferesDisponibles.get(myUsername).ocupado = true;
   choferesDisponibles.get(passengerUsername).latitude = req.body.latitude;
   choferesDisponibles.get(passengerUsername).longitude = req.body.longitude;

   //clearInterval(WaitingIdSolicitud.get(idCabRequest));
   //WaitingIdSolicitud.set(idCabRequest, true);
   const cabRequest = yuberRequestsData.get(idCabRequest);
   cabRequest.username = passengerUsername;
   yuberRequestsAcceptedData.set(idCabRequest, cabRequest);
   yuberRequestsData.delete(idCabRequest);
   arrayChoferes.delete(idCabRequest);
   iteradorId.delete(idCabRequest);
   console.log("yuberRequestsAcceptedData.get(idCabRequest)", yuberRequestsAcceptedData.get(idCabRequest));
   let choferLatitude = choferesDisponibles.get(passengerUsername).latitude;
   let choferLongitude = choferesDisponibles.get(passengerUsername).longitude;

   pool.query(
      `SELECT plate_number, brand, colour, model, foto_perfil, rating, nombre, apellido
  FROM driver left join car on id_auto_actual = car_id left join client on driver_id = client_id
  WHERE driver_id=(select client_id
				   from client join driver on client_id = driver_id
				   where phone = '${passengerUsername}')`,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         } else {
            let result = res.rows[0];
            try {
               console.log(result);
               sendPushNotification(yuberRequestsAcceptedData.get(idCabRequest).expo_token, "", {
                  screen: constants.WAITING_DRIVER_SCREEN,
                  rating: res.rows[0].rating,
                  foto_perfil: res.rows[0].foto_perfil,
                  nombre: res.rows[0].nombre,
                  apellido: res.rows[0].apellido,
                  plate_number: res.rows[0].plate_number,
                  brand: res.rows[0].brand,
                  colour: res.rows[0].colour,
                  model: res.rows[0].model,
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
      }
   );

   clearInterval(idSolicitudInterval.get(idCabRequest));
   res.status(200).end();
});

app.post("/send-position", (req, res) => {
   //console.log(myYuberId, req.body.latitude, req.body.longitude);
   const { username, latitude, longitude } = req.body;

   console.log("/send-position", username, latitude, longitude);
   if (!choferesDisponibles.get(username)) choferesDisponibles.set(username, { latitude, longitude });
   choferesDisponibles.get(username).latitude = latitude;
   choferesDisponibles.get(username).longitude = longitude;

   res.status(200).end();
});

//---------
const setTrabajando = (username, value) => {
   pool.query(
      `UPDATE driver
        SET working =  ${value ? "TRUE" : "FALSE"}
        WHERE driverId = ${username}`,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         } else {
            try {
            } catch (error) {}
         }
      }
   );
};

const setNotificando = (username, value) => {
   pool.query(
      `UPDATE driver
		SET notifying = ${value ? "TRUE" : "FALSE"}
		WHERE driverId = ${username}`,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         } else {
            try {
               //resp.status(200).send({ clientType: result.clienttype });
            } catch (error) {
               //resp.status(401).send({ message: 'invalid email' });
            }
         }
      }
   );
};

const setEnViaje = (username, value) => {
   pool.query(
      `UPDATE driver
		SET cabInProgress = ${value ? "TRUE" : "FALSE"}
		WHERE driverId = ${username}`,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
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
      }
   );
};

app.post("/getRides", async (req, resp) => {
   console.log("getRides", req.body.username, req.body.from, req.body.to);
   pool.query(
      `SELECT *
        FROM ride
        WHERE driverid = '${req.body.username}' OR passengerId = '${req.body.username}'
        ORDER BY date DESC`,
      (err, res) => {
         if (err) {
            console.log("Error - Failed to select all from Users");
            console.log(err);
         } else {
            try {
               let paid = 0;
               let whithoutPaying = 0;
               res.rows.map((ride) => {
                  ride.paid ? paid++ : whithoutPaying++;
               });
               const result = {};
               result.rides = res.rows.slice(req.body.from, req.body.to);
               console.log(result.rides.length);
               result.paid = paid;
               result.totalRides = res.rows.length;
               result.whithoutPaying = whithoutPaying;
               resp.send(result);
               resp.status(200).end();
            } catch (error) {
               resp.status(401).send({ message: "invalid email" });
            }
         }
      }
   );
});
