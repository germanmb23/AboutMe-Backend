const firebase = require("firebase-admin");
const serviceAccount = require("../utilities/yuber-323814-firebase-adminsdk-6take-1dcdd6bd6a.json");

firebase.initializeApp({
   credential: firebase.credential.cert(serviceAccount),
   databaseURL: "https://yuber-323814.firebaseio.com",
});

const sendFirebaseNotification = async (
   targetFirebasePushToken,
   message = undefined,
   data,
   title = "",
   body = "",
   sound = "bocinas"
) => {
   console.log(targetFirebasePushToken, data);

   if (message) data = { ...data, message };
   var message = {
      notification: {
         title,
         body,
         sound,
         // android_channel_id: "new_request_2",
      },
      data: { data: JSON.stringify(data) },
   };

   const options = {
      priority: "high",
      timeToLive: 60 * 60 * 24, // 1 day
   };

   await firebase
      .messaging()
      .sendToDevice(targetFirebasePushToken, message, options)
      .catch((error) => console.log(error));
};

module.exports = sendFirebaseNotification;
