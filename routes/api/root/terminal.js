var express = require('express');
var router = express.Router();

var notifySendFromOrderId = require('../../../lib/notify/fromOrder');

router.use('/userCall', (req, res) => {
    let store = req.query.store;
    let order_number = req.query.order_number;
    let order_id = req.query.order_id;

    // セッションIDの取得
    let result = notifySendFromOrderId(order_id, `\n注文番号: ${order_number}\n${store} で\n注文の商品が完成しました。\n受け取りに、キッチンカーまでお越しください。`);

    if (result) {
        res.send('<h1>呼び出し通知を送信しました</h1>');
    }else{
        res.send('<h1>呼び出しに失敗しました。</h1>');
    }
})

module.exports = router;