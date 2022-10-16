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

const setDriverOnRide = (pool, idCabRequest, driverId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `UPDATE ride
         SET "driverId" = ${driverId}
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

const createRide = (pool, passengerId) => {
   return new Promise((resolve, reject) => {
      poolLock.query(
         pool,
         `INSERT INTO ride("passengerId") VALUES(${passengerId}) RETURNING "idCabRequest"`,
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
         `SELECT * 
         FROM ride
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

const checkDrivers = (pool, token) => {
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
               res.rows.forEach((driver) => setTrabajando(pool, driver.driverId, false));
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
};
