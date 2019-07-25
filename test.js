// 네이버 Papago 언어감지 API 예제
var express = require('express');
var app = express();
var client_id = 'aJZePSWyROoQiA3TszeN';
var client_secret = 'mGFYDn12po';
var query = "언어를 감지할 문장을 입력하세요.";
app.post('/detectLangs', function (req, res) {
   var api_url = 'https://openapi.naver.com/v1/papago/detectLangs';
   var request = require('request');
   var options = {
       url: api_url,
       form: {'query': query},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.post(options, function (error, response, body) {
     if (!error && response.statusCode == 200) {
       var resp = JSON.parse(body);
       console.log(resp.langCode)
       res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
       res.end(body);
     } else {
       res.status(response.statusCode).end();
       console.log('error = ' + response.statusCode);
     }
   });
 });
 app.listen(3000, function () {
   console.log('http://127.0.0.1:3000/detectLangs app listening on port 3000!');
 });
