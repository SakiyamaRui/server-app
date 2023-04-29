var express = require('express');
const notifySendFromOrderId = require('../../../lib/notify/fromOrder');
var router = express.Router();

router.use('/test', async (req, res) => {
    // 注文ID
    let order_id = req.query.order_id;

    // 注文IDから通知を送信
    res.send(await notifySendFromOrderId(order_id, `\nこれは、通知のテストです。(${order_id})\nこの通知が表示されている場合は、正常に通知が届きます。`));
    return true;
});

module.exports = router;