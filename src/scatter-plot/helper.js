import * as d3 from 'd3';

export function xScale(data, property, left, right) {
  return d3.scaleLinear()
    .domain(d3.extent(data.map(d => d[property])))
    .range([left, right]); 
}

export function yScale(data, property, bottom, top) {
  return d3.scaleLinear()
    .domain(d3.extent(data.map(d => d[property])))
    .range([bottom, top]);
}