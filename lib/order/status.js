

const statusString = (state) => {
    switch (state) {
        case 0:
            return '会計待ち';
        case 1:
            return '会計済み';
    }
}

module.exports = statusString;