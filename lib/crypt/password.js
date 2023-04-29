const bcrypt = require('bcrypt');
const {
    getConnection,
    query
} = require('../database')

/**
 * @param {String} password ハッシュ化するパスワード
 * @param {String} store_id パスワードの変更をするストアID
 */
const passwordHash = async (password, store_id) => {
    // ハッシュ化する
    let hashed = bcrypt.hashSync(password, 10);

    // DBに保存
    try {
        let connection = await getConnection();

        // 実行
        let responce = await query(
            'UPDATE `TB_store` SET `password` = ? WHERE `shop_id` = ?;',
            [hashed, store_id],
            connection
        );

        // コネクションの開放
        connection.release();
    }catch (e) {
        console.log(e);
        throw 'DBエラー';
    }

    return true;
}

/**
 * 
 * @param {String} password チャレンジするパスワード
 * @param {String} store_id 認証先のストアID
 */
const passwordVerify = async (password, store_id) => {
    // DBからパスワードを取得
    try {
        let connection = await getConnection();

        let responce = await query(
            'SELECT `password` FROM `TB_store` WHERE `shop_id` = ?;',
            [store_id],
            connection
        );

        console.log(responce);
        if (responce.results[0]) {
            //
            var hash = responce.results[0].password;
        }else{
            throw '認証エラー';
        }
    }catch (e) {
        console.log(e);
        throw e;
    }

    return bcrypt.compareSync(password, hash);
}

module.exports = {
    passwordHash,
    passwordVerify
}