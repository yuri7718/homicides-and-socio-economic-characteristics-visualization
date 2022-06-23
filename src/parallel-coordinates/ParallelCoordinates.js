import React from 'react';
import * as d3 from 'd3';
import { Spin } from 'antd';
import { getStateData, getScales } from './helper';

class ParallelCoordinates extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  drawParallelCoordinates(data) {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;
    const margin = {top: 30, right: 30, bottom: 30, left: 30};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;


    const svg = d3.select('#parallel-coordinates')
      .attr('width', scrollWidth)
      .attr('height', scrollHeight)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const featureNames = Object.keys(data[0]).filter(key => key.slice(-2) == this.props.currentYear);
    const yScales = getScales(this.props.stateCSV, this.props.currentYear, height);
    const xScale = d3.scalePoint()
      .range([0, width])
      .domain(featureNames);

    function path(d) {
      return d3.line()(featureNames.map(function(p) { return [xScale(p), yScales[p](d[p])]; }));
    }

    svg.selectAll('myPath')
      .data(data)
      .join('path')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#000')
    
    svg.selectAll("myAxis")
      .data(featureNames).enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return `translate(${xScale(d)})`})
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yScales[d])); })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
  
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
        <svg id='parallel-coordinates' style={{width: '100%', height: '100%'}}></svg>
      </div>
    )
  }
}


export default ParallelCoordinates;