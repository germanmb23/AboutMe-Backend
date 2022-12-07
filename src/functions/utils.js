const poolLock = require("../../utilities/poolLock");

const setNotificando = (pool, username, value) => {
   poolLock.query(
      pool,
      `UPDATE driver
		SET notifying = ${value ? "TRUE" : "FALSE"}
		WHERE "driverId" = ${username}`,
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

const getChat = (pool, idSolicitud) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT chat, "driverToken", "passengerToken"
         FROM Ride JOIN (SELECT token AS "driverToken", "driverId" 
			               FROM client JOIN driver ON "clientId" = "driverId"
			               ) AS driver ON Ride."driverId" = driver."driverId"
                        JOIN
                        (SELECT token as "passengerToken", "passengerId" 
                        FROM client JOIN passenger ON "clientId" = "passengerId"
                        ) AS passenger ON Ride."passengerId" = passenger."passengerId"
         WHERE "idCabRequest" = '${idSolicitud}'`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const isDoneCRequest = (pool, idCabRequest) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT done
        FROM ride
        WHERE "idCabRequest" = '${idCabRequest}'`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               if (!res.rows[0]) {
                  resolve({ done: true });
               } else {
                  resolve({ done: res.rows[0]?.done });
               }
            }
         }
      );
   });
};

const setDoneCRequest = (pool, idCabRequest, state, timeEnd) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `UPDATE ride
         SET done = TRUE
         ${state ? `, state = ${state} ` : ""}
         ${timeEnd ? `, "timeEnd" = ${timeEnd} ` : ""}
         WHERE "idCabRequest" = '${idCabRequest}'`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve({ ok: true });
            }
         }
      );
   });
};

const setRideState = (pool, idCabRequest, state) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `UPDATE ride
         SET state = ${state}
         WHERE "idCabRequest" = '${idCabRequest}'`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve({ ok: true });
            }
         }
      );
   });
};

