import React from 'react';
import * as d3 from 'd3';
import { Spin } from 'antd';
import { getStateData, getYScales } from './helper';

class ParallelCoordinates extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  drawParallelCoordinates(data) {

    const {scrollWidth, scrollHeight} = this.canvasRef.current;
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;


    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', width)
      .attr('height', height)

    const rootGroup = svg.select('g#root');

    rootGroup.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const features = Object.keys(data[0]).filter(key => key.slice(-2) == this.props.currentYear);

    const yScales = getYScales(data, features, margin.top + height, margin.top);
    const xScale = d3.scalePoint()
      .range([margin.left, width])
      .domain(features);

    const path = d => {
      return d3.line()(features.map(feature => {
        const yScale = yScales[feature];
        return [xScale(feature), yScale(d[feature])];
      }));
    }

    rootGroup.selectAll('path')
      .data(data)
      .join('path')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#69b3a2')
      //.opacity(0.5);
    
    
    rootGroup.selectAll("myAxis")
      .data(features).enter()
      .append("g")
      .attr('id', 'axis-test')
      .attr('transform', d => `translate(${xScale(d)})`)
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yScales[d])); })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 10)
      .text(function(d) { 
        console.log(d);
        return d; })
      .style("fill", "black")
      .attr('id', 'label-test')
      
  
  }

  componentDidMount() {
    //this.drawParallelCoordinates(this.props.stateCSV);
    
  }

  componentDidUpdate() { 
    console.log("parallel",this.props.currentYear);
    //this.drawParallelCoordinates(this.props.stateCSV)
  }


  render() {
    if (this.props.stateCSV.length > 0) {
      this.drawParallelCoordinates(this.props.stateCSV);
      console.log("called");
    }
    return (
      <div style={{height: '100%'}} ref={this.canvasRef}>
        <svg style={{width: '100%', height: '100%'}}>
          <g id='root'></g>
        </svg>
      </div>
    )
  }
}


export default ParallelCoordinates;