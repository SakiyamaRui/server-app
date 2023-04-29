const {
    getSessionConnection,
    query,
} = require('../database');

const axios = require('axios');

const lineNotify = async (sess_id, body) => {
    // コネクションの取得
    try {
        var connection = await getSessionConnection();
    }catch (e) {
        return false;
    }

    try {
        var result = await query(
            'SELECT * FROM `line_notify` WHERE `sess_id` = ?',
            [sess_id],
            connection
        );

        if (result.results.length !== 0) {
            console.log(result.results[0].access_token)
            // 通知送信のリクエスト
            let res = await axios.post(
                `https://notify-api.line.me/api/notify`,
                {
                    message: body,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${result.results[0].access_token}`
                    }
                }
            );


            if (res.data.status == 200) {
                return true;
            }
        }
    }catch (e) {
        //
        console.log(e);
    }finally {
        console.log('connection released');
        connection.release();
    }

    return false;
}

// (async () => {
//     let res = await lineNotify('0a573434-b5f7-4653-ab5c-2176a913', 'これは、テストです。');

//     console.log(res)
// })();

module.exports = lineNotify