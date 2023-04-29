const {
    beginTransaction,
    getConnection,
    rollback,
    query,
    commit
} = require('../database');
const { generateNumberId } = require('../id');

let productJsonTemplate = {
    shop_id: '00001',
    product_name: '商品名',
    product_id: 'new',
    parent_id: null,
    reception: true,
    price: 300,
    body: 'テスト文\n12345\nあいうえお\nかきくけこ',
    stock: 10,
    option: [],
}


const productDataUpdate = async (data, connection) => {
    //　TB_product_info
    try {
        let sql = 'UPDATE `TB_product_info` SET';
        let placeholder = [];
        let noChanges = true;

        // 商品名
        if (data.product_name) {
            sql += ' `product_name` = ?,';
            placeholder.push(data.product_name);
            noChanges = false;
        }

        // 値段
        if (data.price) {
            sql += ' `price` = ?,';
            placeholder.push(data.price);
            noChanges = false;
        }

        // 商品紹介文
        if (data.body) {
            sql += ' `body` = ?,';
            placeholder.push(data.body);
            noChanges = false;
        }

        if (!noChanges) {
            // 変更をDBに保存
            let responece = query(
                `${sql.slice(0, -1)} WHERE \`order_id\` = ?`,
                [...placeholder, data.order_id],
                connection
            );
        }
    }catch (e) {
        //
        console.log(e);
        throw e;
    }
}

const productCreate = async (data, parent_id, connection) => {
    //
    try {
        //
        let newId = '';
        while (true) {
            newId = await generateNumberId(5);

            // IDが使われているか確認
            let responce = await query(
                'SELECT * FROM `TB_product` WHERE `product_id` = ?;',
                [newId],
                connection
            );

            if (responce.results.length == 0) {
                break;
            }
        }

        // メイン
        let dbResponceProduct = await query(
            'INSERT INTO `TB_product`(`product_id`, `shop_id`, `parent_id`, `reception`) VALUES (?, ?, ?, ?);',
            [newId, data.shop_id, parent_id, data.reception],
            connection
        );

        // 商品情報
        let dbResponceProductInfo = await query(
            'INSERT INTO `TB_product_info`(`product_id`, `product_name`, `price`, `body`) VALUES (?, ?, ?, ?);',
            [newId, data.product_name, data.price, data.body],
            connection
        );

        // 商品在庫
        let dbResponceStock = await query(
            'INSERT INTO `TB_product_stock`(`product_id`, `stock_num`) VALUES (?, ?);',
            [newId, data.stock],
            connection
        );

        //　商品関係
        if (data.master_id) {
            var dbResponceRelation = await query(
                'INSERT INTO `TB_product_relation` (`product_id`, `children_id`) VALUES(?, ?);',
                [data.master_id, newId],
                connection
            );
        }

        return newId;
    }catch (e) {
        throw e;
    }
}

const dataSaveHandler = async (data, parent_id, connection) => {
    let product_id = data.product_id;
    let master_id = (data.master_id)? data.master_id : null;


    if (product_id == 'new') {
        //
        product_id = await productCreate(data, parent_id, connection)
        data.product_id = product_id;
    }else{
        //
        await productDataUpdate(data, connection);
    }

    data.option ??= [];

    data.option.map(async (data) => {
        if (parent_id == null) {
            data['master_id'] = product_id;
        }

        if (master_id) {
            data['master_id'] = master_id;
        }

        await dataSaveHandler(data, product_id, connection);
    });

    return product_id;
}


const productDataSave = async (data) => {
    // DBコネクションを取得
    try {
        //
        var connection = await getConnection();

        if (!connection) throw 'DB Connection Error';

        // トランザクションの開始
        if (!await beginTransaction(connection)) throw 'Transaction Error';
    }catch (e) {
        // 
        console.log(e)
        throw e;
    }

    // 取得したデータに合わせてDBに保存
    try {
        var product_id = dataSaveHandler(data, null, connection);
    }catch (e) {
        //
        console.log(e)
        await rollback(connection);
    }

    try {
        if (await commit(connection)) {
            return product_id;
        }else{
            return false;
        }
    }catch (e) {
        throw e;
    }
}

(async () => {
    let id = await productDataSave({
        shop_id: '00001',
        product_id: 'new',
        product_name: '商品1',
        price: 400,
        reception: true,
        body: 'テスト文\n12345\nあいうえお\nかきくけこ',
        stock: -1,
        option: [{
            shop_id: '00001',
            product_id: 'new',
            product_name: 'サイズ',
            price: 0,
            reception: true,
            body: '商品のサイズ',
            stock: -1,
            option: [
                {
                    shop_id: '00001',
                    product_id: 'new',
                    product_name: '大',
                    price: 50,
                    reception: true,
                    body: '',
                    stock: 10,
                },
                {
                    shop_id: '00001',
                    product_id: 'new',
                    product_name: '普通',
                    price: 0,
                    reception: true,
                    body: '',
                    stock: 10,
                },
            ]
        }],
    });

    console.log(id)
})();

module.exports = {
    productDataSave,
}
