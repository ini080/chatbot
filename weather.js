const express = require('express');
const app = express();

let request = require('request');
let cheerio = require('cheerio');

const firebase = require("firebase");
var bodyParser = require('body-parser')

let moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

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

// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/weather', function(req, res){

    // 카톡용
    var city = req.body.action.params.city;
    var dong = req.body.action.params.dong;
    console.log('요청 지역 : ' + city + " " + dong);

    /* 변수 선언 */
    var nx = '';
    var ny = '';
    var request_Location = '';
    var Answer = '';
    // DB에서 location의 nx, ny 찾기.
    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        // Location_A : 광역시
        // Location_B : 시/군/구
        // Location_C : 동/읍/면

        if( childData.Location_A == city && childData.Location_C == dong){

          request_Location += childData.Location_A;
          if( childData.Location_B != 'Null' ){
              request_Location += childData.Location_B;
          }

          request_Location += childData.Location_C;
          nx = childData.Location_NX;
          ny = childData.Location_NY;


          console.log('검색된 지역 : ' +  request_Location + " " + nx + " " + ny )
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
          var base_min = Number(minutes);


          if(base_time < 02) {
            if( minutes < 11 ){
              base_time = '0200';
            }
            else {
              base_time = '2300';
            }
          }else if(base_time < 05){
            if( minutes < 11 ){
              base_time = '2300';
            }
            else {
              base_time = '0200';
            }
          }else if(base_time < 08){
            if( minutes < 11 ){
              base_time = '0200';
            }
            else {
              base_time = '0500';
            }
          }else if(base_time < 11){
            if( minutes < 11 ){
              base_time = '0500';
            }
            else {
              base_time = '0800';
            }
          }else if(base_time < 14){
            if( minutes < 11 ){
              base_time = '0800';
            }
            else {
              base_time = '1100';
            }
          }else if(base_time < 17){
            if( minutes < 11 ){
              base_time = '1100';
            }
            else {
              base_time = '1400';
            }
          }else if(base_time < 20){
            if( minutes < 11 ){
              base_time = '1100';
            }
            else {
              base_time = '1700';
            }
          }else if(base_time <= 23){
            if( minutes < 11 ){
              base_time = '1700';
            }
            else {
              base_time = '2000';
            }
          }

          console.log('Base Time : ' + base_time + " " + 'Next Time : ' + next_time)
          console.log(`요청 시간 => ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
          console.log('-------------------------------------------------')

          var nextDay = Number(year + month + date)+1;

          fullURL += "?ServiceKey=" + $KEY;
          fullURL += "&base_date=" + year + month + date;
          fullURL += "&base_time=" + base_time ;
          fullURL += "&nx=" + nx + "&ny=" + ny;
          fullURL += "&pageNo=1&numOfRows=308";
          fullURL += "&_type=json";

          // API 요청
          request(fullURL, function(rq_err,rq_res,rq_data){
            $ = cheerio.load(rq_data);

            obj = JSON.parse(rq_data);

            var data_length = obj.response.body.totalCount;


            // 현재시간 이후부터 보여줌.
            // 현재시간 이후 24시간만 알려줌
            var before_fcstDate = '';
            var before_fcstTime = '';

            for( var i = 0; i < 82; i++){

              if( obj.response.body.items.item[i].fcstTime >= next_time || obj.response.body.items.item[i].fcstDate >= nextDay ){

                  var category = obj.response.body.items.item[i].category;
                  var inputCategory = '';
                  var inputFcstValue = '';
                  var fcstValue = obj.response.body.items.item[i].fcstValue;

                  switch (category){
                    case "TMN":  //06시
                        inputCategory = "\uD83C\uDF21최저기온";
                        inputFcstValue = fcstValue + "℃" + "\n";
                        break;
                    case "TMX": // 15시
                        inputCategory = "\uD83C\uDF21최고기온";
                        inputFcstValue = fcstValue + "℃" + '\n';
                        break;

                    case "PTY":
                        inputCategory = "\uD83D\uDE03눈/비소식";
                        if(fcstValue == '1'  ) inputFcstValue = "비️"; //비
                        else if(fcstValue == "2" ) inputFcstValue = "진눈개비"; // 비/눈
                        else if(fcstValue == "3" ) inputFcstValue = "눈"; //눈
                        else if(fcstValue == "4" ) inputFcstValue = "소나기"; // 소나기
                        break;

                    case "T3H":
                        inputCategory = "\uD83C\uDF21기온";
                        inputFcstValue = fcstValue + "℃";

                        var forecase_time = obj.response.body.items.item[i].fcstTime.toString().substr(0,2);
                        if( forecase_time == '06' || forecase_time =='15'){

                        }
                        else {
                          inputFcstValue += '\n';
                        }
                        break;

                    case "SKY":
                        inputCategory = "☁하늘";
                        if(fcstValue == '1' ) inputFcstValue = "맑음"; // 맑음
                        else if(fcstValue == '3' ) inputFcstValue = "구름많음"; // 구름많음
                        else if(fcstValue == '4' ) inputFcstValue = "흐림"; // 흐림
                        break;

                    case  "POP":
                        inputCategory = "\u26F1강수확률";
                        inputFcstValue = fcstValue + "%";
                        break;

                    case "R06":
                        inputCategory = "☔강수량";
                        if(fcstValue < 0.1  ) inputFcstValue = '';
                        else if(fcstValue < 1.0 ) inputFcstValue = '1mm 미만';
                        else if(fcstValue < 4.0 ) inputFcstValue = '1~4mm';
                        else if(fcstValue < 9.0 ) inputFcstValue = "5~9mm";
                        else if(fcstValue < 19.0 ) inputFcstValue = "10~19mm";
                        else if(fcstValue < 39.0 ) inputFcstValue = "20~39mm";
                        else if(fcstValue < 69.0 ) inputFcstValue = "40~69mm";
                        else if(fcstValue >= 70.0 ) inputFcstValue = "70mm 이상";
                        break;

                    case "REH":
                        inputCategory = "\uD83D\uDCA7습도";
                        inputFcstValue = fcstValue + "%";
                        break;

                    case "S06":
                        inputCategory = "적설량";
                        if(fcstValue < 0.1  ) inputFcstValue = '';
                        else if(fcstValue < 1.0 ) inputFcstValue = '1cm 미만';
                        else if(fcstValue < 4.0 ) inputFcstValue = '1~4cm';
                        else if(fcstValue < 9.0 ) inputFcstValue = "5~9cm";
                        else if(fcstValue < 19.0 ) inputFcstValue = "10~19cm";
                        else if(fcstValue >= 20.0 ) inputFcstValue = "20cm 이상";
                        break;
                }




                let fcstDate = obj.response.body.items.item[i].fcstDate;
                let fcstTime = obj.response.body.items.item[i].fcstTime;
                if( before_fcstDate == fcstDate && before_fcstTime == fcstTime){

                  if( inputCategory != '' && inputFcstValue != ''){
                    Answer += inputCategory + " : " + inputFcstValue + '\n';
                  }

                }else{
                  before_fcstDate = obj.response.body.items.item[i].fcstDate;
                  before_fcstTime = obj.response.body.items.item[i].fcstTime;

                  var text_month = obj.response.body.items.item[i].fcstDate.toString();
                  var text_time = obj.response.body.items.item[i].fcstTime.toString();

                  var answer_month = text_month.substr(4,2)
                  var answer_day = text_month.substr(6,2)
                  var answer_time = text_time.substr(0,2)

                  Answer += answer_month +'월' + " " + answer_day + "일" + " "+ answer_time + "시 예보" + '\n' + '\n';
                }
              }
            }
          })

        }
      });
  });


        setTimeout(function(){ res.json( {success:true, message:Answer })   } , 2000);

});


// port : 8000
app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
