const {
    getConnection,
    getSessionConnection,
    query
} = require('../database');

const statusString = require('./status');
const { cartDataFormat } = require('../cart/get.js');


const orderDetail = async (order_id, isNumber = false) => {
    // 
    try {
        var connection = await getConnection();
    }catch (e) {
        console.log(e);
        return false;
    }

    try {
        var sessionConnection = await getSessionConnection();
    }catch (e) {
        //
        console.log(e);
        connection.release();
        return false;
    }

    // 
    let orderData = {};
    let resResult = false;
    try {
        // 注文情報の取得
        let result = await query(
            "SELECT *, CONVERT_TZ(`reception_time`, '+0:00', '+9:00') as 'order_time' FROM `order_list` WHERE `" + `${(isNumber)? 'order_number' : 'order_id'}` + "` = ?",
            [order_id],
            connection
        );

        // 注文情報のセット
        if (result.results.length === 0) {
            throw 'Order Not Found';
        }

        let origin = result.results[0];
        orderData = {
            order_id: origin.order_id,
            order_time: origin.order_time,
            order_number: (origin.order_number)? origin.order_number: '---',
            status: statusString(origin.status),
            status_code: origin.status
        }

        // 通知設定
        let option = await query(
            "SELECT * FROM `line_notify` WHERE `sess_id` = ?",
            [origin.sess_id],
            sessionConnection
        );

        if (option.results.length > 0) {
            orderData['isNotify'] = true;
        }else{
            orderData['isNotify'] = false;
        }

        // 注文アイテム
        let orderItems = [];
        let items = await query(
            "SELECT\
                `id`,\
                `order_id`,\
                `order_products`.`product_id`,\
                `quantity`,\
                `unit_price`,\
                `received`,\
                `product`.`product_name`,\
                `product`.`is_option`,\
                `product`.`reception`,\
                `product_info`.`price`,\
                `stock`\
            FROM\
                `order_products`\
            INNER JOIN `product` ON `order_products`.`product_id` = `product`.`product_id`\
            INNER JOIN `product_info` ON `order_products`.`product_id` = `product_info`.`product_id`\
            INNER JOIN `stock` ON `order_products`.`product_id` = `stock`.`product_id`\
            WHERE\
                `order_products`.`order_id` = ?\
                AND\
                `product`.`is_public` = 1",
            [orderData.order_id],
            connection
        );

        // フォーマット化
        let formated = await cartDataFormat(items.results, connection, true);
        orderItems = Object.values(formated);
        orderData['order_item'] = orderItems;

        // 呼び出し状況

        resResult = true;
    }catch (e) {
        console.log(e);
    }finally{
        sessionConnection.release();
        connection.release();
    }

    return (resResult)? orderData: false;
}

module.exports = orderDetail;