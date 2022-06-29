export function getAverage(data, feature, year) {

    const property = feature + year;
    let sum = 0;
    data.forEach(d => sum += Number(d[property]));
    return sum / data.length;
}

export function getStd(data, feature, year, average) {

    const property = feature + year;
    let sum = 0;
    data.forEach(d => sum += (Number(d[property])-average)*(Number(d[property])-average));
    return Math.sqrt(sum / data.length);
}