import * as d3 from 'd3';
import './tooltip.css';

export function createTooltip() {
  return d3.select('#root')
    .append('div')
    .attr('class', 'tooltip')
    .style('visibility', 'hidden');
}