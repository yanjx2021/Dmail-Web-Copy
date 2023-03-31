export var randomcolor = function () {
    const judge = Math.floor(Math.random() * (1000 + 1)) % 6
    if (judge === 0) return 'red'
    else if (judge === 1) return 'cyan'
    else if (judge === 2) return 'purple'
    else if (judge === 3) return 'timber'
    else if (judge === 4) return 'orange'
    else return 'green'
}
