//https://aboutme-backend.herokuapp.com/
//heroku restart -a aboutme-backend

const cors = require("cors");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const sendPushNotification = require("./utilities/expoNotifications");
const sendFirebaseNotification = require("./utilities/firebaseNotifications");

const app = express();
var bodyParser = require("body-parser");
const port = process.env.PORT || 3333;
const mails = require("./src/emails/account");
var jsonParser = bodyParser.json();
const constants = require("./constants");

const j2 =
   "dVG7ucG6QBivq94Kx5j_l3:APA91bHyeDXbl_5yyowTMj94_s7mcXCiCtkAbs8y2o_CcA2iQdeDP8aRErMDhUrWgInUkVa05ezpNB9y5_UJ-ZUC0yKaOWVWJumKZzLyKN2RavjTODG3aqbS2Md3u_HD6IFCyDl0Ux3r";

const lg =
   "cxEwrcplQlWBNst1rkfofH:APA91bElxmXkCUT_B50HksfzLj6aiOtfmcvqNVaKZDsuzeT2v7Jd2QUedor8l_EyR9-fmDdSUged8lNHYDjaHPYBCkIwfEDtFaY9qx0dAoHW3akrNP8Y_4x_iFmQ9Hx9B-2cqmkxnv_y";

const mama =
   "caZpL93vQXyMs8MTbG6D92:APA91bG2Vgq_QKppT9BqHGFqo0Xz8AwGjbvMi6smGNn56tKmVKtHelMrGtt8X8JnHnsOUgocCsEhW5P6gvablYfjC1SMVTF2IjrKuUlJBqpMvKTX2kXSs6kP6XEln9pF0qcpznUT_yY_";

const mia3 =
   "djW1mtFgTaWYIIfGp4X2x_:APA91bE_Xvzngcf0U-DFz-KWoI301IKN6cvLBu7H68wm3SMyQwdf4D5Z0v0Mu5Inc3XyHl1wdu6QRlmC3YKvlwGU2pmC3jSETVbB2c5DuKR5ux_A8yBetLvwW7ELrDZCsScbbOWHvNSM";
let a = { screen: constants.WAITING_DRIVER_SCREEN };

const firebaseToken = mia3;
sendFirebaseNotification(mia3, "", a);
