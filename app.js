//https://aboutme-backend.herokuapp.com/
//heroku restart -a aboutme-backend
//heroku login
//https://mac-blog.org.ua/node-rest-udp
//https://jaygould.co.uk/2022-04-06-too-many-connections-for-role-error-postgres-serverless-vercel%20copy/
const cors = require("cors");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const sendExpoPushNotification = require("./utilities/expoNotifications");
const sendFirebaseNotification = require("./utilities/firebaseNotifications");
const poolLock = require("./utilities/poolLock");

const utils = require("./src/functions/utils");

const app = express();
var bodyParser = require("body-parser");
const port = process.env.PORT || 4449;
//const port = process.env.PORT || 4444;

const mails = require("./src/emails/account");
var jsonParser = bodyParser.json();
const constants = require("./constants");
const auth = require("./middleware/auth");

const sendPushNotification = sendFirebaseNotification;

const events = { NUEVO_VIAJE: 1, VIAJE_TOMADO: 2, VIAJE_FIN_TIEMPO_ACEPTACION: 3, CHOFER_ACEPTO: 4 };

var AsyncLock = require("async-lock");
var lock = new AsyncLock();

// sendPushNotification(
//    "f_8FKxjXSdST9QuPnrVRSR:APA91bF_ivpZXXZDeP6Om0rulcvxjMFsDBome_ZX-FHKE0gaLvpBIOn67LyrdRCeOPY8YGY8V2sxuGXBMBi-3vO-B0X-x68YlAtbnuO_wsuBj8tKGRDUVtdGdw6qJdmdvIEN8zYaBOlQ",
//    {
//       screen: "DriverScreen",
//       idSolicitud: 215,
//       done: true,
//       requestData: {
//          idCabRequest: 215,
//          accepted: false,
//          startLatitude: 37.422757983347395,
//          startLongitude: -122.0839218981564,
//          passengerToken:
//             "fx1vpjFNQ0ePET_jOGBZT7:APA91bF_iUsI3iVWUwyG0jiz2N9EgwL5aLT_1hgSUMc3giioFNn4KFWE1hUyd2Nt0DYIP5l1-6i2QMhFfzOoVLT9iWH4azcYFdHLj6nomvZRPSXzoJM2GiiEQdCsxsNor27KwTXgc4LI",
//          passengerUsername: "1",
//          requestTime: "2022-10-06T22:19:47.959Z",
//          iterador: 0,
//          name: "German",
//          choferUsername: "5",
//          choferLocation: 0,
//       },
//       cabRequest: {
//          idCabRequest: 215,
//          accepted: false,
//          startLatitude: 37.422757983347395,
//          startLongitude: -122.0839218981564,
//          passengerToken:
//             "fx1vpjFNQ0ePET_jOGBZT7:APA91bF_iUsI3iVWUwyG0jiz2N9EgwL5aLT_1hgSUMc3giioFNn4KFWE1hUyd2Nt0DYIP5l1-6i2QMhFfzOoVLT9iWH4azcYFdHLj6nomvZRPSXzoJM2GiiEQdCsxsNor27KwTXgc4LI",
//          passengerUsername: "1",
//          requestTime: "2022-10-06T22:19:47.959Z",
//          iterador: 0,
//          name: "German",
//          choferUsername: "5",
//          choferLocation: 0,
//       },
//    },
//    "Viaje disponible",
//    "Presiona para aceptar, desliza para cancelar"
// );

const intervaloDeAviso = 10000; //10 segundos

//para poder obtener el cuerpo de una petición POST
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
const idSolicitudDriverPasengerMap = new Map();

const semaforos = new Map();

const TIEMPO_DE_ESPERA_SOLICITUD = 20000;
//----------------TCP SOCKET---------------
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

let socketId;

const rooms = { UPDATE_DRIVER_LOCATION: "update-driver-location" };

const socketsMap = new Map();

const idSolicitudDriverIdPassengerId = new Map();
//EVENTOS
// Initialization
const session_handler = require("io-session-handler").from(io);
session_handler.connectionListener((connection) => {
   console.log("connectionListener", connection);
   console.log(session_handler.sessions);
});

session_handler.onMessageDelivered((data) => {
   console.log("onMessageDelivered", data);
   let sent = session_handler.pushMessage("client-token", "dataaaaaaaa");
   console.log("bbbbbb", sent);
});

