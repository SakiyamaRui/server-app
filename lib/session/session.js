const crypto = require('crypto');

const getSessionId = (req, res) => {
    if (req.cookies.O_SESS_ID) {
        // セッションあり
        return req.cookies.O_SESS_ID;
    }else{
        // セッションなし
        let newId = crypto.randomUUID();

        // Cookieにセット
        res.cookie(
            'O_SESS_ID',
            newId,
            {
                sameSite: 'None',
                secure: true,
                maxAge: 1000 * 60 * 60 * 48,
            }
        );

        return newId;
    }
}

module.exports = {
    getSessionId,
}