var express = require('express');
var router = express.Router();
const {getProductData, getProductList} = require('../../../lib/product/get');

const getDataHandler = async (req, res) => {
    let product_id = req.params.id;

    try {
        let responce = await getProductData(product_id, 'public');

        if (responce == false) {
            res.sendStatus(404);
            return false;
        }

        res.send(responce);
        return false;
    }catch (err) {
        res.sendStatus(500);
    }
}

router.use('/getData/List', async (req, res) => {
    //
    try {
        let response = await getProductList();

        res.json(response);
    }catch (e) {
        console.log(e)
        res.sendStatus(500);
    }
});

router.use('/getData/:id', getDataHandler);


module.exports = router;