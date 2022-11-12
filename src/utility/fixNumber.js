/**
 * 
 * @param {Number} n 
 * @returns 
 */
 module.exports = (n) => {
    let raw = n.toString().split("."), a = raw[0], b = raw[1] ? "." + raw[1] : "", c = 1, e = "";

    if (a.startsWith("-")) {
        a = a.slice(1);
        e = "-";
    }

    for (let i = a.length - 1; i >= 0; i--, c++) {
        if (c === 3 && i !== 0) {
            c = 0;
            a = `${a.substring(0, i)},${a.substring(i)}`
        }
    }

    return e + a + b;
} 