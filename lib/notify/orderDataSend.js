const { query } = require("../database");
const lineNotify = require("./line");


const notifyList = {
    '001': "0a573434-b5f7-4653-ab5c-2176a913",
    '002': "0a573434-b5f7-4653-ab5c-2176a913",
    '003': "0a573434-b5f7-4653-ab5c-2176a913"
}

const orderDataSubmit = async (order_id, order_number, connection) => {
    // 商品データの取得
    let productList = await query(
        "SELECT\
            `id`, `order_id`, `order_products`.`product_id`, `quantity`, `product`.`product_name`, `stores`.`store_id`, `stores`.`store_name`\
        FROM `order_products`\
        INNER JOIN `product` ON `order_products`.`product_id` = `product`.`product_id`\
        INNER JOIN `stores` ON `product`.`store_id` = `stores`.`store_id`\
        WHERE `order_id` = ?",
        [order_id],
        connection
    );

    let products = {};
    productList.results.forEach((elm) => {
        if (!products.hasOwnProperty(elm.store_id)) {
            //
            products[elm.store_id] = [];
        }

        if (elm.quantity == 0) {
            return;
        }

        products[elm.store_id].push(`${elm.product_name} (${elm.quantity})`);
    });

    let keyList = {
        '001': 'キッチントラックいいね',
        '002': 'smoco',
        '003': 'モドズキッチン',
    }

    for (let key in products) {
        let count = 0;

        while (true) {
            count++;
            let result = lineNotify(notifyList[key], `\n新規注文\n注文番号: ${order_number}\n\n商品一覧:\n${products[key].join('\n')}\n\n呼び出しURL:\nhttps://order.apori.jp/call?return_to=${encodeURIComponent(
                `https://order.apori.jp/api/root/order/userCall?store=${encodeURIComponent(keyList[key])}&order_number=${order_number}&order_id=${order_id}`)}`);

            if (result || count > 2) {
                break;
            }
        }
    }

    return true;
}

module.exports = orderDataSubmit;