//----------------UDP SOCKET---------------
const dgram = require("dgram");
const socket = dgram.createSocket(
   {
      type: "udp4",
      reuseAddr: true, // <- NOTE: we are asking OS to let us reuse port
   },
   (buffer, sender) => {
      const message = JSON.parse(buffer.toString());
      console.log({
         kind: "UDP_MESSAGE",
         message,
         sender,
      });

      switch (message.event) {
         case SOCKET_SEND_DRIVER_LOCATION:
            console.log("SOCKET_UPDATE_DRIVER_LOCATION");
            //Recibo
            const { clientId, event, latitude, longitude, idSolicitud: idSolicitudD } = message;
            updateDriverLocation({ username: clientId, latitude, longitude });
            const resD = idSolicitudDriverPasengerMap.get(idSolicitudD);
            if (resD?.clientAdress) {
               console.log("SOCKET PASSENGER", idSolicitudD);
               socket.send(
                  JSON.stringify({ latitude, longitude }),
                  resD.clientAdress.port,
                  resD.clientAdress.ip,
                  (err) => {
                     console.log("SOCKET PASSENGER", resD.clientAdress.port, resD.clientAdress.ip);
                     console.log(err ? err : "Sended");
                     // socket.close();
                  }
               );
            }
            break;
         case SOCKET_GET_DRIVER_LOCATION:
            console.log("SOCKET_GET_DRIVER_LOCATION UDP");
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
         default:
            console.log("------------------------", message);
            break;
      }

      // demo: respond to sender
      // socket.send(message.toUpperCase(), sender.port, sender.address, (error) => {
      //    if (error) {
      //       console.error(error);
      //    } else {
      //       console.log(JSON.parse(message));
      //    }
      // });
   }
);

socket.bind(port);
