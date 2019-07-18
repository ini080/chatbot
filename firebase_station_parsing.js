let request = require('request');
let cheerio = require('cheerio');
const firebase = require("firebase");


// 사용 API : 광주광역시 BIS 정류소 정보
// https://www.data.go.kr/subMain.jsp#/L3B1YnIvcG90L215cC9Jcm9zTXlQYWdlL29wZW5EZXZEZXRhaWxQYWdlJEBeMDgyTTAwMDAxMzBeTTAwMDAxMzUkQF5wdWJsaWNEYXRhRGV0YWlsUGs9dWRkaTozOTAwMzU0MS1iODNlLTQxZDEtOTVlMy1kYmI5MTk4NzM5ODBfMjAxODAyMTkxNDMyJEBecHJjdXNlUmVxc3RTZXFObz03OTk1MDk2JEBecmVxc3RTdGVwQ29kZT1TVENEMDE=

/* base URL */
const $url = 'http://api.gwangju.go.kr/json/stationInfo';
/* API KEY */
const $KEY = '3xdrYGV1u%2Buh2CQpRWI5Yrksa8SSTfgaYeNlNONmLGdZruok%2Frq08aizZkkLak1GYLGBhzwlLJibf6dWAqPd9A%3D%3D';
/* 조합 URL */
const $api_url = $url + '?serviceKey=' + $KEY

// Firebase Info
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
  //url로 요청을 보내고 cheerio를 통해서 응답을 받음.
  $ = cheerio.load(body);
  obj = JSON.parse(body);

  // body로 받은 데이터의 정보가 총 3605개 이기 떄문에
  // Firebase DB에 저장하기.
  for( var i = 1; i <= 3604; i++){
    firebase.database().ref('staion'+i).set({
      STATION_ID : i,
      BUSSTOP_ID : obj.STATION_LIST[i].BUSSTOP_ID,
      BUSSTOP_NAME : obj.STATION_LIST[i].BUSSTOP_NAME
      NEXT_STATION : obj.STATION_LIST[i].NEXT_BUSSTOP
    });
  }
});
