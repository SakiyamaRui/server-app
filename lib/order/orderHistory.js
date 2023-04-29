const {
    getConnection,
    query
} = require('../database');
const statusString = require('./status');

const orderHistory = async (sess_id) => {
    // コネクションの取得
    try {
        var connection = await getConnection();
    }catch (e) {
        return [];
    }

    // データの取得
    let responseData = [];
    try {
        let result = await query(
            "SELECT *, CONVERT_TZ(`reception_time`, '+0:00', '+9:00') as 'order_time' FROM `order_list` WHERE `sess_id` = ? ORDER BY `reception_time` DESC",
            [sess_id],
            connection
        );

        result.results.forEach((elm) => {
            let status = '会計待ち';

            responseData.push({
                order_number: (elm.order_number)? elm.order_number: '---',
                order_time: elm.order_time,
                order_status: statusString(elm.status),
                order_id: elm.order_id,
            })
        });
    }catch (e) {
        console.log(e)
    }

    connection.release();
    return responseData;
}

module.exports = orderHistory