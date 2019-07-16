let request = require('request');
let cheerio = require('cheerio');
const firebase = require("firebase");


const $url = 'http://api.gwangju.go.kr/json/stationInfo';

/* API KEY */
const $KEY = '3xdrYGV1u%2Buh2CQpRWI5Yrksa8SSTfgaYeNlNONmLGdZruok%2Frq08aizZkkLak1GYLGBhzwlLJibf6dWAqPd9A%3D%3D';

/* 조합 URL */
const $api_url = $url + '?serviceKey=' + $KEY

console.log($api_url);


// Your web app's Firebase configuration
var config  = {
  apiKey: "AIzaSyCT7asnhQkhxll_K12MxHEGA9hFSz5EjsU",
  authDomain: "mystation-5d037.firebaseapp.com",
  databaseURL: "https://mystation-5d037.firebaseio.com",
  projectId: "mystation-5d037",
  storageBucket: "mystation-5d037.appspot.com",
  messagingSenderId: "633894674604",
  appId: "1:633894674604:web:bfe6feb2ba4ba7ca"
};
// Initialize Firebase
firebase.initializeApp(config);





request($api_url, function(err,res,body){
  $ = cheerio.load(body);

  obj = JSON.parse(body);
  // console.log(obj);



  for( var i = 1; i <= 3604; i++){
    firebase.database().ref('staion'+i).set({
      STATION_ID : i,
      BUSSTOP_ID : obj.STATION_LIST[i].BUSSTOP_ID,
      BUSSTOP_NAME : obj.STATION_LIST[i].BUSSTOP_NAME
    });
  }




});
