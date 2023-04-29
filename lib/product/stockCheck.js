const {
    getConnection,
    query,
    beginTransaction,
    rollback,
    commit
} = require('../database');

const getStocks = async (list, connection) => {
    try {
        let placeHolder = '?,'.repeat(list.length).slice(0, -1);

        let productStockList = await query(
            "SELECT *, `product`.`product_name` FROM `stock` INNER JOIN `product` ON `stock`.`product_id` = `product`.`product_id` WHERE `stock`.`product_id` IN(" + placeHolder + ")",
            list,
            connection
        );

        return productStockList;
    }catch (e) {
        return [];
    }
}

const stockCheck = async (product_list, quantity, connection) => {
    try {
        let placeHolder = '?,'.repeat(product_list.length).slice(0, -1);

        let productStockList = await query(
            "SELECT *, `product`.`product_name` FROM `stock` INNER JOIN `product` ON `stock`.`product_id` = `product`.`product_id` WHERE `stock`.`product_id` IN(" + placeHolder + ")",
            product_list,
            connection
        );

        let shortageList = [];

        productStockList.results.forEach((elm) => {
            if (elm.stock_num == -1) {
                console.log('exec');
                return;
            }

            if (elm.stock_num - quantity < 0) {
                shortageList.push({
                    product_id: elm.product_id,
                    product_name: elm.product_name,
                });
            }
        });

        if (shortageList.length == 0) {
            return true;
        }else{
            return shortageList;
        }

    }catch (e) {
        console.log(e);
        return false;
    }
}

const stockCheckAll = async (product_list, connection) => {
    try {
        //
        let lists = product_list.map((elm) => elm.product_id);
        let productStockList = await getStocks(lists, connection);

        let shortageList = [];

        productStockList.results.forEach((elm) => {
            let quantity = product_list.find((col) => elm.product_id == col.product_id);

            if (elm.stock == -1) {
                return;
            }

            if (elm.stock - quantity.quantity < 0) {
                shortageList.push({
                    product_id: elm.product_id,
                    product_name: elm.product_name,
                });
            }
        });

        return shortageList;
    }catch (e) {
        console.log(e)
        return false;
    }
}

module.exports = {
    stockCheck,
    stockCheckAll
}