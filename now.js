
const express = require('express');
const app = express();

let request = require('request');
let cheerio = require('cheerio');

// 시간 로그용.
let moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const firebase = require("firebase");
var bodyParser = require('body-parser')

// 사용 API : 광주광역시 BIS 도착정보
//  https://www.data.go.kr/subMain.jsp#/L3B1YnIvcG90L215cC9Jcm9zTXlQYWdlL29wZW5EZXZEZXRhaWxQYWdlJEBeMDgyTTAwMDAxMzBeTTAwMDAxMzUkQF5wdWJsaWNEYXRhRGV0YWlsUGs9dWRkaTpkN2RiNWQ5ZS1hMzE2LTQ1YTctYWFiZC1mM2U4NzA5MGVjOTRfMjAxODAyMTkxNDM1JEBecHJjdXNlUmVxc3RTZXFObz03OTUwMzk3JEBecmVxc3RTdGVwQ29kZT1TVENEMDE=

/* BaseURL */
const $url = 'http://api.gwangju.go.kr/json/arriveInfo';

/* API KEY */
const $KEY = '3xdrYGV1u%2Buh2CQpRWI5Yrksa8SSTfgaYeNlNONmLGdZruok%2Frq08aizZkkLak1GYLGBhzwlLJibf6dWAqPd9A%3D%3D';

