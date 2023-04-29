const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');

const { customAlphabet } = require('nanoid');
const generateIdHandler = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 5);
const { stockCheckAll } = require('../product/stockCheck');

const registOrder = async (session_id) => {
    // カート情報を登録する

    // IDの生成
    let newOrderId = generateIdHandler();

    // コネクション・トランザクションの開始
    try {
        var connection = await getConnection();

        if (!await beginTransaction(connection)) {
            connection.release();
            throw 'Transaction Error';
        }
    }catch(e) {
        return false;
    }

    // 登録の開始
    let result = false;
    try {
        //在庫の管理
        let product_list = await query(
            'SELECT * FROM `cart_data` WHERE `sess_id` = ?;',
            [session_id],
            connection
        );
        let stockResult = await stockCheckAll(product_list.results, connection);
        if (stockResult === false) {
            throw 'not stock result';
        }
        if (stockResult.length != 0) {
            result = stockResult;
            throw 'Stock not have';
        }


        // 注文情報のインデックス登録
        let indexRegistResponse = await query(
            "INSERT INTO `order_list`(\
                `order_id`,\
                `sess_id`,\
                `status`\
            )\
            VALUES(\
                ?,\
                ?,\
                0\
            )",
            [newOrderId, session_id],
            connection
        );

        // カートの中身を登録
        let productRegistResponse = await query(
            "INSERT INTO `order_products`(\
                `id`,\
                `order_id`,\
                `product_id`,\
                `quantity`,\
                `unit_price`,\
                `received`\
            )\
            SELECT\
                NULL,\
                ?,\
                `product_info`.`product_id`,\
                SUM(`quantity`),\
                `product_info`.`price`,\
                0\
            FROM\
                `cart_data`\
            INNER JOIN `product_info` ON `cart_data`.`product_id` = `product_info`.`product_id`\
            WHERE\
                `cart_data`.`sess_id` = ?\
            GROUP BY\
                `product_id`",
            [newOrderId, session_id],
            connection
        );

        // カートを削除
        let deleteCartResponse = await query(
            'DELETE FROM `cart_data` WHERE `sess_id` = ?',
            [session_id],
            connection
        )

        if (await commit(connection)) {
            result = true;
        }
    }catch(e) {
        //
        console.log(e);
        rollback(connection);
    }finally {
        connection.release();
    }

    return (result === true)? newOrderId: result;
}

module.exports = {
    registOrder
}