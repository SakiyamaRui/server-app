const {
    getSessionConnection,
    query
} = require('../database');

const loginCheck = async (req) => {
    if (!req.cookies.O_SESS_ID) {
        return false;
    }

    // ある場合は検索をかける
    try {
        var connection = await getSessionConnection();
    }catch (e) {
        return false;
    }

    try {
        let result = await query(
            'SELECT * FROM `line_login` WHERE `sess_id` = ?;',
            [req.cookies.O_SESS_ID],
            connection
        );

        connection.release();
        if (result.results.length > 0) {
            return true;
        }else{
            return false;
        }
    }catch (e) {
        console.log(e);
        connection.release();
        return false;
    }
}

module.exports = {
    loginCheck
}