const getUserSettings = (pool, clientId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT * 
         FROM usersetting us JOIN setting s on (us."idSetting" = s."idSetting")
         WHERE "clientId" = '${clientId}'`,
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

const setChannels = (pool, clientId, channels) => {
   let query = `INSERT INTO UserChannel ("clientId", "idChannel") values `;
   channels.forEach((c, index) => {
      query += `(${clientId}, ${c.idChannel})${index == channels.length - 1 ? "" : ", "}`;
   });
   console.log(query);

   return new Promise((resolve, reject) => {
      poolLock.query(pool, query, (err, res) => {
         if (err) {
            console.log(err);
         } else {
            resolve(res.rows);
         }
      });
   });
};

const setUserSettings = (pool, idUserSetting, value) => {
   return new Promise((resolve, reject) => {
      pool.query(
         // pool,
         `UPDATE usersetting
         SET value = ${value}
         WHERE "idUserSetting" = '${idUserSetting}'`,
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

const setDriverOnRide = (pool, idCabRequest, driverId, timeStart, carId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `UPDATE ride
         SET "driverId" = ${driverId},
         "timeStart" = ${timeStart},
         "carId" = ${carId}
         WHERE "idCabRequest" = '${idCabRequest}'`,
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

const setChat = (pool, idSolicitud, chat) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `UPDATE ride
        SET chat =  '${chat}'
        WHERE "idCabRequest" = '${idSolicitud}'`,
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

const createRide = (
   pool,
   passengerId,
   originDescription,
   destinationDescription,
   startLatitude,
   startLongitude,
   endLatitude,
   endLongitude,
   requestTime
) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `INSERT INTO ride("passengerId", "originDescription", "destinationDescription", "startLatitude", "startLongitude",  "endLatitude", "endLongitude", date)
         VALUES(${passengerId}, '${originDescription}', '${destinationDescription}', '${startLatitude}', '${startLongitude}', '${endLatitude}', '${endLongitude}', ${requestTime}) RETURNING "idCabRequest"`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const createOpinion = (pool, clientId, message, date) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `INSERT INTO opinion("clientId", "message", "date")
         VALUES(${clientId}, '${message}', '${date}')`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const getRide = (pool, idCabRequest) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT r."idCabRequest", r."startLatitude", r."startLongitude",  r."endLatitude", r."endLongitude", r.date as "requestTime", c.name as "passengerName", c.token as "passengerToken", r."passengerId" as "passengerUsername"    
         FROM ride r left join client c on r."passengerId" = c."clientId"
         WHERE "idCabRequest" = '${idCabRequest}'`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const createNotification = (pool, idCabRequest) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `INSERT INTO notification("idCabRequest") VALUES(${idCabRequest}) RETURNING "idNotification"`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const createSentNotification = (pool, idNotification, clientId) => {
   poolLock.query(
      pool,
      `INSERT INTO SentNotification("idNotification", "clientId") VALUES(${idNotification}, ${clientId})`,
      (err, res) => {
         if (err) {
            console.log(err);
         } else {
         }
      }
   );
};

const getSentNotification = (pool, idNotification) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT token
            FROM SentNotification sn JOIN client c ON (sn."clientId" = c."clientId")
            WHERE "idNotification" = ${idNotification}`,
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

const getChoferesDisponibles = (pool) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT *
            FROM Driver JOIN Client ON driver."driverId" = client."clientId" 
            WHERE working = TRUE AND "cabInProgress" = FALSE AND notifying = FALSE `,
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

const setEnViaje = (pool, username, value) => {
   poolLock.query(
      pool,
      `UPDATE driver
		SET "cabInProgress" = ${value ? "TRUE" : "FALSE"}
		WHERE "driverId" = ${username}`,
      (err, res) => {
         if (err) {
            console.log("Error signIn DB");
            console.log(err);
         }
      }
   );
};

const setTrabajando = (pool, username, value) => {
   poolLock.query(
      pool,
      `UPDATE driver
        SET working =  ${value ? "TRUE" : "FALSE"}
        WHERE "driverId" = ${username}`,
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

const updateRatings = async (pool, idCabRequest, driver, rating) => {
   let ride = await getRide(pool, idCabRequest);

   let user = await getClient(pool, driver ? ride.driverId : ride.passengerId);

   await poolLock.query(
      pool,
      `UPDATE client
      SET "ratingsQuantity" = ${user.ratingsQuantity + 1},
      "acumRatings" = ${user.acumRatings + rating},
      rating = ${(user.acumRatings + rating) / (user.ratingsQuantity + 1)}
      WHERE "clientId" = ${user.clientId};`,
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

const setCar = (pool, username, carId) => {
   poolLock.query(
      pool,
      `UPDATE driver
        SET "activeCar" =  ${carId}
        WHERE "driverId" = ${username}`,
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

const getToken = (pool, clientId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT token
            FROM Client  
            WHERE "clientId" = ${clientId}`,
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

const isFreeDriver = (pool, username, checkNotificando, check) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT *
			FROM driver
		    WHERE "driverId" = ${username} AND working = TRUE AND notifying = FALSE AND "cabInProgress" = FALSE`,
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

const getClient = (pool, username) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT * 
      FROM client
      WHERE "clientId" = ${username}`,
         (err, res) => {
            if (err) {
               console.log("Error signIn DB");
               console.log(err);
            } else {
               resolve(res.rows[0]);
               try {
               } catch (error) {
                  console.log("Error en getClient");
               }
            }
         }
      );
   });
};

const checkDrivers = (pool, token, username) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT * 
         FROM driver JOIN client ON "clientId" = "driverId"
         WHERE token = '${token}'`,
         (err, res) => {
            if (err) {
               console.log("Error signIn DB");
               console.log(err);
            } else {
               res.rows.forEach((driver) => driver.driverId != username && setTrabajando(pool, driver.driverId, false));
               resolve(res.rows);
            }
         }
      );
   });
};

const getNotificationsCount = (pool, clientId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT count(*)
         FROM SentNotification
         WHERE "clientId" = '${clientId}' AND "readDate" is null`,
         (err, res) => {
            if (err) {
               console.log(err);
            } else {
               resolve(res.rows[0]);
            }
         }
      );
   });
};

const getNotifications = (pool, clientId, pageFrom, pageSize) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `SELECT *
         FROM SentNotification sN LEFT JOIN Notification n on (sN."idNotification" = n."idNotification")
         WHERE "clientId" = '${clientId}' AND "readDate" is NULL
         OFFSET ${pageFrom}
         LIMIT ${pageSize}`,
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

module.exports = {
   setNotificando,
   getChat,
   setChat,
   getChoferesDisponibles,
   setEnViaje,
   setTrabajando,
   getToken,
   isFreeDriver,
   setCar,
   getClient,
   getUserSettings,
   setUserSettings,
   createRide,
   createNotification,
   createSentNotification,
   getRide,
   getSentNotification,
   setDriverOnRide,
   updateRatings,
   checkDrivers,
   isDoneCRequest,
   setDoneCRequest,
   setRideState,
   createOpinion,
   setChannels,
   getNotificationsCount,
   getNotifications,
};
