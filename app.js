//https://aboutme-backend.herokuapp.com/
//heroku restart -a aboutme-backend
//https://mac-blog.org.ua/node-rest-udp

const cors = require("cors");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const sendExpoPushNotification = require("./utilities/expoNotifications");
const sendFirebaseNotification = require("./utilities/firebaseNotifications");
const utils = require("./src/functions/utils");

const app = express();
var bodyParser = require("body-parser");
const port = process.env.PORT || 3333;
//const port = process.env.PORT || 3333;

const mails = require("./src/emails/account");
var jsonParser = bodyParser.json();
const constants = require("./constants");
const auth = require("./middleware/auth");

const sendPushNotification = sendFirebaseNotification;

const intervaloDeAviso = 10000; //10 segundos

//para poder obtener el cuerpo de una petición POST
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
const idSolicitudDriverPasengerMap = new Map();

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
         const message = JSON.parse(msg);
         switch (message.event) {
            case SOCKET_SEND_DRIVER_LOCATION:
               console.log("SOCKET_UPDATE_DRIVER_LOCATION");
               //Recibo
               const { clientId, event, passengerUsername, latitude, longitude, idSolicitud: idSolicitudD } = message;
               // console.log(message);
               console.log(passengerUsername);
               if (!passengerUsername) return;
               session_handler.pushMessage(passengerUsername.toString(), message);
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
         console.log("Error en recibo de paquete de socket", error);
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
const pool = new Pool({
   connectionString: "postgres://flkcmazo:qVAZRl9H6DOBL4tgCRMEpuyON9SfornP@kesavan.db.elephantsql.com/flkcmazo",
   //"postgres://fmckbrxcweidkf:a65fbc4912953a21d47fc1a6d9f535d059d24c3ec9d985a7b1fbfe7b6a066ceb@ec2-23-20-124-77.compute-1.amazonaws.com:5432/d1tb1uo4ucldbk",
   ssl: {
      rejectUnauthorized: false,
   },
});

server.listen(port, () => {
   console.log("Server is up on port " + port);
});

const getConfig = () => {
   const ret = pool.query(
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

// pool.query(
//    `
//          UPDATE driver
//          SET notifying = false

//          WHERE driverId = 5`,
//    (err, res) => {
//       if (err) {
//          reject(err);
//          console.log(err);
//          return res;
//       } else {
//       }
//    }
// );

// pool.query(
//    `
//          UPDATE driver
//          SET notifying = false
//          WHERE driverId = 4`,
//    (err, res) => {
//       if (err) {
//          reject(err);
//          console.log(err);
//          return res;
//       } else {
//       }
//    }
// );

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

app.post("/isDoneRequest", (req, resp) => {
   console.log("/isDoneRequest", req.body.idSolicitud);
   // resp.send({ done: true });
   // resp.status(200).end();
   pool.query(
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
});

app.post("/setRideDone", (req, resp) => {
   const { idSolicitud } = req.body;
   console.log("/setRideDone", idSolicitud);
   pool.query(
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
});

app.post("/rate", (req, resp) => {
   let clientType = req.headers["x-user-type"];
   let toClientType;
   if (clientType == "passenger") {
      toClientType = "driver";
   } else toClientType = "passenger";

   const { idSolicitud, rating, comment } = req.body;
   if (toClientType == "driver") {
      pool.query(
         `UPDATE ride
            SET "ratingPassengerToDriver" = ${rating}
            ${", commentPassengerToDriver = '" + comment + "'"}
            WHERE "idCabRequest" = ${idSolicitud}`,
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
            SET "ratingDriverToPassenger" = ${rating}
            ${", commentDriverToPassenfer = '" + comment + "'"}
            WHERE "idCabRequest" = ${idSolicitud}`,
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
   try {
      const { idClient, phone, username } = req.body;

      let result;
      let cabs;

      pool.query(
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
                  pool.query(
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
                           console.log(res1.rows[0].activeCar);

                           pool.query(
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
      console.log("LogIn", error);
   }
});

app.post("/saveRide", async (req, resp) => {
   console.log("/saveRide");
   const { latitude, longitude, driverUsername, passengerUsername, idSolicitud } = req.body;
   //idSolicitudDriverPasengerMap.set(idSolicitud)={clientAdress:{ip:null, port:null}}
   idSolicitudDriverIdPassengerId.set(idSolicitud, { passengerId: passengerUsername, driverId: driverUsername });
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
   const username = req.header("x-user-id");
   const { token } = req.body;
   console.log("setPushNotificationToken", username, token);
   await setPushNotificationToken(username, token);
   resp.sendStatus(200).end();
});

const setPushNotificationToken = (username, token) => {
   return new Promise((resolve, reject) => {
      pool.query(
         `UPDATE client
            SET token = '${token}'
            WHERE "clientId" = ${username}`,
         (err, res) => {
            if (err) console.log(err);
         }
      );
   });
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
            "",
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

// app.post("/sendMessage", (req, res) => {
//    console.log("/sendMessage");

//    let destToken;

//    const { clientType, message, time } = req.body;
//    let idSolicitud = parseInt(req.body.idSolicitud);

//    let messageData = {
//       id: idSolicitud,
//       user: clientType == "driver" ? "d" : "p",
//       message: message,
//       time: time,
//    };

//    // driverPassengerChatTokens.set(idSolicitud, {
//    //    passengerToken,
//    //    driverToken: driverToken,
//    // });

//    const chat = chatMap.get(idSolicitud);
//    // const tokens = driverPassengerChatTokens.get(idSolicitud);
//    //console.log(driverPassengerChatTokens.get(idSolicitud));
//    console.log(messageData);
//    //console.log("/sendMessage", driverPassengerChatTokens, idSolicitud);
//    // if (clientType == "driver") destToken = chat.tokens.driver;
//    // else destToken = chat.tokens;
//    if (clientType == "driver") destToken = chat.tokens.passengerToken;
//    else destToken = chat.tokens.driverToken;

//    chatMap.set(idSolicitud, { chat: [...chat.chat, messageData], tokens: chat.tokens });

//    clientType == "driver" ? "d" : "p",
//       sendPushNotification(destToken, "", { screen: constants.CHAT_SCREEN, messageData });
//    res.status(200).end();
// });

app.post("/getChat", async (req, res) => {
   const resChat = await utils.getChat(pool, req.body.idSolicitud);
   res.send(JSON.parse(resChat.chat)).end();
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
      console.log(error);
   }
};

const handleNotificationDriverState = (driverId) => {
   utils.setNotificando(pool, driverId, true);
   setTimeout(() => utils.setNotificando(pool, driverId, false), intervaloDeAviso);
};

//------------PASSENGERS---------------

app.post("/getChoferPosition", (req, res) => {
   const username = req.body.username;
   console.log("/getChoferPosition", username);
   const location = choferesDisponibles.get(username);
   res.status(200).send(location).end();
});

app.post("/YuberRequest", async (req, res) => {
   const passengerUsername = req.header("x-user-id");

   const date = new Date();
   let idSolicitud =
      date.getMonth().toString() +
      date.getDay().toString() +
      date.getHours().toString() +
      date.getMinutes().toString() +
      date.getSeconds().toString() +
      date.getMilliseconds().toString();

   console.log("/YuberRequest", idSolicitud);

   const { token, latitude, longitude, requestTime } = req.body;

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
      await utils.getChoferesDisponibles(pool).then((e) => {
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

   res.status(200).send({ idSolicitud }).end();
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
      let requestData = yuberRequestData.get(idSolicitud);
      let iterador = requestData ? yuberRequestData.get(idSolicitud).iterador : null;
      let passengerToken = requestData ? yuberRequestData.get(idSolicitud).passengerToken : null;

      if (iterador == null || cantChoferes == 0 || iterador > cantChoferes - 1) {
         sendPushNotification(passengerToken, "", {
            screen: constants.WAITING_DRIVER_SCREEN,
            allDriversNotified: true,
         });
         setTimeout(() => limpioDatosDeSolicitud(idSolicitud), 1000);
         return;
      }
      while (iterador != null && iterador != undefined && iterador <= cantChoferes - 1) {
         const driverId = arrayChoferes.get(idSolicitud)[iterador].driverId;
         const freeDriver = await utils.isFreeDriver(pool, driverId);

         if (freeDriver) {
            let requestTime = new Date();

            handleNotificationDriverState(driverId);

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
   //         driver.driverId,
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
   //         setNotificando(driver.driverId, false);
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
   const passengerToken = yuberRequestData.get(idSolicitud).passengerToken;

   utils.setEnViaje(pool, requestData.choferUsername);

   pool.query(
      `SELECT token
            FROM Client  
            WHERE "clientId" = ${requestData.choferUsername} `,
      (err, res) => {
         if (err) {
            console.log(err);
         } else {
            pool.query(
               `INSERT INTO ride("idCabRequest", "driverId", "passengerId", latitude, longitude, timejs)
                VALUES (${requestData.idCabRequest}, ${requestData.choferUsername}, ${requestData.passengerUsername}, ${
                  requestData.startLatitude
               }, ${requestData.startLongitude}, '${new Date()}') `,
               (err, res) => {
                  if (err) {
                     console.log(err);
                  } else {
                  }
               }
            );
            const data = waitingPassengerAcceptData.get(idSolicitud);
            const driverToken = res.rows[0].token;
            rideInProgressData.set(idSolicitud, { ...data, driverToken });
            waitingPassengerAcceptData.delete(idSolicitud);
            chatMap.set(idSolicitud, { chat: [], tokens: { passengerToken, driverToken: driverToken } });

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
   // driverPassengerChatTokens.set(idSolicitud, {
   //    passengerToken,
   //    driverToken: driverToken,
   // });

   return;
   let driverUserName = yuberRequestsAcceptedData.get(idSolicitudAccepted).username;
   let driverToken = choferesDisponibles.get(driverUserName).push_notification_token;
   //let passengerToken = yuberRequestsAcceptedData.get(idSolicitudAccepted).expo_token;
   // driverPassengerChatTokens.set(idSolicitudAccepted, {
   //    passengerToken: passengerToken,
   //    driverToken: driverToken,
   // });
   // //console.log('/clientAccept', driverPassengerChatTokens);
   // chatMap.set(idSolicitudAccepted, []);
   // //console.log('clientAccepted', driverPassengerChatTokens);
   // console.log("----", driverPassengerChatTokens);
   // console.log(choferesDisponibles);
   // console.log("driverToken ", driverToken);
   // choferesDisponibles.get(driverUserName).ocupado = true;
   // sendPushNotification(driverToken, "", {
   //    screen: constants.DRIVER_SCREEN,
   //    idSolicitud: idSolicitudAccepted,
   //    done: true,
   // });

   // //envio viaje a la base
   // //(idSolicitud, idChofer, fecha, hora)
   // // res.send({ IdChoferSolicitudDone });
   // res.status(200).end();
});

// sendPushNotification("ExponentPushToken[ShUc8DPKmfX8SgFgtKQR18]", "Viaje ", {
//   id: 122,
//   user: "d",
//   message:
//     "bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d bien asdas dasdas d",
//   time: { hour: 3, minute: 2 },
// });

//------------DRIVERS---------------

app.post("/startYuber", (req, res) => {
   const username = req.header("x-user-id");
   console.log("/startYuber", username);
   utils.setTrabajando(pool, username, true);
   res.status(200).end();
});

app.post("/setCar", (req, res) => {
   const username = req.header("x-user-id");
   const { carId } = req.body;
   console.log("/setCar", carId, username);
   utils.setCar(pool, username, carId);
   res.status(200).end();
});

app.put("/newCar", async (req, res) => {
   console.log("/newCar");
   const username = req.header("x-user-id");
   const { plateNumber, colour, model, brand, typeColour } = req.body;

   const result1 = await pool.query(
      `
      INSERT INTO car ("plateNumber", colour, model, brand, "typeColour", "driverId")
      VALUES ('${plateNumber}', '${colour}', '${model}', '${brand}', '${typeColour}', ${username})
      RETURNING *`
   );

   pool.query(
      `
         UPDATE driver
         SET "carId" = ${result1.rows[0].carId}, "activeCar" = ${result1.rows[0].carId}
         where "driverId" = ${username};
         `
   );

   res.json(result1.rows[0]).status(200).end();
});

app.post("/deleteCar", (req, res) => {
   const { carId } = req.body;
   console.log("deleteCar: ", carId);
   pool.query(`DELETE FROM car
         WHERE "carId" = ${carId};`);
   res.status(200).end();
});

app.post("/stopYuber", (req, res) => {
   const username = req.header("x-user-id");
   console.log("/stopYuber", username);
   utils.setTrabajando(pool, username, false);
   res.status(200).end();
});

//chofer Acepta
app.post("/acceptCabRequests", (req, resp) => {
   const username = req.header("x-user-id");
   const { idSolicitud, choferLocation } = req.body;
   const requestData = yuberRequestData.get(idSolicitud);
   const passengerToken = requestData.passengerToken;
   const startLatitude = requestData.startLatitude;
   const startLongitude = requestData.startLongitude;
   waitingPassengerAcceptData.set(idSolicitud, { ...requestData, choferUsername: username, choferLocation });
   limpioDatosDeSolicitud(idSolicitud, false);

   pool.query(
      `SELECT *
        FROM client FULL JOIN driver ON client."clientId" = driver."driverId" FULL JOIN car ON driver."activeCar" = car."carId"
        WHERE "clientId" = ${username} `,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         } else {
            try {
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

   resp.status(200).end();
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
   const username = req.header("x-user-id");

   console.log("/send-position");
   const { latitude, longitude } = req.body;

   console.log("/send-position", username, latitude, longitude);
   updateDriverLocation({ username, latitude, longitude });
   res.sendStatus(200).end();
});

const updateDriverLocation = ({ username, latitude, longitude }) => {
   if (!choferesDisponibles.get(username)) choferesDisponibles.set(username, { latitude, longitude });
   choferesDisponibles.get(username).latitude = latitude;
   choferesDisponibles.get(username).longitude = longitude;
};
//---------

app.get("/getRides/:from/:to", (req, resp) => {
   const { from, to } = req.params;
   const username = req.header("x-user-id");
   console.log("getRides", username, from, to);
   pool.query(
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
});
