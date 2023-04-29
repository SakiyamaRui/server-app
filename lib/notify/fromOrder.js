const {
    getConnection,
    query,
} = require('../database');

const lineNotify = require('./line');

const notifySendFromOrderId = async (order_id, body) => {
    // コネクションの取得
    try {
        var connection = await getConnection();
    }catch (e) {
        return false;
    }

    try {
        // セッションIDの取得
        let sess_id = await query(
            "SELECT * FROM `order_list` WHERE `order_id` = ?",
            [order_id],
            connection
        );

        connection.release();

        if (sess_id.results.length > 0) {
            // 
            let result = lineNotify(sess_id.results[0].sess_id, body);

            return result;
        }
    }catch (e) {
        console.log(e);
    }

    return false;
}

module.exports = notifySendFromOrderId;