import React from 'react';
import * as d3 from 'd3';

/**
 * Parallel coordinates showing features for selected year and region
 */
class ParallelCoordinates extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.featureList = {};

    // color for selection using brush
    this.selectedColor = 'steelblue';
  }


  drawParallelCoordinates(data) {

    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const margin = {top: 50, right: 50, bottom: 50, left: 20};
    const width = scrollWidth;
    const height = scrollHeight;

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', width)
      .attr('height', height);

    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // in form of [HR60, UE60, ...]
    const features = this.props.featureList.map(feature => feature.key + this.props.currentYear);

    const yScales = this.getYScales(data, features, height - margin.bottom, margin.top);
    
    const axisSpacing = width / features.length;
    const xScale = d3.scalePoint()
      .range([margin.left + axisSpacing / 2, width - margin.right - axisSpacing / 2])
      .domain(features);

    const line = d => {
      return d3.line()(features.map(feature => {
        const yScale = yScales[feature];
        return [xScale(feature), yScale(d[feature])];
      }));
    }
    
    // draw lines
    const path = svg.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('stroke', this.selectedColor)
      .attr('d', line);

    const brushWidth = 30;
    
    const brush = d3.brushY().extent([
      [-(brushWidth / 2), margin.top],
      [brushWidth / 2, height-margin.bottom]
    ]).on('start brush end', brushed);

    // draw axes
    svg.append('g')
      .selectAll('g')
      .data(features)
      .join('g')
      .attr('transform', d => `translate(${xScale(d)}, 0)`)
      .each(function(d) { d3.select(this).call(d3.axisLeft(yScales[d])); })
      .call(g => 
        g.append('text')
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#000')
          .text(d => this.featureList[d.substring(0, d.length-2)])
          .attr('transform', 'translate(5, 15) rotate(-10)')
      ).call(brush);

    const selections = new Map();

    function brushed({selection}, axisName) {
      if (selection === null) {
        selections.delete(axisName);
      } else {
        selections.set(axisName, selection.map(yScales[axisName].invert));
      }
      const selected = [];
      path.each(function(d) {
        const active = Array.from(selections).every(([axisName, [min, max]]) => {
          return d[axisName] >= max && d[axisName] <= min;
        });

        d3.select(this).style("stroke", active ? this.selectedColor : '#ddd');
        
        if (active) {
          d3.select(this).raise();
          selected.push(d);
        }
      });
      svg.property('value', selected).dispatch('input');
    }
  }


  /**
   * Create and return a dictionary of yScales where key is feature 
   */
  getYScales(data, features, bottom, top) {
    const scales = {};

    features.forEach(feature => {
      scales[feature] = d3.scaleLinear()
        .domain(d3.extent(data, item => item[feature]))
        .range([bottom, top]);
    });

    return scales;
  }


  componentDidMount() {
    // reorganize feature list to retrieve feature name using acronym
    this.props.featureList.forEach(feature => {
      this.featureList[feature.key] = feature.feature;
    });
  }


  clearChart() {
    d3.select(this.canvasRef.current).select('svg').selectAll('*').remove();
  }


  render() {
  
    if (this.props.stateCSV.length > 0 && this.props.countyCSV.length > 0) {

      // filter the dataset if a state is selected
      const data = this.props.currentState === '' ?
        this.props.stateCSV :
        this.props.countyCSV.filter(d => d.STATE_NAME === this.props.currentState);
      
      this.clearChart();
      this.drawParallelCoordinates(data);
    }
    // create title based on selected state
    const title = this.props.currentState === '' ?
      'US States Socio-economic Characteristics in 19' +  this.props.currentYear :
      this.props.currentState + ' Socio-economic Characteristics in 19' + this.props.currentYear;
    
    return (
      <div style={{height: '100%'}}>
        <div style={{padding: '5px 5px', textAlign: 'center'}}>{title}</div>
        <div style={{height: '100%'}} ref={this.canvasRef}>
          <svg></svg>
        </div>
      </div>
    )
  }
}


export default ParallelCoordinates;