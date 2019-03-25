var express = require('express');
var User = require('./models/user');
var md5 = require('blueimp-md5');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('index.html',{
        user: req.session.user
    })
});

router.get('/login', function (req, res) {
    res.render('login.html')
});

router.post('/login', function (req, res) {
    // 1、获取登录用户信息
    // 2、判断用户名和密码是否正确
    // 3、发送响应
    var body = req.body;
    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    },function (err, user) {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: err.message
            })
        }

        if (!user) {
            return res.status(200).json({
                err_code:1,
                message: 'email or password is invalid'
            })
        }

        // 用户存在，登陆成功，Session 记录登录状态
        req.session.user = user;
        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
});
router.get('/register', function (req, res) {
    res.render('register.html')
});

// 方式一：
router.post('/register', function (req, res) {
    // 1、获取表单提交数据: req.body
    // 2、操作数据库:
    //    判断该用户是否存在，如果已存在，不允许注册；如果不存在，注册新用户
    // 3、发送响应
    var body = req.body;
    User.findOne({
        $or: [
            {
                email: body.email
            },
            {
                nickname: body.nickname
            }
        ]
    },function (err,data) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            })
        }
        // console.log(data)
        if (data) {
            // 邮箱或者昵称已存在
            return res.status(200).json({
                err_code: 1,
                message: 'email or nickname already exists'
            });
            return res.send(`邮箱或者密码已存在，请重试`)
        }

        // 对密码进行 md5 重复加密
        body.password = md5(md5(body.password));
        new User(body).save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Internal error'
                })
            }
            //注册成功，使用 Session 记录用户的登陆状态
            req.session.user = user;
            // Express 提供了一个响应方法：json
            // 该方法接受了一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
            res.status(200).json({
                err_code: 0,
                message: 'Ok'
            })
            // 服务端重定向只针对同步请求才有效，异步请求无效
            // res.redirect('/')
        });
    })
});

// 方式二：es6 的 try..catch
// router.post('/register', async function (req, res) {
//     // 1、获取表单提交数据: req.body
//     // 2、操作数据库:
//     //    判断该用户是否存在，如果已存在，不允许注册；如果不存在，注册新用户
//     // 3、发送响应
//     var body = req.body;
//     try {
//         if (await User.findOne({ email: body.email })) {
//             return res.status(200).json({
//                 err_code: 1,
//                 message: '邮箱已存在'
//             })
//         }
//         if (await User.findOne({ nickname: body.nickname })) {
//             return res.status(200).json({
//                 err_code: 2,
//                 message: '昵称已存在'
//             })
//         }
//
//         // 对密码进行 md5 重复加密
//         body.password = md5(md5(body.password));
//
//         // 创建用户，执行注册
//         await new User(body).save();
//
//         // 注册成功，使用 Session 记录用户的登录状态
//         // 默认 session 数据是内存存储的，服务器一旦重启就会丢失，真正的生产环境会把 Session 进行持久化存储
//         // req.session.user = user;
//
//        // Express 提供了一个响应方法：json
//        // 该方法接受了一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
//         res.status(200).json({
//             err_code: 0,
//             message: 'Ok'
//         })
//     }catch (err) {
//         res.status(500).json({
//             err_code: 500,
//             message: err.message
//         })
//     }
// });

router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

module.exports = router;
