export function importPathInks(pathinks, width, height) {
    var pathsexport = Object.keys(pathinks);
    var d = Math.min(width, height);
    pathsexport = pathsexport.map(path => {
        var simplepath = JSON.parse(path);
        simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
            return [segment[0] * d, segment[1] * d];
        });
        return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
        ink[0] = ink[0].map(x => {
            return x * d;
        });
        ink[1] = ink[1].map(y => {
            return y * d;
        });
        return ink;
    });
    pathinks = ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
        {},
        pathsexport,
        inks
    );
    return pathinks;
}

export function exportPathInks(pathinks, width, height) {
    var pathsexport = Object.keys(pathinks);
    var d = Math.min(width, height);
    pathsexport = pathsexport.map(path => {
        var simplepath = JSON.parse(path);
        simplepath[1]['segments'] = simplepath[1]['segments'].map(segment => {
            return [segment[0] / d, segment[1] / d];
        });
        return JSON.stringify(simplepath);
    });
    var inks = Object.values(pathinks);
    inks = inks.map(ink => {
        ink[0] = ink[0].map(x => {
            return x / d;
        });
        ink[1] = ink[1].map(y => {
            return y / d;
        });
        return ink;
    });
    return ((o, a, b) => a.forEach((c, i) => (o[c] = b[i])) || o)(
        {},
        pathsexport,
        inks
    );
}
