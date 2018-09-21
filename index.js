#!/usr/bin/env node
 
let program = require('commander');
let https = require('https');
let querystring = require('querystring');
let crypto = require('crypto');

let getSalt = () => {
	return Math.round(Math.random()*100000000000);
}
let app_id = 2108561493;
let app_key = 'yyEN4nrBLRlUYx1S';
let now = (new Date()).getTime();
let time_stamp = (now - now % 1000)/1000; //时间戳
let nonce_str = getSalt(); // 随机字符串
let session = 23;
let cmdValue = undefined;
let option = {};
let str = '';

let getMd5 = (key) => {
	let md5 = crypto.createHash("md5");
	md5.update(key);
	let str = md5.digest('hex');
	let s = str.toUpperCase();  
	return s;
}

let getSign_unmd5 = (q) => {
  option = {
    app_id: app_id,
    time_stamp: time_stamp,
    nonce_str: nonce_str,
    session: session,
    question: encodeURIComponent(q)
  }
  Object.keys(option).sort().forEach(e => {
    str += e + '=' + option[e] + '&';
  });
  str += 'app_key=' + app_key;
  return str;
}


let talk = (q) => {
	let contents = querystring.stringify({
    app_id: app_id,
    time_stamp: time_stamp,
    nonce_str: nonce_str,
    session: session,
    question: q,
	    sign: getMd5(getSign_unmd5(q)),
	});

	let options = {
	    host:'api.ai.qq.com',
	    path:'/fcgi-bin/nlp/nlp_textchat',
	    method:'POST',
	    headers:{
	        'Content-Type':'application/x-www-form-urlencoded',
	        'Content-Length':contents.length
	    }
	}

  let req = https.request(options, function(res){
    res.setEncoding('utf8');
    res.on('data',function(data){
      let datas = JSON.parse(data);
      console.log("Olivia: " + datas.data.answer);
    });
	});

	req.on('error', function (e) { 
		console.log('抱歉，出了点小问题'); 
	});

  req.write(contents);
	req.end();
}
 
program
  .version('1.0.1')
  .arguments('<cmd>')
  .action((cmd, options)=>{
    cmdValue = cmd;
  });

program.parse(process.argv);

if(cmdValue === undefined) {
	console.error('say something...');
	process.exit(1);
} else {
	talk(cmdValue);
}