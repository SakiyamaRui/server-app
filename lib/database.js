const mysql = require('mysql');
const DBConfig = require('../config/db.json');

const dbPool = mysql.createPool({
    connectionLimit: 4,             // 最大コネクション数
    host: DBConfig.host.public,     // DBホスト
    user: DBConfig.user,            // ログインユーザー
    password: DBConfig.password,    // ログインパスワード
    database: DBConfig.database,    // DB名
    charset: DBConfig.charset,      // サーバーの文字セット
});

const sessionDBPool = mysql.createPool({
    connectionLimit: 2,             // 最大コネクション数
    host: DBConfig.session.host.public,     // DBホスト
    user: DBConfig.session.user,            // ログインユーザー
    password: DBConfig.session.password,    // ログインパスワード
    database: DBConfig.session.database,    // DB名
    charset: DBConfig.session.charset,      // サーバーの文字セット
});

const getSessionConnection = () => {
    return new Promise((resolve, reject) => {
        sessionDBPool.getConnection((err, connection) => {
            if (err) throw err;

            resolve(connection);
        });
    });
}

const getConnection = () => {
    return new Promise((resolve, reject) => {
        dbPool.getConnection((err, connection) => {
            if (err) throw err;

            resolve(connection);
        });
    });
}

/**
 * beginTransaction
 * 
 * トランザクションの作成
 * 
 * @param {connection} connection DBのコネクション
 * @returns trueの場合は作成成功、falseの場合は作成に失敗
 */
const beginTransaction = (connection) => {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}

/**
 * rollback
 * 
 * トランザクションのキャンセル
 * 
 * @param {connection} connection DBのコネクション
 * @returns trueの場合は成功、falseの場合は失敗
 */
const rollback = (connection) => {
    return new Promise((resolve, reject) => {
        connection.rollback((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}


/**
 * query
 * 
 * SQLクエリの実行
 * 
 * @param {String} sql 実行するSQL文
 * @param {Array} placeholder プレースホルダーの置き換え文字
 * @param {connection} connection DBへのコネクション
 * @returns  Object {results, fields}
 */
const query = (sql, placeholder, connection) => {
    return new Promise((resolve, reject) => {
        connection.query(
            sql,
            placeholder,
            (err, results, fields) => {
                if (err) throw err;

                resolve({results, fields});
            }
        );
    });
}


/**
 * commit
 * 
 * トランザクションのコミット
 * 
 * @param {connection} connection DBへのコネクション
 * @returns trueならば成功
 */
const commit = (connection) => {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) throw err;

            resolve(true);
        });
    });
}

module.exports = {
    dbPool,
    getConnection,
    beginTransaction,
    rollback,
    query,
    commit,
    getSessionConnection
}