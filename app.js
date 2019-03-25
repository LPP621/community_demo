var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var router = require('./router');           // 路径标识必须要有 ./
var app = express();

app.use('/public/',express.static(path.join(__dirname, './public')));
app.use('/node_modules/',express.static(path.join(__dirname, './node_modules/')));

app.engine('html',require('express-art-template'));
app.set('views',path.join(__dirname,'./views/'));  // 默认就是 ./views 目录，这里是为了方便修改


// 配置解析表单 POST 请求体插件（注意：一定要在 app.use(router) 之前 ）
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// 在 Express 这个框架中，默认不支持 Session 和 Cookie
// 但是我们可以使用第三方中间件：express-session 来解决
/* 1、下载 npm install express-session
 * 2、配置（在 npm 官网搜 express-session）
 *  3、使用   当把这个插件配置好之后，我们就可以通过 req.session 来访问和设置 Session 成员
 *             添加 Session 数据：req.session.foo = 'bar'
 *             访问 Session 数据：req.session.foo
 */
app.use(session({
    // 配置加密字符串，他会在原有的加密基础上和这个字符串拼起来去加密
    // 目的是为了增加安全性，防止客户端恶意伪造
    secret: 'itcast',
    resave: false,
    saveUninitialized: false   // 无论你是否使用 Session，我都默认直接给你分配一把钥匙
}));

// 把路由挂载到 app 中
app.use(router);

app.listen(3000,function () {
    console.log('running...')
});