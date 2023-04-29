/**
 * 
 * Store Create
 * 店舗の作成
 * 
 */

const { getConnection } = require('../../database');

function StoreCreate ({
    storeName
}, transaction) {
    // 
}

console.log(typeof getConnection);

( async () => {
    //
    let connection = await getConnection();

    connection.query("show variables like '%char%';", (err, results, fields) => {
        connection.release();   // コネクションの開放

        if (err) throw err;

        for (const result of results) {
            console.log(result);
        }
    })
})();