const SOCKET_SEND_DRIVER_LOCATION = 1;
const SOCKET_GET_DRIVER_LOCATION = 2;
const SOCKET_PRESENTARSE = 3;
io.on("connection", (socket) => {
   // console.log("Socket conectado", socket.id);

   // const socketUsuario = socketsMap.get(socket.handshake.auth.clientId);
   // if (socketUsuario) {
   //    if (socketUsuario.id != socket.id) {
   //       console.log("Ya estaba conectado desconecto y guardo NUEVO socket");
   //       socketUsuario.disconnect();
   //       socketsMap.delete(socket.handshake.auth.clientId);
   //       socketsMap.set(socket.handshake.auth.clientId, socket);
   //    } else {
   //       console.log("Ya estaba conectado mismo socket", socketUsuario.id, socket.id);
   //    }
   // } else {
   //    socketsMap.set(socket.handshake.auth.clientId, socket);
   //    console.log("Socket NUEVO");
   // }
   // console.log("Cantidad de sockets", socketsMap.size);

   // console.log(socket.id);
   // socketId = socket.id;
   // console.log(socket.handshake.id);
   // console.log(io.sockets.adapter.rooms.size);
   // console.log(io.sockets.sockets.get(socketId)?.emit(rooms.UPDATE_DRIVER_LOCATION, "HOLA"));
   //socket.disconnect();
   // socket.client;
   // setInterval(() => {
   //    socket.i;
   //    socket.emit("chat message", "HOLA");
   // }, 500);
   socket.emit("chat message", "HOLA");
   socket.on(rooms.UPDATE_DRIVER_LOCATION, function (msg) {
      try {
         console.log("sadas");
         session_handler.pushMessage("1", { event: estadoViaje.FINALIZADO });

         const message = JSON.parse(msg);
         switch (message.event) {
            case SOCKET_SEND_DRIVER_LOCATION:
               console.log("SOCKET_UPDATE_DRIVER_LOCATION");
               //Recibo
               const { clientId, event, passengerUsername, latitude, longitude, idSolicitud: idSolicitudD } = message;
               // console.log(message);
               console.log(passengerUsername);
               if (!passengerUsername) return;
               session_handler.pushMessage(passengerUsername.toString(), {
                  ...message,
                  event: SOCKET_SEND_DRIVER_LOCATION,
               });
               // updateDriverLocation({ username: clientId, latitude, longitude });
               // const resD = idSolicitudDriverPasengerMap.get(idSolicitudD);
               // if (resD?.clientAdress) {
               //    console.log("SOCKET PASSENGER", idSolicitudD);
               //    socket.send(
               //       JSON.stringify({ latitude, longitude }),
               //       resD.clientAdress.port,
               //       resD.clientAdress.ip,
               //       (err) => {
               //          console.log("SOCKET PASSENGER", resD.clientAdress.port, resD.clientAdress.ip);
               //          console.log(err ? err : "Sended");
               //          // socket.close();
               //       }
               //    );
               // }
               // console.log(idSolicitudDriverIdPassengerId.get(idSolicitudD));
               // if (!idSolicitudDriverIdPassengerId.get(idSolicitudD)) {
               //    idSolicitudDriverIdPassengerId.set(idSolicitudD, { driverId: clientId, passengerId: 2 });
               //    return;
               // }
               // const passengerId = idSolicitudDriverIdPassengerId.get(idSolicitudD)?.passengerId;
               // if (!passengerId) return;
               // console.log("AAAA");
               // const socketPassenger = socketsMap.get(passengerId);
               // if (!socketPassenger) return;

               // try {
               //    socketPassenger.emit("driver-location", JSON.stringify({ latitude, longitude }));
               // } catch (error) {
               //    console.log("ERROR al enviar ubicacion del chofer al pasajero en evento SOCKET_SEND_DRIVER_LOCATION");
               // }

               break;
            case SOCKET_GET_DRIVER_LOCATION:
               try {
                  const { idSolicitud: idSolicitudP } = message;
                  const resP = idSolicitudDriverPasengerMap.get(idSolicitudP);
                  const clientAdress = { ip: sender.address, port: sender.port };
                  idSolicitudDriverPasengerMap.set(idSolicitudP, { ...resP, clientAdress });
                  console.log(idSolicitudDriverPasengerMap);

                  // let res = idSolicitudDriverPasengerMap.get(idSolicitudP)
                  // if(res){
                  //    res.clientAdress ={ip:sender.address,port:sender.port}
                  // }
                  // idSolicitudDriverPasengerMap.set(idSolicitudP, res)
                  // const location = choferesDisponibles.get("4");
                  // console.log(location);
                  // socket.emit(rooms.UPDATE_DRIVER_LOCATION, JSON.stringify(location));
               } catch (error) {
                  console.log("EROR EN SOCKET_GET_DRIVER_LOCATION");
               }
               break;
            case SOCKET_PRESENTARSE:
               console.log("SOCKET_PRESENTARSE");
               if (message.clientId && message.idSolicitud) {
                  console.log(message.clientId, message.idSolicitud);
                  idSolicitudDriverIdPassengerId.get(message.idSolicitud).passengerId = message.clientId;
               }
               console.log(message);
               break;
            default:
               console.log("------------------------", message);

               break;
         }

         // console.log(socket.id);
         // console.log("Cliente " + message.clientId + " - " + message.message);
      } catch (error) {
         console.log("ERROR en recibo de paquete de socket", error);
      }
   });
});
const getChoferPosition = (username) => {
   return choferesDisponibles.get(username);
};
//-------------------------------------------

