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