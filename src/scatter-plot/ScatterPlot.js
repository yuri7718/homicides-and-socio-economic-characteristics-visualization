import React from 'react';
import * as d3 from 'd3';
import { Row, Col } from 'antd';
import { xScale, yScale } from './helper';
import Statistics from 'statistics.js';

console.error = () => {};

/**
 * Scatter plot for correlation between selected feature and homicide rate
 */
class ScatterPlot extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.featureList = {};
  }

  drawScatterPlot(data) {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const margin = {top: 30, right: 30, bottom: 50, left: 70};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', scrollWidth)
      .attr('height', scrollHeight);

    const rootGroup = svg.select('g#root')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xProperty = 'HR' + this.props.currentYear;
    const yProperty = this.props.currentFeature + this.props.currentYear;

    const x = xScale(data, xProperty, 0, width);
    const y = yScale(data, yProperty, height, 0);

    // draw axes
    rootGroup.append('g')
      .attr('transform', `translate(0, ${height} )`)
      .call(d3.axisBottom(x))

    rootGroup.append('g')
      .call(d3.axisLeft(y));

    // draw scatter plot
    rootGroup.append('g')
      .selectAll('dot')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d[xProperty]))
      .attr('cy', d => y(d[yProperty]))
      .attr('r', 3)
      .style('fill', '#69b3a2')

    // x-axis label
    rootGroup.append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .text('Homicide rate')

    // y-axis label
    rootGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .text(this.featureList[this.props.currentFeature])
      
  }

  clearChart() {
    d3.select(this.canvasRef.current).select('#root').selectAll('*').remove();
  }

  componentDidMount() {
    // reorganize feature list to retrieve feature name using acronym
    this.props.featureList.forEach(feature => {
      this.featureList[feature.key] = feature.feature;
    });
  }

  render() {
    var pearson = undefined;
    var spearman = undefined;

    if (this.props.stateCSV.length > 0 && this.props.countyCSV.length > 0) {
      
      // filter the dataset if a state is selected
      const data = this.props.currentState === '' ?
        this.props.stateCSV : 
        this.props.countyCSV.filter(d => d.STATE_NAME === this.props.currentState);

      this.clearChart();
      this.drawScatterPlot(data);

      const xKey = 'HR' + this.props.currentYear;
      const yKey = this.props.currentFeature + this.props.currentYear;
      
      const columns = {};
      columns[xKey] = 'interval';
      columns[yKey] = 'interval';

      const stats = new Statistics(data, columns);
      pearson = stats.correlationCoefficient(xKey, yKey).correlationCoefficient.toFixed(2);
      spearman = stats.spearmansRho(xKey, yKey).rho.toFixed(2);
    }

    const title = this.props.currentState === '' ? 
      this.featureList[this.props.currentFeature] + ' vs. homicide rate in US states in 19' + this.props.currentYear :
      this.featureList[this.props.currentFeature] + ' vs. homicide rate in ' + this.props.currentState + ' state in 19' + this.props.currentYear;

    pearson = Number(pearson);
    var explanation = '[explanation]';
    if (pearson < -0.5) {
      explanation = 'Strong negative correlation';
    } else if (-0.5 <= pearson && pearson < 0) {
      explanation = 'Insignificant negative correlation';
    } else if (0 <= pearson && pearson < 0.5) {
      explanation = 'Insignificant positive correlation';
    } else {
      explanation = 'Strong positive correlation';
    }

    return (
      <div style={{height: '100%'}}>
        <Row style={{height: '100%'}}>
          <Col span={20}>
            <div style={{textAlign: 'center'}}>{title}</div>
            <div style={{height: '85%'}} ref={this.canvasRef}>
              <svg style={{height: '100%', width: '100%'}}><g id='root'></g></svg>
            </div>
          </Col>
          <Col span={4}>
            <div>
              <div><b>Correlation</b></div><br/>
              <div>Pearson: {pearson}</div>
              <div>Spearman: {spearman}</div><br/>
              <div>{explanation}</div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ScatterPlot;