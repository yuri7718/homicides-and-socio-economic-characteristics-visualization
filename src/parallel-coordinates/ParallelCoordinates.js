import React from 'react';
import * as d3 from 'd3';
import { Spin } from 'antd';
import { getStateData, getYScales } from './helper';

class ParallelCoordinates extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();

    this.title = '';
  }



  drawParallelCoordinates(data) {

    const {scrollWidth, scrollHeight} = this.canvasRef.current;
    const margin = {top: 50, right: 50, bottom: 50, left: 50};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;

    if (this.props.currentState !== '') {
      data = data.filter(d => d.STATE_NAME === this.props.currentState);
    }

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', width)
      .attr('height', height)

    const rootGroup = svg.select('g#root');

    rootGroup.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let features = this.props.featureList.map(feature => feature.key + this.props.currentYear);

    const yScales = getYScales(data, features, margin.top + height, margin.top);
    const xScale = d3.scalePoint()
      .range([margin.left, width])
      .domain(features);

    const path = d => {
      return d3.line()(features.map(feature => {
        const yScale = yScales[feature];
        return [xScale(feature), yScale(Number(d[feature]))];
      }));
    }

    rootGroup.selectAll('path')
      .data(data)
      .join('path')
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', '#69b3a2')
    
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
        return d; })
      .style("fill", "black")
      .attr('id', 'label-test')
      
  
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) { 
    if (prevProps.currentState !== this.props.currentState) {
      //console.log(this.props.currentState)
    }
  }

  clearChart() {
    d3.select(this.canvasRef.current).select('g#root').selectAll('*').remove();
  }


  render() {
  
    if (this.props.stateCSV.length > 0 && this.props.countyCSV.length > 0) {
      if (this.props.currentState === '') {
        this.clearChart();
        this.drawParallelCoordinates(this.props.stateCSV);
      } else {
        this.clearChart();
        this.drawParallelCoordinates(this.props.countyCSV);
      }
    }
    const text = this.props.currentState === '' ?
      ('US states socio-economic characteristics in 19' +  this.props.currentYear) :
      this.props.currentState + ' socio-economic characteristics in 19' + this.props.currentYear;
    return (
      <div style={{height: '100%'}}>
        <div style={{padding: '10px 10px', textAlign: 'center'}}>{text}</div>
        <div style={{height: '100%'}} ref={this.canvasRef}>
          <svg style={{width: '100%', height: '100%'}}>
            <g id='root'></g>
          </svg>
        </div>
      </div>
    )
  }
}


export default ParallelCoordinates;