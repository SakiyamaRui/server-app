var express = require('express');
var router = express.Router();

var orderDetail = require('../../../lib/order/detail');

var {
    getConnection, beginTransaction, rollback, commit, query,
} = require('../../../lib/database');
const orderDataSubmit = require('../../../lib/notify/orderDataSend');


router.use('/getOrder', async (req, res) => {
    //
    let order_detail = await orderDetail(req.query.order_id, true);

    res.send(order_detail);
    return true;
});

router.post('/regist', async (req, res) => {
    //
    try {
        var connection = await getConnection();

        if (!await beginTransaction(connection)) {
            connection.release();
        }
    }catch (e) {
        res.send(false);
        return false;
    }

    try {
        // 在庫数をすべて減らす
        for (let product in req.body.list) {
            // 注文数の変更
            let isUpdeted = await query(
                'UPDATE `order_products` SET `quantity` = ? WHERE `id` = ?;',
                [Number(req.body.list[product].quantity), req.body.list[product].id],
                connection
            );
            
            if (req.body.list[product].stock == -1) {
                continue;
            }
            // 注文数とどちらが多いか取得
            let result = await query(
                "SELECT * FROM `stock` WHERE `product_id` = ?;",
                [req.body.list[product].product_id],
                connection
            );

            if (req.body.list[product].quantity == 0) {
                continue;
            }

            if (result.results.length == 0) {
                throw 'NotProductStockData';
            }

            if (result.results[0].stock < req.body.list[product].quantity) {
                throw '在庫不足';
            }

            await query(
                "UPDATE `stock` SET `stock` = `stock` - ? WHERE `product_id` = ?",
                [req.body.list[product].quantity, req.body.list[product].product_id],
                connection
            );
        }

        // 会計のステータスを1に
        let result = await query(
            "UPDATE `order_list` SET `status` = 1 WHERE `order_id` = ?",
            [req.body.order_id],
            connection
        );

        // 通知の送信
        let submitResult = await orderDataSubmit(req.body.order_id, req.body.order_number, connection);

        if (submitResult) {
            if (await commit(connection)) {
                connection.release();
                res.send(true);
                return true;
            }
        }

        connection.release();
        res.send(false);
        return false;
    }catch (e) {
        await rollback(connection);

        connection.release();
        console.log(e);
        res.send(false);
        return false;
    }
});

module.exports = router;