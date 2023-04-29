var express = require('express');
var router = express.Router();

var cartAppend = require('../../../lib/cart/append');
var { getCartData } = require('../../../lib/cart/get');
var changeCartData = require('../../../lib/cart/change');
var { loginCheck } = require('../../../lib/session/login_check');

router.post('/append', async (req, res) => {
    //
    if (!req.body.orderList || !req.body.quantity) {
        res.sendStatus(403);
        return false;
    }

    //
    let result = await cartAppend(req.body.orderList, req.body.quantity, {req, res});

    res.send(result);
});

router.get('/get', async (req, res) => {
    // cookieからセッションを取得
    if (!await loginCheck(req)) {
        res.send([]);
        return false;
    }
    
    if (!req.cookies.O_SESS_ID) {
        res.send([]);
        return false;
    }

    //
    let responseData = await getCartData(req.cookies.O_SESS_ID);

    res.send(responseData);
    return true;
});

router.post('/change', async (req, res, next) => {
    try {
        //
        let result = await changeCartData(req.body.changeList);
        res.send(result);
    }catch (e) {
        console.log(e);
        res.send(false);
    }finally {
        return true;
    }
});

module.exports = router;