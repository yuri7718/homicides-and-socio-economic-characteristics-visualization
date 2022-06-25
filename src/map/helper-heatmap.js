

export function getAverage(data, feature, year) {

    const property = feature + year;
    let sum = 0;
    data.forEach(d => sum += Number(d[property]));
    return sum / data.length;
}