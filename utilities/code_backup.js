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
         sendPushNotification(passengerToken, {
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
      sendPushNotification(passengerToken, { screen: constants.WAITING_DRIVER_SCREEN, allDriversNotified: true });
   } catch (error) {
      console.log("\n\n", error, "\n\n");
   }
};
