const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');

const { stockCheck } = require('../product/stockCheck');
const { getSessionId } = require('../session/session');

const cartAppend = async (product_list, quantity, {req, res}) => {
    try {
        var connection = await getConnection();
        if (!await beginTransaction(connection)) {
            connection.release();
            throw 'Transaction failed';
        }
    }catch (e) {
        console.log(e);
        return false;
    }

    // すべての商品の在庫を確認
    let result = await stockCheck(product_list, quantity, connection);

    if (result === false) {
        return false;
    }else if (result === true) {
        // カートに追加
        let session_id = getSessionId(req, res);

        let result = false;
        try {
            //
            for (let i = 0; i < product_list.length; i++) {
                await query(
                    "INSERT INTO `cart_data`(`sess_id`, `product_id`, `quantity`) VALUES(?, ?, ?)",
                    [session_id, product_list[i], quantity],
                    connection
                );
            }

            result = commit(connection);
        }catch (e) {
            console.log(e);
            rollback(connection);
        }finally {
            connection.release();
        }

        return result;
    }else{
        // 在庫不足
        return result;
    }
}

module.exports = cartAppend;