import * as d3 from 'd3';
import './tooltip.css';

export function createTooltip() {
  return d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('visibility', 0);
}