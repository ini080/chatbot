const express = require('express');
const app = express();

let request = require('request');
let cheerio = require('cheerio');

const firebase = require("firebase");
var bodyParser = require('body-parser')

let moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

/*
console.log(`연도 => ${moment().year()}`)
console.log(`월 (※ 0〜11의 값) => ${moment().month()}`)
//월 (※ 0〜11의 값) => 0
console.log(`일 => ${moment().date()}`)
//일 => 15
console.log(`요일 => ${moment().day()}`)
//요일 => 1
console.log(`시 => ${moment().hours()}`)
//시 => 10
console.log(`분 => ${moment().minutes()}`)
*/



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

          var year = moment().format('YYYY');
          var month = moment().format('MM');
          var date =  moment().format('DD');
          var hours = moment().format('HH');
          var minutes =  moment().format('mm');

          //fcstTime : 0000, 0300, 0600, 0900, 1200, 1500, 1800, 2100
          var next_time = Number(hours);
          if(next_time < 03) {
            next_time = '0300';
          }else if(next_time < 06){
            next_time = '0600';
          }else if(next_time < 09){
            next_time = '0900';
          }else if(next_time < 12){
            next_time = '1200';
          }else if(next_time < 15){
            next_time = '1500';
          }else if(next_time < 18){
            next_time = '1800';
          }else if(next_time < 21){
            next_time = '2100';
          }else if(next_time < 24){
            next_time = '0000';
          }


          //Base_time  : 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
          var base_time = Number(hours);
          if(base_time < 02) {
            base_time = '2300';
          }else if(base_time < 05){
            base_time = '0200';
          }else if(base_time < 08){
            base_time = '0500';
          }else if(base_time < 11){
            base_time = '0800';
          }else if(base_time < 14){
            base_time = '1100';
          }else if(base_time < 17){
            base_time = '1400';
          }else if(base_time < 20){
            base_time = '1700';
          }else if(base_time < 23){
            base_time = '2000';
          }

          var nextDay = Number(year + month + date)+1;

          fullURL += "?ServiceKey=" + $KEY;
          fullURL += "&base_date=" + year + month + date;
          fullURL += "&base_time=" + base_time ;
          fullURL += "&nx=" + nx + "&ny=" + ny;
          fullURL += "&pageNo=1&numOfRows=308";
          fullURL += "&_type=json";

          console.log(fullURL);

          // API 요청
          request(fullURL, function(rq_err,rq_res,rq_data){
            $ = cheerio.load(rq_data);

            obj = JSON.parse(rq_data);

            var data_length = obj.response.body.totalCount;
            console.log('데이터 길이 : ' + data_length)
            console.log('베이스 타임 : ' + base_time)
            console.log("다음시간 : " + next_time)

            // 현재시간 이후부터 보여줌.
            // 현재시간 이후 24시간만 알려줌
            for( var i = 0; i < data_length; i++){
              if( obj.response.body.items.item[i].fcstTime >= next_time || obj.response.body.items.item[i].fcstDate >= nextDay ){
                  console.log(obj.response.body.items.item[i].fcstTime + " "+obj.response.body.items.item[i].fcstDate)
              }
            }
          })

        }
      });
  });


  res.json({success:true , message: true})

});

// port : 9000
app.listen(9000, () => {
    console.log('Example app listening on port 9000!');
});
