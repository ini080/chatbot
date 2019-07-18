const express = require('express');
const app = express();

let request = require('request');
let cheerio = require('cheerio');
let moment = require('moment');

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const firebase = require("firebase");
var bodyParser = require('body-parser')

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

firebase.initializeApp(config);


var db = firebase.database();
var ref = db.ref('/');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());



app.get('/', function(req, res, next){

  res.send('Post로 요청하세요');

});



// API 요청은 무조건 POST 방식으로.
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

// port : 9000
app.listen(9000, () => {
    console.log('Example app listening on port 9000!');
});
