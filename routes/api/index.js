var express = require('express');
var router = express.Router();

var productRouter = require('./product/getData');
var cartRouter = require('./cart/cart');
var sessionRouter = require('./session/getData');
var orderRouter = require('./order/order');
var rootRegiRouter = require('./root/regi');
var rootNotifyRouter = require('./root/notify');
var storeTerminalRouter = require('./root/terminal');

const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}

router.use(cors(corsOptions));
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router.use('/session', sessionRouter);
router.use('/order', orderRouter);
router.use('/root/regi', rootRegiRouter);
router.use('/root/notify', rootNotifyRouter);
router.use('/root/order', storeTerminalRouter)

module.exports = router;