import * as d3 from 'd3';

export function createTooltip() {
  return d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('visibility', 0);
}