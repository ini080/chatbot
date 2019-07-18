const express = require('express');
const app = express();

let request = require('request');
let cheerio = require('cheerio');

const firebase = require("firebase");
var bodyParser = require('body-parser')

// 사용 API : (신)동네예보정보조회서비스
//  https://www.data.go.kr/subMain.jsp#/L3B1YnIvcG90L215cC9Jcm9zTXlQYWdlL29wZW5EZXZEZXRhaWxQYWdlJEBeMDgyTTAwMDAxMzBeTTAwMDAxMzUkQF5wdWJsaWNEYXRhRGV0YWlsUGs9dWRkaTo5ZWQzZTRlMS0zNjU0LTQzN2EtYTg2Yi1iODg4OTIwMzRmOTAkQF5wcmN1c2VSZXFzdFNlcU5vPTc5MjQxNTQkQF5yZXFzdFN0ZXBDb2RlPVNUQ0QwMQ==

/* BaseURL, End Point */
const $url = 'http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/'

/* 예보 조회 종류 */
const type_forecast = 'ForecastSpaceData';    //동네 예보 조회.

/* API KEY */
const $KEY = '3xdrYGV1u%2Buh2CQpRWI5Yrksa8SSTfgaYeNlNONmLGdZruok%2Frq08aizZkkLak1GYLGBhzwlLJibf6dWAqPd9A%3D%3D';


// DB Info
var config = {
    apiKey: "AIzaSyD4ZkncsADsvtaU7D3H_wT7pKAWvNO-EWg",
    authDomain: "kakao-location.firebaseapp.com",
    databaseURL: "https://kakao-location.firebaseio.com",
    projectId: "kakao-location",
    storageBucket: "kakao-location.appspot.com",
    messagingSenderId: "648358148479",
    appId: "1:648358148479:web:bff412ab8ccb16c2"
};

// Initialize Firebase
firebase.initializeApp(config);

var db = firebase.database();
var ref = db.ref('/');

// using bodyparser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// get방식 요청일시.
app.get('/', function(req, res, next){
console.log(fullURL);
console.log(req.body)
  res.send('Post로 요청하세요');

});

// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/weather/:location', function(req, res){


      // local 용
    var location = req.params.location;
    console.log('파라미터 : ' + req.params.location);

    /* 변수 선언 */
    var nx = '';
    var ny = '';
    var 지역 = '';

    // DB에서 location의 nx, ny 찾기.
    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        if( childData.Location_C == location ){
          nx = childData.Location_NX;
          ny = childData.Location_NY;

          if( childData.Location_A != 'Null' ){
              지역 += childData.Location_A;
          }
          if( childData.Location_B != 'Null' ){
              지역 += childData.Location_B;
          }

          지역 += childData.Location_C;

          console.log( 지역 + " " + nx + " " + ny )
          var fullURL = $url + type_forecast;
          fullURL += "?ServiceKey=" + $KEY;
          fullURL += "&base_date=" + '20190718';
          fullURL += "&base_time=" + '18' +"00";
          fullURL += "&nx=" + nx + "&ny=" + ny;
          fullURL += "&pageNo=1&numOfRows=7";
          fullURL += "&_type=json";

          console.log(fullURL);

        }
      });
  });




});

// port : 9000
app.listen(9000, () => {
    console.log('Example app listening on port 9000!');
});
