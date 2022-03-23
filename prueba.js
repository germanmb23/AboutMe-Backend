const { Pool } = require("pg");
const mail = require("@sendgrid/mail");
const pool = new Pool({
  connectionString:
    "postgres://flkcmazo:qVAZRl9H6DOBL4tgCRMEpuyON9SfornP@kesavan.db.elephantsql.com/flkcmazo",
  //"postgres://fmckbrxcweidkf:a65fbc4912953a21d47fc1a6d9f535d059d24c3ec9d985a7b1fbfe7b6a066ceb@ec2-23-20-124-77.compute-1.amazonaws.com:5432/d1tb1uo4ucldbk",
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query(
  `select paid, ride_date
  from client LEFT JOIN ride_drive_passenger on client.client_id = ride_drive_passenger.driver_id left join ride on ride_drive_passenger.driver_id = ride.ride_id
  where email = 'chofer1'
  `,
  (err, res) => {
    console.log(JSON.stringify(res.rows));
  }
);

// app.post("/newPassenger", async (req, resp) => {
// pool.query(
//   `WITH new_client as (
//     insert into client(email, client_password, departament)
//     values ('pasajero1','pasajero1','Flores')
//     returning client_id
//   )
//   insert into passenger(passenger_id) values ((select client_id from new_client))`,
//   (err, res) => {
//     if (err) {
//       console.log("Error - Failed to select all from Users");
//       resp.status(401).send({ message: "user exists already" });
//       console.log(err);
//     } else {
//       res.sendStatus(200).end();
//     }
//   }
// );
// });
