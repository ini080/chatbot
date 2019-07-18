const XLSX = require("xlsx");
const express = require('express');
const app = express();
const router = express.Router();
const firebase = require("firebase");

let workbook = XLSX.readFile(__dirname + "/public/위도경도.xlsx")
let worksheet = workbook.Sheets["Sheet1"]


// Firebase Info
var config = {
    apiKey: "AIzaSyD4ZkncsADsvtaU7D3H_wT7pKAWvNO-EWg",
    authDomain: "kakao-location.firebaseapp.com",
    databaseURL: "https://kakao-location.firebaseio.com",
    projectId: "kakao-location",
    storageBucket: "kakao-location.appspot.com",
    messagingSenderId: "648358148479",
    appId: "1:648358148479:web:bff412ab8ccb16c2"
};

firebase.initializeApp(config);
console.log( typeof worksheet['C1405'].v );
for ( let i = 1; i <= 3782; i++){

  firebase.database().ref('location_'+i).set({

    // 빈값은 Null로 처리되어있음.
    Location_A : worksheet['A'+i].v,
    Location_B : worksheet['B'+i].v,
    Location_C : worksheet['C'+i].v,
    Location_NX : worksheet['D'+i].v,
    Location_NY : worksheet['E'+i].v,
  });

}
