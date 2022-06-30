import React from 'react';
import * as d3 from 'd3';
import { getAverage, getTooltipText } from './helper';

/**
 * Heat map showing all features vs. time for selected region
 */
class Heatmap extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef(); 

    this.tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '15px')
      .style('visibility', 'hidden')
      .style('background-color', 'black')
      .style('opacity', 0.7)
      .style('color', '#fff')
      .style('left', '0px')
      .style('top', '0px');
  }

  
  drawHeatMap(data) {

    const { scrollWidth, scrollHeight } = this.canvasRef.current;
    const margins = { top: 30, right: 30, bottom: 100, left: 200 };
    const width = scrollWidth - margins.left - margins.right;
    const height = scrollHeight - margins.top - margins.bottom;

    // process dataset so that it can be used by the heat map
    var cleanedData = []
    this.props.featureList.forEach(feature => {
      this.props.years.forEach(year => {
        let avg = getAverage(data, feature.key, year);
        cleanedData.push({ feature: feature.feature, year: '19' + year, value: avg });
      })
    });

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(this.props.years.map(year => '19' + year));
    
    const yScale = d3.scaleBand()
      .range([0, height])
      .domain(this.props.featureList.map(feature => feature.feature))
            
    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', scrollWidth)
      .attr('height', scrollHeight);

    const rootGroup = svg.select('g#root')
      .attr('transform', `translate(${margins.left}, ${margins.top})`);
    
    // append x-axis
    rootGroup.append('g')
      .call(d3.axisBottom(xScale).ticks(this.props.years.length))
      .attr('transform', `translate(0, ${height})`) 

    // append y-axis
    const yAxis = rootGroup.append('g')
      .call(d3.axisLeft(yScale))

    // reorganize the data to create color scale per feature
    const dataPerFeature = {};
    cleanedData.forEach(d => {
      if (dataPerFeature.hasOwnProperty(d.feature)) {
        dataPerFeature[d.feature].push(d.value);
      } else {
        dataPerFeature[d.feature] = [d.value];
      }
    });
    
    const colorScales = {};
    for (let feature in dataPerFeature) {
      colorScales[feature] = d3.scaleLinear()
        .range(['#eff3ff', '#08519c'])
        .domain(d3.extent(dataPerFeature[feature]));
    }

    rootGroup.selectAll()
      .data(cleanedData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.feature))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', d => colorScales[d.feature](d.value))
      .on('mouseover', (event, d) => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(getTooltipText(this.props.currentState, d))
          .style('left', (event.pageX - 200) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      }).on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden')
      });

    // increase font weight and font size for homicide rate as it is the main feature
    yAxis.selectAll('g').selectAll('text')
      .attr('font-weight', d => d === 'Homicide rate' ? 700 : 400)
      .attr('font-size', d => d === 'Homicide rate' ? '20px' : '10px');
  }

  clearMap() {
    d3.select(this.canvasRef.current).select('#root').selectAll('*').remove();
  }
 
  render() {
    if (this.props.countyCSV.length > 0) {

      // filter the dataset if a state is selected
      const data = this.props.currentState === '' ?
        this.props.countyCSV :
        this.props.countyCSV.filter(d => d.STATE_NAME === this.props.currentState);
      
      this.clearMap();
      this.drawHeatMap(data);
    }
    // create title based on selected state
    const title = this.props.currentState === '' ?
      'Socio-economic Characteristics in the US' :
      'Socio-economic Characteristics in ' + this.props.currentState;
    return (
      <div style={{ height: '100%' }} ref={this.canvasRef}>
        <div style={{textAlign: 'center'}}>{title}</div>
          <svg style={{ width: '100%', height: '100%' }}>
            <g id='root'></g>
          </svg>
      </div>
    );
  }
}

export default Heatmap;