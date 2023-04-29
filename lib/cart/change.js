const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');


const changeCartData = async (changeList) => {
    //
    try {
        var connection = await getConnection();
    }catch (e) {
        console.log(e);
        return false;
    }

    let result = false;
    try {
        if (!await beginTransaction(connection)) throw 'Not Begin Transaction';

        for (let key in changeList) {
            if (changeList[key] == 0) {
                let res = await query(
                    "DELETE FROM `cart_data` WHERE `cart_id` = ?;",
                    [key],
                    connection
                )
            }else{
                let res = await query(
                    "UPDATE `cart_data` SET `quantity` = ? WHERE `cart_id` = ?;",
                    [changeList[key], key],
                    connection
                )
            }
        }

        if (await commit(connection)) {
            result = true;
        }
    }catch (e) {
        console.log(e);
        await rollback(connection);
    }finally {
        connection.release();
        return result;
    }
}

module.exports = changeCartData;