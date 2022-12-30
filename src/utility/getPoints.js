module.exports = (date, history) => {
    const d = date.split("-").map(v => parseInt(v));

    let score = 0;

    for (let i = 0; i < history.length; i++) {
        const h = history[i];
        const x = h.date.split("-").map(v => parseInt(v));

        if ((x[0] === d[0] && x[1] === d[1] && x[2] === d[2]) || (x[0] < d[0] && x[1] < d[1] && x[2] < d[2])) {
            score = h.score;
            break;
        }
    }

    return score;
}