// DB Info
var config = {
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

var db = firebase.database();
var ref = db.ref('/');

// using bodyparser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// get방식 요청일시.
//초기 상태 get '시작'' 버튼으로 시작
app.get('/keyboard', function(req, res){
  const menu = {
      "type": 'buttons',
      "buttons": ["시작"]
  };

  res.set({
      'content-type': 'application/json'
  }).send(JSON.stringify(menu));
});

// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/dest/:desti', function(req, res){

    // 카카오톡 오픈빌더는 req.body.action.params 에 파라미터가 담겨있음.

    // local 용
    //var dest = req.params.desti;
    //console.log('파라미터 : ' + req.params.desti);

    // 카톡용
    var dest = req.body.action.params.desti

    // 로그... 서버의 api.log 에 기록이 남음.
    console.log('요청 정류장 : ' +  req.body.action.params.desti)
    console.log(`요청 시간 => ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
    console.log('-------------------------------------------------')

    var haveData = false;   //데이터가 있는지 없는지 확인하는 플래그 변수
    var Answer = '' // 도착정보 데이터를 담을 배열 변수.

    // Firebase DB 에서 탐색.
    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var des_bus_id = '';

        // DB에서 파라미터(목적지) 를 찾아내서 일치하는 BUSSTOP_ID 를 반환함.
        if( childData.BUSSTOP_NAME == dest ){

          des_bus_id = childData.BUSSTOP_ID;
          // BUSSTOP_ID 를 파라미터에 넣어 URL 생성.
          const $api_url = $url + '?serviceKey=' + $KEY + '&BUSSTOP_ID=' +des_bus_id;
          //console.log("최종URL : " + $api_url);

          // API 에 요청. rq_data에 원하는 정보가 담겨있음.
          request($api_url, function(rq_err,rq_res,rq_data){
            $ = cheerio.load(rq_data);

            obj = JSON.parse(rq_data);
            // 요청 URL에 DATA가 있다면 haveData 플래그를 true로 설정.
            if( obj.BUSSTOP_LIST.length > 0 ){
              haveData = true;
            }

            var i = 0;
            for( i = 0; i < obj.BUSSTOP_LIST.length; i++){

              var 방향 = childData.NEXT_STATION +'방향';
              var 버스이름 = obj.BUSSTOP_LIST[i].LINE_NAME;
              var 남은시간 = obj.BUSSTOP_LIST[i].REMAIN_MIN;
              var 남은정류장수 = obj.BUSSTOP_LIST[i].REMAIN_STOP;
              var 곧도착_flag = (obj.BUSSTOP_LIST[i].ARRIVE_FLAG == 0) ? false : true;

              var station_info =
              '버스이름 : ' + 버스이름 + '\n'
              + '방향 : ' + 방향 +' 방향'+'\n'
              + '남은시간 : ' + 남은시간 + '분'+ '\n'
              + '남은 정류장 수 : ' + 남은정류장수 + '개'+'\n';

                if( 곧도착_flag ) {
                  station_info += '버스가 곧 도착해요~' + '\n';
                }
              Answer += station_info + '\n';
          }
          })
        }
      })
    })
      setTimeout(function(){ res.json( {success:haveData?'데이터 있음' : '데이터 없음', message:Answer })   } , 1300);
});



// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/weather', function(req, res){


      // local 용
    var location = req.params.location;
    console.log('로컬 파라미터 : ' + req.params.location);

    // 카톡용
    var 특별시 = req.body.action.params.location;
    var dong = req.body.action.params.dong;
    console.log('카톡 파라미터 : ' + 특별시 + " " + dong);

    /* 변수 선언 */
    var nx = '';
    var ny = '';
    var 지역 = '';
    var Answer = '';
    // DB에서 location의 nx, ny 찾기.
    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();

        if( childData.Location_C == dong ){
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

                  var category = obj.response.body.items.item[i].category;
                  var inputCategory = '';
                  var inputFcstValue = '';
                  var fcstValue = obj.response.body.items.item[i].fcstValue;

                  switch (category){
                    case  "POP":
                        inputCategory = "강수확률";
                        inputFcstValue = fcstValue + "%";
                        break;
                    case "PTY":
                        inputCategory = "강수형태";
                        if(fcstValue == '0' ) inputFcstValue = "❌"; // 없음
                        else if(fcstValue == '1'  ) inputFcstValue = "☔"; //비
                        else if(fcstValue == "2" ) inputFcstValue = "비/눈"; // 비/눈
                        else if(fcstValue == "3" ) inputFcstValue = "\uD83C\uDF28"; //눈
                        else if(fcstValue == "4" ) inputFcstValue = "☔"; // 소나기
                        break;
                    case "RO6":
                        inputCategory = "강수량";
                        inputFcstValue = fcstValue;
                        break;
                    case "REH":
                        inputCategory = "습도";
                        inputFcstValue = fcstValue + "%";
                        break;
                    case "SO6":
                        inputCategory = "적설량";
                        inputFcstValue = fcstValue;
                        break;
                    case "SKY":
                        inputCategory = "하늘상태";
                        if(fcstValue == '1' ) inputFcstValue = "☀"; // 맑음
                        else if(fcstValue == '3' ) inputFcstValue = "⛅"; // 구름많음
                        else if(fcstValue == '4' ) inputFcstValue = "☁"; // 흐림
                        break;
                    case "T3H":
                        inputCategory = "현재기온";
                        inputFcstValue = fcstValue + "도";
                        break;
                    case "TMN":
                        inputCategory = "최저기온";
                        inputFcstValue = fcstValue;
                        break;
                    case "TMX":
                        inputCategory = "오늘최고기온";
                        inputFcstValue = fcstValue + " 도";
                        break;
                    case "UUU": case "VEC": case"VVV": case"WSD":
                        continue;
                }

                console.log(obj.response.body.items.item[i].fcstTime + " "+obj.response.body.items.item[i].fcstDate)
                Answer += '날짜 : ' + obj.response.body.items.item[i].fcstDate + '\n' + '시간 : ' + obj.response.body.items.item[i].fcstTime + '\n';
                Answer += inputCategory + " " + inputFcstValue + '\n';

                console.log(Answer)

              }
            }
          })

        }
      });
  });


        setTimeout(function(){ res.json( {success:true, message:Answer })   } , 3000);

});


//카톡 메시지 처리
app.post('/translate/:text',function (req, res) {



  // SMT 번역
/*
var api_url = 'https://openapi.naver.com/v1/language/translate';
var client_id = 'nPJYjRr1weJ4Hz4Cw5Rr';
var client_secret = 'V9fBY4Xy3f';
*/

// NMT 번역
var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
var client_id = 'TDw9YWzfz7CtyP6jCNvx';
var client_secret = '9JBCbMMHGG';

var trans_text = req.body.action.params.text

  console.log('번역 요청 : ' +  trans_text)

  var options = {
       url: api_url,
       form: {'source':'en', 'target':'ko', 'text':trans_text},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.post(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       var objBody = JSON.parse(response.body);
       //번역된 메시지
       console.log('번역된 메시지 : ' + objBody.message.result.translatedText);
         console.log(`요청 시간 => ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
       console.log('-------------------------------------------------')

       //카톡으로 번역된 메시지를 전송하기 위한 메시지
       let massage = {
           "message": {
               "text": objBody.message.result.translatedText
           },
       };
       //카톡에 메시지 전송
       res.set({
           'content-type': 'application/json'
       }).send(JSON.stringify(massage));


     } else {
       //네이버에서 메시지 에러 발생
       res.status(response.statusCode).end();
       console.log('error = ' + response.statusCode);

       let massage = {
           "message": {
               "text": response.statusCode
           },
       };
       //카톡에 메시지 전송 에러 메시지
       res.set({
           'content-type': 'application/json'
       }).send(JSON.stringify(massage));
     }
   });

});


// port : 9000
app.listen(9000, () => {
    console.log('Example app listening on port 9000!');
});
