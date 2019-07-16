const express = require('express');
const app = express();
let request = require('request');
let cheerio = require('cheerio');
const firebase = require("firebase");
var bodyParser = require('body-parser')
var fs = require('fs');


const $url = 'http://api.gwangju.go.kr/json/arriveInfo';

/* API KEY */
const $KEY = '3xdrYGV1u%2Buh2CQpRWI5Yrksa8SSTfgaYeNlNONmLGdZruok%2Frq08aizZkkLak1GYLGBhzwlLJibf6dWAqPd9A%3D%3D';

/* 조회할 정류소 ID */
const $station = '';

var config = {
  apiKey: "AIzaSyCT7asnhQkhxll_K12MxHEGA9hFSz5EjsU",
  authDomain: "mystation-5d037.firebaseapp.com",
  databaseURL: "https://mystation-5d037.firebaseio.com",
  projectId: "mystation-5d037",
  storageBucket: "mystation-5d037.appspot.com",
  messagingSenderId: "633894674604",
  appId: "1:633894674604:web:bfe6feb2ba4ba7ca"
};

firebase.initializeApp(config);


var db = firebase.database();
var ref = db.ref('/');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



app.get('/', function(req, res, next){

    var dest = req.param('dest');
    console.log('요청 : ' + dest);

    var haveData = false;
    var Answer = new Array();


    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var des_bus_id = '';
        var toJson = {};
        if( childData.BUSSTOP_NAME == dest ){
          des_bus_id = childData.BUSSTOP_ID;
          const $api_url = $url + '?serviceKey=' + $KEY + '&BUSSTOP_ID=' +des_bus_id;

          console.log("최종URL : " + $api_url);


          request($api_url, function(rq_err,rq_res,rq_data){
            $ = cheerio.load(rq_data);

            Answer = JSON.parse(rq_data);
            console.log(Answer)

          })
        }
      })

    })

      setTimeout(function(){ res.json({success:haveData, message:Answer}) } , 1000);
});



// API 요청은 무조건 POST 방식으로.
app.post('/dest/:desti', function(req, res){

    // 카카오톡 오픈빌더는 req.body.action.params 에 파라미터가 담겨있음.


    //console.log('요청 : ' +  req.body.action.params.desti)

     //local 용
    //var dest = req.params.desti;
    //console.log('요청 : ' + req.params.desti);

    // 카톡용
    var dest = req.body.action.params.desti
    console.log('요청 : ' +  req.body.action.params.desti)


    var haveData = false;   //데이터가 있는지 없는지 확인하는 플래그 변수
    var Answer = {
      bus_station:{
        방향 : '',
        버스이름 : '',
        남은시간 : '',
        남은정류장수 : ''
      }

    } // 도착정보 데이터를 담을 배열 변수.



    // Firebase DB 에서 탐색.
    ref.once('value',function(snapshot){
      snapshot.forEach(function(childSnapshot){
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        var des_bus_id = '';


        // DB에서 파라미터(목적지) 를 찾아내서 일치하는 BUSSTOP_ID 를 반환함.
        if( childData.BUSSTOP_NAME == dest ){

          des_bus_id = childData.BUSSTOP_ID;
          const $api_url = $url + '?serviceKey=' + $KEY + '&BUSSTOP_ID=' +des_bus_id; // BUSSTOP_ID 를 파라미터에 넣어 URL 생성.

          console.log("최종URL : " + $api_url);


          // API 에 요청. rq_data에 원하는 정보가 담겨있음.
          request($api_url, function(rq_err,rq_res,rq_data){
            $ = cheerio.load(rq_data);

            obj = JSON.parse(rq_data);
            // 요청 URL에 DATA가 있다면 haveData 플래그를 true로 설정.
            if( obj.BUSSTOP_LIST.length > 0 ){
              haveData = true;
            }
            for( var i = 0; i < obj.BUSSTOP_LIST.length; i++){
              //console.log("버스 번호 : " + des_bus_id )
              //console.log('버스 이름 : ' + obj.BUSSTOP_LIST[i].LINE_NAME);
              //console.log('남은 시간 : ' + obj.BUSSTOP_LIST[i].REMAIN_MIN + '분');
              //console.log('남은 정류장 수 : ' + obj.BUSSTOP_LIST[i].REMAIN_STOP +'개' );
              //console.log("----------------------------------------------------");

              var bus_number = des_bus_id;
              var bus_name = obj.BUSSTOP_LIST[i].LINE_NAME;
              var bus_time = obj.BUSSTOP_LIST[i].REMAIN_MIN;
              var bus_remain_station = obj.BUSSTOP_LIST[i].REMAIN_STOP;

              Answer.bus_station.방향 = childData.NEXT_STATION +'\n';
              Answer.bus_station.버스이름 = bus_name +'\n\r';
              Answer.bus_station.남은시간 = bus_time '+ '\r\n';
              Answer.bus_station.남은정류장수 = bus_remain_station +'\\n';
              console.log(bus_name + " " + bus_time + " "  + bus_remain_station)
          }
          console.log('최종 : ' + Answer)
          })


        }
      })

    })

      setTimeout(function(){ res.json( { message : Answer , typeof : typeof Answer  } )   } , 1300);
});

app.listen(9000, () => {
    console.log('Example app listening on port 9000!');
});