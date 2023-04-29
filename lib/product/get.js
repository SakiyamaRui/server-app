const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');

const columnFormat = (record) => {
    return {
        "product_id": record.product_id,
        "product_name": record.product_name,
        "reception": (record.reception == 1)? true: false,
        "price": record.price,
        "stock": record.stock,
        "body": record.body,
        "images": [],
    };
}

const optionFormat = (data, parent_id, type) => {
    //
    let returnList = [];

    data.forEach(elm => {
        if (elm.parent_id == parent_id) {
            if (type != "public") {
                if (elm.is_public == 0) {
                    return;
                }
            }

            returnList.push({
                ...columnFormat(elm),
                option: optionFormat(data, elm.product_id, type),
            });
            return;
        }
    });

    return returnList;
}

const productFormatData = (data, type) => {
    let main = data.find(col => col.is_option == 0);

    let formated = {
        ...columnFormat(main),
        "option": optionFormat(data, main.product_id, type),
    };

    return formated;
}

const getProductData = async (product_id, type = 'public') => {
    try {
        // コネクションの取得
        var connection = await getConnection();

        if (!connection) {
            throw 'Connection Error';
        }
    }catch (e) {
        console.log(e);
        return false;
    }

    //
    try {
        //
        let response = await query(
            "SELECT\
                `product`.`product_id`,\
                `product`.`product_name`,\
                `product`.`is_option`,\
                `product`.`is_public`,\
                `product`.`reception`,\
                `product_info`.`price`,\
                `product_info`.`body`,\
                `stock`.`stock`,\
                `product_parent`.`parent_id`\
            FROM\
                `product`\
            INNER JOIN `product_info` ON `product`.`product_id` = `product_info`.`product_id`\
            INNER JOIN `stock` ON `product`.`product_id` = `stock`.`product_id`\
            LEFT OUTER JOIN `product_parent` ON `product`.`product_id` = `product_parent`.`product_id`\
            WHERE\
                `product`.`product_id` = ? OR `product`.`product_id` IN(\
                SELECT\
                    `product_id`\
                FROM\
                    `product_parent`\
                WHERE\
                    `master_id` = ?\
            )",
            [product_id, product_id],
            connection
        );


        if (response.results.length == 0) {
            connection.release();
            return false;
        }

        // データのフォーマット化
        let formated = productFormatData(response.results, type);

        // 画像の取得
        let imageList = await query(
            'SELECT * FROM `product_image` WHERE `product_id` = ?',
            [product_id],
            connection
        );

        formated.images = imageList.results.map((elm) => 'https://order.apori.jp' + elm.path);

        connection.release();
        return formated;
    }catch (err) {
        //
        console.log(err);
        connection.release();
        return false;
    }
}

const getProductList = async () => {
    // コネクションの取得
    try {
        var connection = await getConnection();

        if (!connection) {
            throw 'Connection Error';
        }
    }catch(e) {
        console.log(e)
        return false;
    }

    // 商品一覧の検索
    try {
        let dbRes = await query(
            "SELECT `product`.`product_id`, `product_name`, `stores`.`store_name`, `reception`, `product_info`.`price`,`path` FROM `product`\
            INNER JOIN `stores` ON `product`.`store_id` = `stores`.`store_id`\
            INNER JOIN `product_info` ON `product`.`product_id` = `product_info`.`product_id`\
            INNER JOIN (SELECT * FROM `product_image` GROUP BY `product_id`) as `image_list` ON `product`.`product_id` = `image_list`.`product_id`\
            WHERE `is_public` = 1 AND `is_option` = 0 ORDER BY `product_info`.`price` ASC",
            [],
            connection
        );

        var productResponse = dbRes.results.map((elm) => {
            return {
                product_name: elm.product_name,
                shop_name: elm.store_name,
                price: elm.price,
                image: elm.path,
                product_id: elm.product_id,
                reception: (elm.reception == 1)? true: false
            };
        });
    }catch (e) {
        console.log(e);
    }finally{
        connection.release();
    }

    return productResponse;
}

module.exports = {
    getProductData,
    getProductList
};