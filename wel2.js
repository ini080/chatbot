var casper = require('casper').create({
  verbose: true,
    pageSettings: {
        loadImages: true, // 이미지 로딩은 하지 않음
        loadPlugins: false, // 플러그인 로딩은 하지 않음
        userAgent: 'Mozilla/5.0  poi poi poi (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.172 Safari/537.22'
    }
});

//WellStory 열기
casper.start().thenOpen("http://112.106.28.115/menu_today.do", function() {
    console.log("website opened");
});

//WellStory 로그인
casper.then(function(){
    console.log("해당 id와 pw로 로그인 합니다.");
    this.evaluate(function(){
        document.getElementById("name").value="허정건";
        document.getElementById("phone").value="01098370059";
    });
});

// 해당 요소 찾아가서 클릭하기
casper.then(function(){
            var path = '.login_autocheck > span'
            if (casper.exists(path)) {
                casper.mouseEvent('click', path);
            }
            casper.wait(300);

            var path2 = '#wrap > div.intro_wrap > div.int_login > div.login_checkbox.article_checkbox > form > label:nth-child(8) > span'
            if (casper.exists(path2)) {
                casper.mouseEvent('click', path2);
            }
            casper.wait(300);

            var path3 = '#wrap > div.intro_wrap > div.int_login > button > span'
            if (casper.exists(path3)) {
                casper.mouseEvent('click', path3);
            }
            casper.wait(300);
});

//스크린샷 찍고 페이지 저장하기
casper.then(function(){
    console.log("1초 후에 AfterLogin.png 으로 저장됩니다.");
    this.wait(1000, function(){
      this.capture('AfterLogin.png');
    });
});


var images = '';
var par_tit = '';
//이미지 주소 받아오기
casper.then(function(){
  // 총 메뉴 가짓수 구하기
  var getLength = function(){
    return document.querySelector("#lunch").childElementCount;
  }
  var length =  this.evaluate(getLength);
});

casper.then(function(){
  images = this.evaluate(function(){
          var foodImg = document.getElementsByTagName('img');
          var allSrc = [];
          for(var i = 0; i < foodImg.length; i++) {
              if(foodImg[i].height == 90 && foodImg[i].width == 110)
                  allSrc.push(foodImg[i].src);
          }
          return JSON.stringify(allSrc);
      });
      console.log(images);

      par_tit = this.evaluate(function(){
              var tit = document.getElementsByClassName('tit');
              var titSrc = [];
              for(var i = 0; i < tit.length; i++) {
                      titSrc.push(tit[i].innerHTML);
              }
              return JSON.stringify(titSrc);
          });
          console.log(par_tit);
});


console.log(images + " " + par_tit)
casper.run();
