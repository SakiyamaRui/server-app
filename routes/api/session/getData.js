var express = require('express');
var router = express.Router();
const { loginCheck } = require('../../../lib/session/login_check');
const orderHistory = require('../../../lib/order/orderHistory');


router.use('/getStatus', async (req, res) => {
    let isLogin = await loginCheck(req);

    // 注文情報
    let orderList = [];
    if (isLogin) {
        // 注文履歴の取得
        orderList = await orderHistory(req.cookies.O_SESS_ID);
    }

    res.send({
        isLogin: isLogin,
        orderList: orderList,
    });
});

module.exports = router;