//INITIAL CONFIG
const { Pool } = require("pg");
const mail = require("@sendgrid/mail");
const { estadoViaje } = require("./constants");
const pool = new Pool({
   connectionString: "postgres://flkcmazo:qVAZRl9H6DOBL4tgCRMEpuyON9SfornP@kesavan.db.elephantsql.com/flkcmazo",
   //"postgres://fmckbrxcweidkf:a65fbc4912953a21d47fc1a6d9f535d059d24c3ec9d985a7b1fbfe7b6a066ceb@ec2-23-20-124-77.compute-1.amazonaws.com:5432/d1tb1uo4ucldbk",
   ssl: {
      rejectUnauthorized: false,
   },
   max: 3,
});

server.listen(port, () => {
   console.log("Server is up on port " + port);
});

app.get("/ping/:id", async (req, resp) => {
   try {
      const { id } = req.params;

      lock.acquire(
         id,
         async () => {
            console.log("Entro semaforo", id);
            await new Promise((r) => setTimeout(r, 5000));
            console.log("Salgo semaforo", id);
         },
         function (err, ret) {}
      );

      resp.status(200).end();
   } catch (error) {
      console.log("ERROR ping: ", error);
   }
});

const getConfig = () => {
   const ret = poolLock.query(
      pool,
      `
         UPDATE driver
         SET notifying = false	
         WHERE "driverId" = 4`,
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

var idNotificacionRequest;
app.post("/isDoneRequest", (req, resp) => {
   try {
      console.log("/isDoneRequest", req.body.idSolicitud);
      // resp.send({ done: true });
      // resp.status(200).end();
      poolLock.query(
         pool,
         `SELECT done
        FROM ride
        WHERE "idCabRequest" = '${req.body.idSolicitud}'`,
         (err, res) => {
            if (err) {
               resp.status(401).send({ message: "error on save ride" });
               console.log(err);
            } else {
               if (!res.rows[0]) {
                  resp.send({ done: true });
                  setRideDone;
                  resp.status(200).end();
                  return;
               }
               // resp.send({ done: true });
               // resp.status(200).end();
               // return;
               resp.status(200).send(res.rows[0]).end();
            }
         }
      );
   } catch (error) {
      console.log("ERROR rate: ", error);
   }
});

//terminar viaje yuberrequestdone
app.post("/setRideDone", (req, resp) => {
   try {
      const { idSolicitud, passengerUsername } = req.body;
      console.log("/setRideDone", idSolicitud);
      poolLock.query(
         pool,
         `UPDATE ride
         SET done = TRUE
         WHERE "idCabRequest" = '${idSolicitud}'`,
         (err, res) => {
            if (err) {
               resp.status(401).send({ message: "error on save ride" });
               console.log(err);
            } else {
               resp.sendStatus(200).end();
            }
         }
      );
      session_handler.pushMessage(passengerUsername.toString(), { event: estadoViaje.FINALIZADO });
   } catch (error) {
      console.log("ERROR rate: ", error);
   }
});

app.post("/rate", async (req, resp) => {
   try {
      let clientType = req.headers["x-user-type"];
      let toClientType;
      if (clientType == "passenger") {
         toClientType = "driver";
      } else toClientType = "passenger";

      const { idSolicitud, rating, comment } = req.body;
      console.log("/rate", idSolicitud, rating, comment);
      if (toClientType == "driver") {
         //soy passenger, puntuo driver
         await poolLock.query(
            pool,
            `UPDATE ride
            SET "ratingPassengerToDriver" = ${rating}
            ${comment ? ", commentPassengerToDriver = '" + comment + "'" : ""}
            WHERE "idCabRequest" = '${idSolicitud}'`,
            (err, res) => {
               if (err) {
                  resp.status(401).send({ message: "error on save ride" });
                  console.log(err);
               } else {
                  resp.sendStatus(200).end();
               }
            }
         );
         await utils.updateRatings(pool, idSolicitud, true, rating);
      } else {
         //soy driver, puntuo passenger
         poolLock.query(
            pool,
            `UPDATE ride
            SET "ratingDriverToPassenger" = ${rating}
            ${comment ? ", commentDriverToPassenger = '" + comment + "'" : ""}
            WHERE "idCabRequest" = '${idSolicitud}'`,
            (err, res) => {
               if (err) {
                  resp.status(401).send({ message: "error on save ride" });
                  console.log(err);
               } else {
                  resp.sendStatus(200).end();
               }
            }
         );
         await utils.updateRatings(pool, idSolicitud, false, rating);
      }
   } catch (error) {
      console.log("ERROR rate: ", error);
   }
});

app.post("/logIn", (req, res) => {
   try {
      const { idClient, phone, username } = req.body;

      let result;
      let cabs;
      console.log("/login");
      poolLock.query(
         pool,
         `SELECT *
        FROM client FULL JOIN driver ON client."clientId" = driver."driverId"
        FULL JOIN passenger ON client."clientId" = passenger."passengerId"
        FULL JOIN role ON client."rolId" = role."rolId"
        where phone = '${phone}'`,
         (err, res1) => {
            if (err) {
               console.log(err);
               return res1;
            } else {
               if (res1.rows.length == 0) {
                  res.status(401).end();
                  return;
               }
               res1.rows[0].username = res1.rows[0].clientId;
               if (res1.rows[0].rolId == 2) {
                  poolLock.query(
                     pool,
                     `select *
                        from car 
                        where "driverId" = ${res1.rows[0].clientId}
                        `,
                     (err, res2) => {
                        if (err) {
                           console.log("**** Error 1 ****");
                           console.log(err);
                           return;
                        } else {
                           let currentCar = null;
                           if (res1.rows[0].carId) {
                              currentCar = res2.rows.find((c) => c.carId == res1.rows[0].activeCar);
                           }
                           console.log("Active car: ", res1.rows[0].activeCar);

                           poolLock.query(
                              pool,
                              `select *
                                    from ride 
                                    where "driverId" = ${res1.rows[0].clientId} OR "passengerId" = ${res1.rows[0].clientId}
                                    `,
                              (err, res3) => {
                                 if (err) {
                                    console.log("**** Error 3 ****");
                                    console.log(err);
                                    return;
                                 } else {
                                    let currentCar = null;
                                    if (res1.rows[0].carId) {
                                       currentCar = res2.rows.find((c) => c.carId == res1.rows[0].activeCar);
                                    }
                                    //  result = { ...res1.rows[0], cars: res2.rows, currentCar, cabs: res3.rows };
                                    result = { ...res1.rows[0], cars: res2.rows, currentCar };

                                    res.status(200).send(result).end();
                                 }
                              }
                           );
                        }
                     }
                  );
               } else {
                  res.send({ ...res1.rows[0], username: res1.rows[0].clientId });
                  res.status(200).end();
               }
               // poolLock.query(pool,
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
               //             result = { ...result, viajes: res3.rows, username: res1.rows[0].clientId }

               //         }
               //         res.send(result)
               //         res.status(200).end();
               //     }
               // );
            }
         }
      );
   } catch (error) {
      console.log("ERROR LogIn: ", error);
   }
});

app.post("/saveRide", async (req, resp) => {
   try {
      console.log("/saveRide");
      const { latitude, longitude, driverUsername, passengerUsername, idSolicitud } = req.body;
      //idSolicitudDriverPasengerMap.set(idSolicitud)={clientAdress:{ip:null, port:null}}
      idSolicitudDriverIdPassengerId.set(idSolicitud, { passengerId: passengerUsername, driverId: driverUsername });
      console.log("/saveRide", driverUsername, passengerUsername, latitude, longitude, idSolicitud);
      poolLock.query(
         pool,
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
   } catch (error) {
      console.log("ERROR end saveRide");
   }
});

app.post("/setPushNotificationToken", async (req, resp) => {
   try {
      const username = req.header("x-user-id");
      const { token } = req.body;
      console.log("setPushNotificationToken", username, token);
      setPushNotificationToken(username, token);
      utils.checkDrivers(pool, token);
      resp.sendStatus(200).end();
   } catch (error) {
      console.log("ERROR setPushNotificationToken", error);
   }
});

const setPushNotificationToken = (username, token) => {
   poolLock.query(
      pool,
      `UPDATE client
            SET token = '${token}'
            WHERE "clientId" = ${username}`
   );

   // return new Promise((resolve, reject) => {
   //    poolLock.query(pool,
   //       `UPDATE client
   //          SET token = '${token}'
   //          WHERE "clientId" = ${username}`,
   //       (err, res) => {
   //          if (err) console.log(err);
   //       }
   //    );
   // });
};

app.post("/sendMessage", async (req, res) => {
   try {
      console.log("/sendMessage", req.body.idSolicitud);
      let clientType = req.headers["x-user-type"];
      const { message, time, idSolicitud } = req.body;

      const resChat = await utils.getChat(pool, idSolicitud);
      if (!resChat.chat) {
         resChat.chat = JSON.stringify([]);
      }
      const chat = JSON.parse(resChat.chat);

      let messageData = {
         id: idSolicitud,
         user: clientType == "driver" ? "d" : "p",
         message: message,
         time: time,
      };

      chat.push(messageData);

      let destToken;

      if (clientType == "driver") destToken = resChat.passengerToken;
      else destToken = resChat.driverToken;
      utils.setChat(pool, idSolicitud, JSON.stringify(chat));

      clientType == "driver" ? "d" : "p";
      if (destToken) {
         sendPushNotification(
            destToken,
            { screen: constants.CHAT_SCREEN, messageData },
            "Mensaje del conductor",
            messageData.message
         );
      } else {
         console.log("NO ES POSIBLE ENVIAR NOTIFICACION, NO SE PUDO OBTENER TOKEN");
      }
      res.send(chat).end();
   } catch (error) {
      console.log("ERROR end sendMessage");
   }
});

app.post("/getChat", async (req, res) => {
   try {
      const resChat = await utils.getChat(pool, req.body.idSolicitud);
      res.send(JSON.parse(resChat.chat)).end();
   } catch (error) {
      console.log("Error getChat: ", error);
   }
});

const limpioDatosDeSolicitud = (idSolicitud, clearRequestMap = true) => {
   try {
      const coso = idSolicitudInterval.get(idSolicitud);
      clearInterval(coso);

      //No hay mas choferes disponibles, avisar al usuario
      if (clearRequestMap) {
         yuberRequestData.delete(idSolicitud);
      }
      arrayChoferes.delete(idSolicitud);
      idSolicitudInterval.delete(idSolicitud);
      //chatMap.delete(idSolicitud);
      // driverPassengerChatTokens.delete(idSolicitud);
      //Le avise a todos los choferes, avisar al usuario
      console.log("limpioDatosDeSolicitud", idSolicitudInterval.get(idSolicitud), idSolicitud);
   } catch (error) {
      console.log("Error limpioDatosDeSolicitud: ", error);
   }
};

const handleNotificationDriverState = (driverId) => {
   utils.setNotificando(pool, driverId, true);
   setTimeout(() => utils.setNotificando(pool, driverId, false), intervaloDeAviso);
};

//------------PASSENGERS---------------

app.post("/getChoferPosition", (req, res) => {
   try {
      const username = req.body.username;
      console.log("/getChoferPosition", username);
      const location = choferesDisponibles.get(username);
      res.status(200).send(location).end();
   } catch (error) {
      console.log("Error getChoferPosition: ", error);
   }
});

app.post("/YuberRequest", async (req, res) => {
   try {
      const passengerUsername = req.header("x-user-id");

      var passengerClient;
      await utils.getClient(pool, passengerUsername).then((e) => {
         passengerClient = e;
      });

      const responseQuery = await utils.createRide(pool, passengerUsername);

      const idSolicitud = responseQuery.idCabRequest;
      //const date = new Date();
      // let idSolicitud =
      //    date.getMonth().toString() +
      //    date.getDay().toString() +
      //    date.getHours().toString() +
      //    date.getMinutes().toString() +
      //    date.getSeconds().toString() +
      //    date.getMilliseconds().toString();

      console.log("/YuberRequest", idSolicitud);

      const { token, latitude, longitude, requestTime } = req.body;

      let newRequest = {
         idCabRequest: idSolicitud,
         accepted: false,
         startLatitude: latitude,
         startLongitude: longitude,
         passengerToken: req.body.token,
         passengerUsername: passengerUsername,
         requestTime,
         iterador: 0,
         name: passengerClient.name,
      };
      //let resData = getArrayFromMap(choferesDisponibles);
      let resData;

      await utils.getChoferesDisponibles(pool).then((e) => {
         resData = e;
      });

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

      const notificationRes = await utils.createNotification(pool, idSolicitud);

      idNotificacionRequest = notificationRes?.idNotification;

      resData.forEach((u) => {
         if (u.token) {
            sendPushNotification(
               u.token,
               {
                  screen: constants.DRIVER_SCREEN,
                  navigateTo: constants.DRIVER_SCREEN,
                  event: events.NUEVO_VIAJE,
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
         }

         utils.createSentNotification(pool, notificationRes?.idNotification, u.clientId);
      });

      setTimeout(async () => {
         const rideRes = await utils.getRide(pool, idSolicitud);
         //Si todavia no fue agarrado le notifico a los conductores y al cliente del suceso, en caso contrario ya notifique al momento de tomarlo
         if (!rideRes.driverId) {
            const passenger = await utils.getClient(pool, passengerUsername);

            if (passenger.token) {
               sendPushNotification(
                  passenger.token,
                  {
                     screen: constants.WAITING_DRIVER_SCREEN,
                     allDriversNotified: true,
                  },
                  "En este momento no hay conductores "
               );
            } else {
               console.log("ERROR: pasajero sin token al intentar enviar la notificacion");
            }

            const sentNotifications = await utils.getSentNotification(pool, notificationRes?.idNotification);

            sentNotifications.forEach((n) => {
               if (n.token) {
                  console.log("Te perdiste un viaje, tiempo finalizado");
                  sendPushNotification(
                     n.token,
                     { event: events.VIAJE_FIN_TIEMPO_ACEPTACION },
                     "Te perdiste un viaje, tiempo finalizado",
                     null,
                     "",
                     false
                  );
               } else {
                  console.log("ERROR: conductor sin token al intentar enviar la notificacion");
               }
            });
         }
      }, TIEMPO_DE_ESPERA_SOLICITUD);

      // const interval = setInterval(
      //    () =>
      //       avisarConductores(passengerUsername, idSolicitud, resData.length, latitude, longitude, token, requestTime),
      //    intervaloDeAviso
      // );

      // avisarConductores(passengerUsername, idSolicitud, resData.length, latitude, longitude, token, requestTime);

      // idSolicitudInterval.set(idSolicitud, interval);

      res.status(200).send({ idSolicitud }).end();
   } catch (error) {
      console.log("Error YuberRequest: ", error);
   }
});

//Passenger accepta cliente acepta
app.post("/clientAccept", (req, resp) => {
   try {
      console.log("Cliente acepta");
      let idSolicitud = req.body.idSolicitud;
      const requestData = waitingPassengerAcceptData.get(idSolicitud);
      const passengerToken = yuberRequestData.get(idSolicitud).passengerToken;

      utils.setEnViaje(pool, requestData.idChoferAccepted);

      poolLock.query(
         pool,
         `SELECT token
            FROM Client  
            WHERE "clientId" = ${requestData.idChoferAccepted} `,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               const data = waitingPassengerAcceptData.get(idSolicitud);
               const driverToken = res.rows[0].token;
               rideInProgressData.set(idSolicitud, { ...data, driverToken });
               waitingPassengerAcceptData.delete(idSolicitud);
               chatMap.set(idSolicitud, { chat: [], tokens: { passengerToken, driverToken: driverToken } });

               console.log("Notifico driver");
               sendPushNotification(driverToken, {
                  screen: constants.DRIVER_SCREEN,
                  idSolicitud,
                  done: true,
                  requestData,
                  cabRequest: requestData,
               });
               resp.status(200).end();
            }
         }
      );
   } catch (error) {
      console.log("Error startYuber: ", error);
   }
});

//------------DRIVERS---------------

app.post("/startYuber", (req, res) => {
   try {
      const username = req.header("x-user-id");
      console.log("/startYuber", username);
      utils.setTrabajando(pool, username, true);
      res.status(200).end();
   } catch (error) {
      console.log("Error startYuber: ", error);
   }
});

app.post("/setCar", (req, res) => {
   try {
      const username = req.header("x-user-id");
      const { carId } = req.body;
      console.log("/setCar", carId, username);
      utils.setCar(pool, username, carId);
      res.status(200).end();
   } catch (error) {
      console.log("Error setCar: ", error);
   }
});

app.put("/newCar", async (req, res) => {
   try {
      console.log("/newCar");
      const username = req.header("x-user-id");
      const { plateNumber, colour, model, brand, typeColour } = req.body;

      const result1 = await poolLock.query(
         pool,
         `
      INSERT INTO car ("plateNumber", colour, model, brand, "typeColour", "driverId")
      VALUES ('${plateNumber}', '${colour}', '${model}', '${brand}', '${typeColour}', ${username})
      RETURNING *`
      );

      poolLock.query(
         pool,
         `
         UPDATE driver
         SET "carId" = ${result1.rows[0].carId}, "activeCar" = ${result1.rows[0].carId}
         where "driverId" = ${username};
         `
      );

      res.json(result1.rows[0]).status(200).end();
   } catch (error) {
      console.log("Error newCar: ", error);
   }
});

app.post("/deleteCar", (req, res) => {
   try {
      const { carId } = req.body;
      console.log("deleteCar: ", carId);
      poolLock.query(
         pool,
         `DELETE FROM car
         WHERE "carId" = ${carId};`
      );
      res.status(200).end();
   } catch (error) {
      console.log("Error deleteCar: ", error);
   }
});

app.post("/stopYuber", (req, res) => {
   try {
      const username = req.header("x-user-id");
      console.log("/stopYuber", username);
      utils.setTrabajando(pool, username, false);
      res.status(200).end();
   } catch (error) {
      console.log("Error stopYuber: ", error);
   }
});

//chofer Acepta
app.post("/acceptCabRequests", async (req, resp) => {
   const username = req.header("x-user-id");
   const { idSolicitud, choferLocation, driverAcceptTime } = req.body;
   console.log("acceptCabRequests", username);

   lock.acquire(idSolicitud, async () => {
      try {
         //FIX-ME (espero?)

         ride = utils.getRide(pool, idSolicitud);

         if (ride.driverId) {
            resp.status(200).json({ event: events.VIAJE_TOMADO }).end();
            return;
         }

         utils.setDriverOnRide(pool, idSolicitud, username);

         const requestData = yuberRequestData.get(idSolicitud);
         const passengerToken = requestData.passengerToken;
         const startLatitude = requestData.startLatitude;
         const startLongitude = requestData.startLongitude;

         if (ride.driverId) {
            resp.status(200).send({ taked: true }).end();
            return;
         }

         waitingPassengerAcceptData.set(idSolicitud, { ...requestData, idChoferAccepted: username, choferLocation });
         limpioDatosDeSolicitud(idSolicitud, false);

         const sentNotifications = await utils.getSentNotification(pool, idNotificacionRequest);

         sentNotifications.forEach((n) => {
            if (n.token && n.clientId != username) {
               console.log("Te perdiste un viaje,  tomado");
               sendPushNotification(
                  n.token,
                  { event: events.VIAJE_FIN_TIEMPO_ACEPTACION },
                  "Te perdiste un viaje, tomado",
                  null,
                  "",
                  false
               );
            } else {
               console.log("ERROR: conductor sin token al intentar enviar la notificacion");
            }
         });

         poolLock.query(
            pool,
            `SELECT *
        FROM client FULL JOIN driver ON client."clientId" = driver."driverId" FULL JOIN car ON driver."activeCar" = car."carId"
        WHERE "clientId" = ${username} `,
            (err, res) => {
               if (err) {
                  console.log("Error signIn DB");
                  console.log(err);
               } else {
                  try {
                     sendPushNotification(
                        passengerToken,
                        {
                           screen: constants.WAITING_DRIVER_SCREEN,
                           driverAcceptTime,
                           event: events.CHOFER_ACEPTO,
                           ...res.rows[0],
                           aceptado: true,
                           idSolicitud,
                           driverUserName: username,
                           idChoferAccepted: username,
                           choferLatitude: choferLocation.latitude,
                           choferLongitude: choferLocation.longitude,
                           startLongitude,
                           startLatitude,
                           // Fix-me
                           requestTime: new Date(),
                        },
                        "!Conductor disponible!",
                        "Pulsa para ir a confirmar"
                     );
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
      } catch (error) {
         // resp.status(200).end();
         console.log("Error acceptCabRequests: ", error);
      }
   });
   resp.status(200).end();
});

app.post("/send-position", (req, res) => {
   try {
      const username = req.header("x-user-id");

      console.log("/send-position");
      const { latitude, longitude } = req.body;

      console.log("/send-position", username, latitude, longitude);
      updateDriverLocation({ username, latitude, longitude });
      res.sendStatus(200).end();
   } catch (error) {
      console.log("Error send-position: ", error);
   }
});

const updateDriverLocation = ({ username, latitude, longitude }) => {
   if (!choferesDisponibles.get(username)) choferesDisponibles.set(username, { latitude, longitude });
   choferesDisponibles.get(username).latitude = latitude;
   choferesDisponibles.get(username).longitude = longitude;
};

app.get("/getRides/:from/:to", (req, resp) => {
   try {
      const { from, to } = req.params;
      const username = req.header("x-user-id");
      console.log("getRides", username, from, to);
      poolLock.query(
         pool,
         `SELECT date, paid, latitude, longitude, "idCabRequest"
        FROM ride
        WHERE "driverId" = '${username}' OR "passengerId" = '${username}'
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
                  result.rides = res.rows.slice(from, to);
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
   } catch (error) {
      console.log("Error getRides: ", error);
   }
});

app.get("/getSettings", (req, resp) => {
   try {
      const username = req.header("x-user-id");
      console.log("getSettings :", username);
      poolLock.query(
         pool,
         `SELECT *
      FROM usersetting us LEFT JOIN setting s on (us."idSetting" = s."idSetting")
      WHERE "clientId" = '${username}'`,
         (err, res) => {
            if (err) {
               console.log("Error - Failed to select all from Users");
               console.log(err);
            } else {
               try {
                  resp.send(res.rows);
                  resp.status(200).end();
               } catch (error) {
                  resp.status(401).send({ message: "invalid email" });
               }
            }
         }
      );
   } catch (error) {
      console.log("Error getSettings: ", error);
   }
});

app.get("/getHelp", (req, resp) => {
   try {
      const username = req.header("x-user-id");
      console.log("getSettings :", username);
      poolLock.query(
         pool,
         `SELECT *
      FROM help`,
         (err, res) => {
            if (err) {
               console.log("Error - Failed to select all from Users");
               console.log(err);
            } else {
               try {
                  resp.send(res.rows);
                  resp.status(200).end();
               } catch (error) {
                  resp.status(401).send({ message: "invalid email" });
               }
            }
         }
      );
   } catch (error) {
      console.log("Error getHelp: ", error);
   }
});

app.post("/editSettings", (req, res) => {
   try {
      //console.log(myYuberId, req.body.latitude, req.body.longitude);
      const username = req.header("x-user-id");
      const { userSettings } = req.body;

      userSettings.forEach((us) => utils.setUserSettings(pool, us.idUserSetting, us.value));

      res.sendStatus(200).end();
   } catch (error) {
      console.log("Error editSettings: ", error);
   }
});

app.get("/getUserSettings", async (req, res) => {
   try {
      const username = req.header("x-user-id");
      console.log("getUserSettings", username);

      const userSettings = await utils.getUserSettings(pool, username);

      res.send(userSettings).end();
   } catch (error) {
      console.log("Error getUserSettings: ", error);
   }
});
