var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
const superagent = require('superagent');

const url = "http://kg.qq.com/node/personal?uid=669e9e81222d378a36";
let pre_url="http://node.kg.qq.com/cgi/fcgi-bin/kg_ugc_get_homepage?jsonpCallback=callback_4&g_tk=5381&outCharset=utf-8&format=jsonp&type=get_ugc&start=";

let next_url="&num=8&touin=&share_uid=669e9e81222d378a36&g_tk_openkey=2075265489&_=1518655849388";


//34页  267首 pageNum=8
const cookie='pgv_pvid=4903963028; pgv_info=ssid=s4903963028; muid=669e9e81222d378a36; openid=oc2eXjg13cMcIq6SKvPPZi99SJaQ; opentype=1; uid=433470012; qrsig=B5440E04945C0F7622A9E8805EEEEBC2; openkey=JxEAC1qE2DsAD0LwAAAAIF5CMRademEaVcFzw4zgh8AfFe6awDtnjlglmqRCgCKv';
var shareidList=new Array();
let m=1;
for(let i=1;i<35;i++){
    try{
        let musicUrl=pre_url+i+next_url;

    http.get(musicUrl, function (res) {     
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];        
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {   
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            // console.log(html);
            html=html.substring(11,html.length-1);
            // console.log(html);
            // var $ = cheerio.load(html); //采用cheerio模块解析html
            let musicJson=JSON.parse(html);
            let musicList=musicJson.data.ugclist;
            // console.log(musicList);
            for(let j=0;j<musicList.length;j++){
                let shareId=musicList[j].shareid;
                // console.log(shareId);
                shareidList.push(shareId);
            }
            for(let n=0;n<shareidList.length;n++){
                getShareMusic(shareidList[n]);
            }

        });
    });
    }catch(e){
            
    }
    

}
function getShareMusic(shareid){
    let music="http://node.kg.qq.com/play?s="+shareid+"&g_f=personal";
    // console.log(music);
    superagent.get(music)
    .end(function(err,res){
        //  console.log(res.text);
        let $ = cheerio.load(res.text);
        $('script[type="text/javascript"]').each(function (i) {
            if(i==2){
                var script = $(this).html();
                // console.log(script.substring(18,script.length-2));
                let musicBean=JSON.parse(script.substring(18,script.length-2));
                let playurl=musicBean.detail.playurl;
                let filename=musicBean.detail.song_name+musicBean.detail.score+'.m4a';
                downloadFile(playurl,filename,function(){
                    console.log('下载完毕');
                });
            }
          });
        // console.log(src.html());
    });
}

function downloadFile(uri,filename,callback){
    try{
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
    }catch(e){

    }
}