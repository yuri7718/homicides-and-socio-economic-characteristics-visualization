import * as d3 from 'd3';

export function xScale(data, currentYear, left, right) {
  const HR = 'HR';
  const property = HR + currentYear;

  return d3.scaleLinear()
    .domain(d3.extent(data.map(d => Number(d[property]))))
    .range([left, right]); 
}

export function yScale(data, currentFeature, currentYear, bottom, top) {
  const property = currentFeature + currentYear;
  
  return d3.scaleLinear()
    .domain(d3.extent(data.map(d => Number(d[property]))))
    .range([bottom, top]);
}

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