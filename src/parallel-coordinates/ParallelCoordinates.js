import React from 'react';
import * as d3 from 'd3';
import { Spin } from 'antd';
import { getStateData, getYScales } from './helper';


class ParallelCoordinates extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();

    this.title = '';

    this.featureList = {};

    this.selectedColor = 'steelblue';
    this.unselectedColor = '#ddd';
  }



  drawParallelCoordinates(data) {

    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const margin = {top: 50, right: 50, bottom: 50, left: 20};
    const width = scrollWidth;
    const height = scrollHeight;

    if (this.props.currentState !== '') {
      data = data.filter(d => d.STATE_NAME === this.props.currentState);
    }

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', width)
      .attr('height', height)

    //const rootGroup = svg.select('g#root');


    svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    let features = this.props.featureList.map(feature => feature.key + this.props.currentYear);
    //let featureLabels = this.props.featureList.map(feature => feature.feature);
    //console.log(features);
    const yScales = getYScales(data, features, height-margin.bottom, margin.top);
    
    const axisSpacing = width / features.length;
    const xScale = d3.scalePoint()
      .range([margin.left + axisSpacing / 2, width-margin.right - axisSpacing/2])
      .domain(features);

    const line = d => {
      return d3.line()(features.map(feature => {
        const yScale = yScales[feature];
        return [xScale(feature), yScale(Number(d[feature]))];
      }));
    }
    /*
    rootGroup.selectAll('path')
      .data(data)
      .join('path')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', this.selectedColor)*/
    
    const brushWidth = 30;
    
    const brush = d3.brushY().extent([
      [-(brushWidth / 2), margin.top],
      [brushWidth / 2, height-margin.bottom]
    ]).on('start brush end', brushed);


    const path = svg.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('stroke', this.selectedColor)
      .attr('d', line);

    svg.append('g')
      .selectAll('g')
      .data(features)
      .join('g')
      .attr('transform', d => `translate(${xScale(d)}, 0)`)
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(yScales[d]));
      })
      .call(g => 
        g.append('text')
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#000')
          .text(d => {
            let f = d.substring(0, d.length-2);
            return this.featureList[f];
          })
          .attr("transform", "translate(5, 15) rotate(-10)")
      ).call(brush)

    const selections = new Map();
    function brushed({selection}, axisName) {
      //console.log(axisName);
      //selection is screen coordinates interval
      if (selection === null) {
        selections.delete(axisName);
      } else {
        //console.log(axisName)
        selections.set(axisName, selection.map(yScales[axisName].invert));
      }
      const selected = [];
      path.each(function(d) {
        //console.log(selections)
        const active = Array.from(selections).every(([axisName, [min, max]]) => {
          //console.log(min+"---"+max)
          //console.log(d[axisName], axisName)
          //console.log(d)
          return d[axisName] >= max && d[axisName] <= min
        });
        //console.log("active", active);
        d3.select(this).style("stroke", active ? this.selectedColor : "#ddd");
        
        if (active) {
          d3.select(this).raise();
          selected.push(d);
        }
      });
      console.log(selected);
      svg.property("value", selected).dispatch("input");
    }
  }

  componentDidMount() {
    this.props.featureList.forEach(feature => {
      this.featureList[feature.key] = feature.feature;
    })

  }

  componentDidUpdate(prevProps, prevState) { 
    if (prevProps.currentState !== this.props.currentState) {
      //console.log(this.props.currentState)
    }
  }

  clearChart() {
    d3.select(this.canvasRef.current).select('svg').selectAll('*').remove();
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
          </svg>
        </div>
      </div>
    )
  }
}


export default ParallelCoordinates;