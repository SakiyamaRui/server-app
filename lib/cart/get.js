const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');
const changeCartData = require('./change');

const cartDataFormat = async (cartData, connection, isOrder = false) => {
    let product_list = {};
    let options = [];

    cartData.forEach((elm) => {
        if (!product_list.hasOwnProperty(elm.product_id)) {
            product_list[elm.product_id] = {
                product_id: elm.product_id,
                product_name: elm.product_name,
                is_option: (elm.is_option == 0)? false: true,
                reception: (elm.reception == 1)? true: false,
                price: elm.price,
                items: [],
                options: [],
            };

            if (isOrder) {
                product_list[elm.product_id]['id'] = elm.id;
                product_list[elm.product_id]['stock'] = elm.stock;
            }
        }

        if (elm.is_option != 0) {
            options.push(elm.product_id);
        }

        product_list[elm.product_id].items.push({
            cart_id: elm.cart_id,
            quantity: elm.quantity,
        });
    });

    // オプション情報の取得
    let optionsIdList = options.filter((val, i) => i === options.indexOf(val));

    if (optionsIdList.length == 0) {
        return product_list;
    }

    let placeHolderString = "?,".repeat(optionsIdList.length).slice(0, -1);
    let result = await query(
        "SELECT\
            `product_parent`.`product_id`,\
            `parent_id`,\
            `master_id`,\
            `product`.`product_name`\
        FROM\
            `product_parent`\
        INNER JOIN `product` ON `product_parent`.`parent_id` = `product`.`product_id`\
        WHERE\
            `product_parent`.`product_id` IN(" + placeHolderString + ")",
            optionsIdList,
        connection
    );

    //
    result.results.forEach(async (elm) => {
        // ラベル名をセット
        if (!product_list.hasOwnProperty(elm.product_id)) {
            // 要素を削除
            let obj = {};
            obj[elm.product_id] = 0;
            await changeCartData(obj);
            return false;
        }
        product_list[elm.product_id]['label'] = elm.product_name;

        // 親要素にセット
        if (!product_list.hasOwnProperty(elm.master_id)) {
            let obj = {};
            obj[elm.product_id] = 0;
            await changeCartData(obj);
            return false;
        }
        if (!product_list[elm.master_id].hasOwnProperty('options')) {
            product_list[elm.master_id]['options'] = [];
        }
        product_list[elm.master_id]['options'].push(product_list[elm.product_id]);

        console.log('delete', elm.product_id);
        delete product_list[elm.product_id];
    });

    return product_list;
}

const getCartData = async (session_id) => {
    //
    try {
        var connection = await getConnection();
    }catch (e) {
        return [];
    }

    try {
        let response = await query(
            "SELECT\
                `cart_data`.`cart_id`,\
                `cart_data`.`append`,\
                `cart_data`.`product_id`,\
                `cart_data`.`quantity`,\
                `product`.`product_name`,\
                `product`.`is_option`,\
                `product`.`reception`,\
                `product_info`.`price`\
            FROM\
                `cart_data`\
            INNER JOIN `product` ON `cart_data`.`product_id` = `product`.`product_id`\
            INNER JOIN `product_info` ON `product`.`product_id` = `product_info`.`product_id`\
            WHERE\
                `sess_id` = ?",
            [session_id],
            connection
        );

        // データの整理
        var formated = await cartDataFormat(response.results, connection);

        return Object.values(formated);
    }catch (e) {
        //
        console.log(e);
        var formated = [];
    }finally {
        connection.release();
    }

    return formated;
}

// getCartData('c95bb26b-34cd-4bb4-801e-baf92706');

module.exports = {
    cartDataFormat,
    getCartData
}