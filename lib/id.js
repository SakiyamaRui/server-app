const { customAlphabet } = require('nanoid/async');

async function generateNumberId(length) {
    const nanoid = customAlphabet('1234567890', length);
    return await nanoid();
}

module.exports = {
    generateNumberId
}