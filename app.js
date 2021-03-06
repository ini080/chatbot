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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// 폴백 응답 형식
app.post('/back', function(req, res) {
  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "carousel": {
          "type": "basicCard",
          "items": [{
              "title": "광주광역시 버스",
              "description": "정류장 이름을 검색해보세요\ud83d\ude00",
              "thumbnail": {
                "imageUrl": 'https://ifh.cc/g/O7esT.jpg'
              },
              "profile": {
                "imageUrl": "http://mblogthumb4.phinf.naver.net/MjAxNzA3MDRfMjA4/MDAxNDk5MTU1NzMyNDQx.cVZXDA__xeHH7-Tx9Sn2DDZN6t9HeIrc1wDc9MUendIg.fcNWvd4dCzjMhkPq86MpSEujGyviVvulb_JzHQfmWZMg.JPEG.yunbanga/photo.jpg?type=w800"
              },
              "buttons": [{
                "action": "message",
                "label": "버스정류장",
                "messageText": "버스"
              }]
            },
            {
              "title": "날씨",
              "description": "지역을 입력하면 날씨를 예측해줍니다\ud83d\ude32",
              "thumbnail": {
                "imageUrl": 'https://ifh.cc/g/a0knH.jpg'
              },
              "profile": {
                "imageUrl": "http://mblogthumb4.phinf.naver.net/MjAxNzA3MDRfMjA4/MDAxNDk5MTU1NzMyNDQx.cVZXDA__xeHH7-Tx9Sn2DDZN6t9HeIrc1wDc9MUendIg.fcNWvd4dCzjMhkPq86MpSEujGyviVvulb_JzHQfmWZMg.JPEG.yunbanga/photo.jpg?type=w800"
              },
              "buttons": [{
                "action": "message",
                "label": "날씨 예보 보기",
                "messageText": "날씨"
              }]
            },
            {
              "title": "번역",
              "description": "언어를 자동으로 감지하고 \n 영어 <--> 한글 번역해드려요\ud83d\ude0d",
              "thumbnail": {
                "imageUrl": "https://ifh.cc/g/tUiY9.jpg"
              },
              "profile": {
                "imageUrl": "http://mblogthumb4.phinf.naver.net/MjAxNzA3MDRfMjA4/MDAxNDk5MTU1NzMyNDQx.cVZXDA__xeHH7-Tx9Sn2DDZN6t9HeIrc1wDc9MUendIg.fcNWvd4dCzjMhkPq86MpSEujGyviVvulb_JzHQfmWZMg.JPEG.yunbanga/photo.jpg?type=w800"
              },
              "buttons": [{
                "action": "message",
                "label": "번역하기",
                "messageText": "번역"
              }]
            },
            {
              "title": "로또",
              "description": "로또번호를 자동으로 추첨해드립니다! \ud83d\ude0d",
              "thumbnail": {
                "imageUrl": "https://image.winudf.com/v2/image/Y29tLm1pbmp1bmNvbXBhbnkubG90dG9faWNvbl8xNTM4NjMyOTQxXzA1Mg/icon.png?w=170&fakeurl=1"
              },
              "profile": {
                "imageUrl": "http://mblogthumb4.phinf.naver.net/MjAxNzA3MDRfMjA4/MDAxNDk5MTU1NzMyNDQx.cVZXDA__xeHH7-Tx9Sn2DDZN6t9HeIrc1wDc9MUendIg.fcNWvd4dCzjMhkPq86MpSEujGyviVvulb_JzHQfmWZMg.JPEG.yunbanga/photo.jpg?type=w800"
              },
              "buttons": [{
                "action": "message",
                "label": "당첨되러가기",
                "messageText": "로또"
              }]
            },
            {
              "title": "개발자정보",
              "description": "챗봇을 개발한 개발자의 정보를 확인할 수 있어요.",
              "thumbnail": {
                "imageUrl": "https://ifh.cc/g/x8FNp.jpg"
              },
              "profile": {
                "imageUrl": "http://mblogthumb4.phinf.naver.net/MjAxNzA3MDRfMjA4/MDAxNDk5MTU1NzMyNDQx.cVZXDA__xeHH7-Tx9Sn2DDZN6t9HeIrc1wDc9MUendIg.fcNWvd4dCzjMhkPq86MpSEujGyviVvulb_JzHQfmWZMg.JPEG.yunbanga/photo.jpg?type=w800"
              },
              "buttons": [{
                  "action": "webLink",
                  "label": "Github",
                  "webLinkUrl": "https://github.com/ini080"
                },
                {
                  "action": "message",
                  "label": "더 궁금해?",
                  "messageText": "더보기"
                },
              ]
            }
          ]
        }
      }],
      "quickReplies": [{
        "messageText": "처음으로",
        "action": "message",
        "label": "처음으로"
      }],
    }
  }
  res.json(message);
});

// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/dest/:desti', function(req, res) {

  // 카카오톡 오픈빌더는 req.body.action.params 에 파라미터가 담겨있음.
  var dest = req.body.action.params.desti

  // 로그... 서버의 api.log 에 기록이 남음.
  console.log('요청 정류장 : ' + req.body.action.params.desti)
  console.log(`요청 시간 => ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
  console.log('-------------------------------------------------')

  var haveData = false; //데이터가 있는지 없는지 확인하는 플래그 변수
  var Answer = '' // 도착정보 데이터를 담을 배열 변수.

  // Firebase DB 에서 탐색.
  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      var des_bus_id = '';

      // DB에서 파라미터(목적지) 를 찾아내서 일치하는 BUSSTOP_ID 를 반환함.
      if (childData.BUSSTOP_NAME == dest) {

        des_bus_id = childData.BUSSTOP_ID;
        // BUSSTOP_ID 를 파라미터에 넣어 URL 생성.
        const $api_url = $url + '?serviceKey=' + $KEY + '&BUSSTOP_ID=' + des_bus_id;
        //console.log("최종URL : " + $api_url);

        // API 에 요청. rq_data에 원하는 정보가 담겨있음.
        request($api_url, function(rq_err, rq_res, rq_data) {
          $ = cheerio.load(rq_data);

          obj = JSON.parse(rq_data);
          // 요청 URL에 DATA가 있다면 haveData 플래그를 true로 설정.
          if (obj.BUSSTOP_LIST.length > 0) {
            haveData = true;
          }

          for (var i = 0; i < obj.BUSSTOP_LIST.length; i++) {

            var 방향 = childData.NEXT_STATION + '방향';
            var 버스이름 = obj.BUSSTOP_LIST[i].LINE_NAME;
            var 남은시간 = obj.BUSSTOP_LIST[i].REMAIN_MIN;
            var 남은정류장수 = obj.BUSSTOP_LIST[i].REMAIN_STOP;
            var 곧도착_flag = (obj.BUSSTOP_LIST[i].ARRIVE_FLAG == 0) ? false : true;

            var station_info =
              '\ud83d\ude0d버스이름 : ' + 버스이름 + '\n' +
              '방향 : ' + 방향 + ' 방향' + '\n' +
              '남은시간 : ' + 남은시간 + '분' + '\n' +
              '남은 정류장 수 : ' + 남은정류장수 + '개' + '\n';

            if (곧도착_flag) {
              station_info += '버스가 곧 도착해요~' + '\n';
            }
            Answer += station_info + '\n';
          }
        })
      }
    })
  })
  setTimeout(function() {
    res.json({
      success: haveData ? '데이터 있음' : '데이터 없음',
      message: Answer
    })
  }, 1300);
});


// 번역
app.post('/translate/:text', function(req, res) {

  var trans_text = req.body.action.params.text
  var detected_text = '';

  // NMT 번역
  var api_url = '';
  var client_id = '';
  var client_secret = '';

  // 언어 감지
  var detect_client_id = '';
  var detect_client_secret = '';
  var query = trans_text;

  var detect_api_url = 'https://openapi.naver.com/v1/papago/detectLangs';
  var detect_request = require('request');
  var options = {
    url: detect_api_url,
    form: {
      'query': query
    },
    headers: {
      'X-Naver-Client-Id': detect_client_id,
      'X-Naver-Client-Secret': detect_client_secret
    }
  };
  detect_request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var resp = JSON.parse(body);
      detected_text = resp.langCode;
    }
  });


  console.log('번역 요청 : ' + trans_text)

  var source = '';
  var target = '';

  function trans_lang() {
    console.log('감지 언어 : ' + detected_text)
    if (detected_text == 'ko') {
      source = 'ko';
      target = 'en';
    } else if (detected_text == 'en') {
      source = 'en';
      target = 'ko';
    }
  }

  setTimeout(function() {
    trans_lang()
  }, 300);

  function trans() {
    var options = {
      url: api_url,
      form: {
        'source': source,
        'target': target,
        'text': trans_text
      },
      headers: {
        'X-Naver-Client-Id': client_id,
        'X-Naver-Client-Secret': client_secret
      }
    };
    request.post(options, function(error, response, body) {
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
  }
  setTimeout(function() {
    trans()
  }, 500);
});


// 카카오 API 요청은 무조건 POST 방식으로.
app.post('/lotto/:count', function(req, res) {

  var count = req.body.action.params.count
  count = count.substring(0,1);
  if (count == 0) {
    count = 5;
  }
  //2차원 배열 선언
  let lotto_number = new Array();
  for (let i = 0; i < count; i++) {
    lotto_number[i] = new Array();
  }

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < 6; j++) {
      lotto_number[i][j] = Math.floor((Math.random() * 45) + 1);

      //중복제거
      for (let k = 0; k < j; k++) {
        if (lotto_number[i][j] == lotto_number[i][k]) {
          j--;
          break;
        }
      }
    }
  }

  var Answer = "";

  for (let i = 0; i < count; i++) {
    Answer += (i + 1) + '회 :  '
    for (let j = 0; j < 6; j++) {
      if(lotto_number[i][j] < 10 ){
        Answer += lotto_number[i][j] + "   "
      }
      else{
        Answer += lotto_number[i][j] + "  "
      }
    }
    Answer += '\n\n'
  }

  console.log('로또')
  console.log(`요청 시간 => ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
  console.log('-------------------------------------------------')
  console.log(Answer)
  setTimeout(function() {
    res.json({
      message: Answer
    })
  }, 1300);
});


// port : 9000
app.listen(9000, () => {
  console.log('Example app listening on port 9000!');
});
