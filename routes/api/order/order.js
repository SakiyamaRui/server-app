var express = require('express');
var router = express.Router();

var { loginCheck } = require('../../../lib/session/login_check');
var { registOrder } = require('../../../lib/order/regist');
var orderDetail = require('../../../lib/order/detail');

router.use('/regist', async (req, res) => {
    // セッションIDの取得
    try {
        let isLogin = await loginCheck(req);
        if (!isLogin) {
            res.send({
                result: false,
                msg: 'NotLogined',
            });
            return false;
        }

    
        // セッションIDをもとに商品の登録
        if (!req.cookies.O_SESS_ID) {
            res.send({
                result: false,
                msg: 'NotLogined',
            });
            return false;
        }
    
        let order_id = await registOrder(req.cookies.O_SESS_ID);
        if (order_id !== false && typeof order_id === 'string') {
            res.send({
                result: true,
                order_id: order_id
            });
            return true;
        }else{
            if (typeof order_id === 'object') {
                res.send({
                    result: false,
                    msg: 'StockError',
                    stockList: order_id
                })
            }else{
                res.send({
                    result: false,
                    msg: 'RegistError',
                });
            }
        }
    }catch (e) {
        console.log(e)
        res.send({
            result: false,
            msg: 'NotLogined',
        });
        return false;
    }
});

router.get('/detail', async (req, res) => {
    if (!req.query.order_id) {
        res.sendStatus(400);
        return false;
    }

    let result = await orderDetail(req.query.order_id);

    if (result == false) {
        res.send(false);
    }else{
        res.send(result);
    }

    return true;
})

module.exports = router;