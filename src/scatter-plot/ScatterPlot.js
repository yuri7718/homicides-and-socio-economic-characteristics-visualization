import React from 'react';
import * as d3 from 'd3';
import { Row, Col } from 'antd';
import { xScale, yScale } from './helper';

class ScatterPlot extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
  }

  drawScatterPlot(data) {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const margin = {top: 10, right: 30, bottom: 50, left: 50};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', scrollWidth)
      .attr('height', scrollHeight);
    const rootGroup = svg.select('g#root')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);


    const x = xScale(data, this.props.currentYear, margin.left, margin.left + width);
    const y = yScale(data, this.props.currentFeature, this.props.currentYear, margin.top + height, margin.top);

    rootGroup.append('g')
      .attr('transform', `translate(0, ${height + margin.top} )`)
      .call(d3.axisBottom(x))

    rootGroup.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    const xProperty = 'HR' + this.props.currentYear;
    const yProperty = this.props.currentFeature + this.props.currentYear;

    rootGroup.append('g')
      .selectAll('dot')
      .data(data)
      .join('circle')
      .attr('cx', d => x(Number(d[xProperty])))
      .attr('cy', d => y(Number(d[yProperty])))
      .attr('r', 1.5)
      .style('fill', '#69b3a2')
      
  }

  clearChart() {
    d3.select(this.canvasRef.current).select('g#root').selectAll('*').remove();
  }


  render() {
    if (this.props.stateCSV.length > 0 && this.props.countyCSV.length > 0) {
      this.clearChart();
      this.drawScatterPlot(this.props.stateCSV);
    }
    return (
      <div style={{height: '100%'}}>
        <Row style={{height: '100%'}}>
          <Col span={20}>
            <div style={{textAlign: 'center'}}>TITLE</div>
            <div style={{height: '100%'}} ref={this.canvasRef}>
              <svg>
                <g id='root'></g>
              </svg>
            </div>
          </Col>
          <Col span={4}>adfd</Col>
        </Row>
      </div>
    );
  }
}

export default ScatterPlot;