const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');

// 入れ子データの生成
const formatNestData = (parent_id, data) => {
    //
    let returnArray = data.filter(el => el.parent_id == parent_id).map((elm) => {
        return {
            product_id: elm.product_id,
            stock_num: -1,
            reception: elm.reception,
            product_name: elm.product_name,
            price: elm.price,
            option: formatNestData(elm.product_id, data)
        };
    });

    return returnArray;
}


// 商品情報の詳細
const getProductDetial = async (product_id) => {
    // コネクションの取得
    try {
        var connection = await getConnection();
        if (!connection) throw 'DB Connection Error';
    }catch (e) {
        console.log(e);
        throw e;
    }

    // 商品テーブルと在庫テーブルを結合してデータを取得
    try {
        var productList = await query(
            'SELECT\
                `TB_product`.`product_id`,\
                `TB_product`.`parent_id`,\
                `TB_product`.`reception`,\
                `TB_product_info`.`product_name`,\
                `TB_product_info`.`price`,\
                `TB_product_stock`.`stock_num`\
            FROM \
                `TB_product`\
            INNER JOIN\
                `TB_product_info`\
            ON\
                `TB_product`.`product_id` = `TB_product_info`.`product_id`\
            INNER JOIN\
                `TB_product_stock`\
            ON\
                `TB_product`.`product_id` = `TB_product_stock`.`product_id`\
            WHERE\
            `TB_product`.`product_id` = ?\
            OR\
            `TB_product`.`product_id` IN(\
                SELECT\
                    `children_id`\
                FROM\
                `TB_product_relation`\
                WHERE\
                `product_id` = ?\
            );',
            [product_id, product_id],
            connection
        );

        if (productList.results.length == 0) {
            throw 'ID Error';
        }

        let nestedData = formatNestData(null, productList.results);

        // bodyデータの読み込み
        let placeholder = '?, '.repeat(productList.results.length).slice(0, -2);
        var productBodyData = await query(
            `SELECT \`product_id\`, \`body\` FROM \`TB_product_info\` WHERE \`product_id\` IN(${placeholder})`,
            productList.results.map(elm => elm.product_id),
            connection
        );

        let bodyData = {};

        productBodyData.results.forEach(elm => {
            bodyData[elm.product_id] = elm.body
        });

        // ショップデータの取得
        let shop_data = await query(
            'SELECT * FROM `TB_product` INNER JOIN `TB_store` ON `TB_product`.`shop_id` = `TB_store`.`shop_id` WHERE `TB_product`.`product_id` = ?;',
            [product_id],
            connection
        );
        if (shop_data.results.length == 0) {
            throw 'Store Data Error';
        }
        let shop = shop_data.results[0];

        connection.release();

        return {
            deteil: nestedData[0],
            body: bodyData,
            shop_id: shop.shop_id,
            shop_name: shop.shop_name,
            waiting_time: shop.waiting_time
        };

    }catch (e) {
        //
        connection.release();
        throw e;
    }
}


// 商品情報のトップデータ
const getProductIndexData = (product_id_list) => {}


module.exports = {
    getProductDetial,
}
