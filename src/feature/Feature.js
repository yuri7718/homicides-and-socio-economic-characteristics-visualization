import { Avatar, Divider, List, Skeleton, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';
import * as d3 from 'd3';
import './Feature.css';
import { reduce, schemeBlues, tickStep } from 'd3';
import { isContentEditable } from '@testing-library/user-event/dist/utils';
import { xScale, yScale, getAverage, getStd } from './Helper';


class Feature extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.featureList = {};
    this.features = this.props.featureList;
  }

  drawHisto(data) {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const margin = {top: 30, right: 30, bottom: 50, left: 70};
    const width = scrollWidth - margin.left - margin.right;
    const height = scrollHeight - margin.top - margin.bottom;

    const svg = d3.select(this.canvasRef.current).select('svg')
      .attr('width', scrollWidth)
      .attr('height', scrollHeight);
    const rootGroup = svg.select('g#root')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    if (this.props.currentState !== '') {
      data = data.filter(d => d.STATE_NAME === this.props.currentState);
    }

    const x = xScale(data, this.props.currentYear, 0, width);
    const y = yScale(data, this.props.currentFeature, this.props.currentYear, height, 0);

    rootGroup.append('g')
      .attr('transform', `translate(0, ${height} )`)
      .call(d3.axisBottom(x))

    const histogram = d3.bin()
      .value(d => y(Number(d[this.props.currentFeature])))
      .domain(x.domain()) 
      .thresholds(x.ticks(70));

    const bins = histogram(data)

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", 1)

  }

  clearChart() {
    d3.select(this.canvasRef.current).select('#root').selectAll('*').remove();
  }

  render() {
    const features = this.props.featureList;

    if (this.props.stateCSV.length > 0 && this.props.countyCSV.length > 0) {

      if (this.props.currentState === '') {
        this.clearChart();
        this.drawHisto(this.props.stateCSV);
      } else {
        this.clearChart();
        this.drawHisto(this.props.countyCSV);
      }
    }

    return (
      <div>
        <h3>Features</h3>
        <div
          id="scrollableDiv"
          style={{
            height: 400,
            overflow: 'auto',
            padding: '0 16px',
            border: '1px solid rgba(140, 140, 140, 0.35)',
          }}
        >
        <InfiniteScroll
          dataLength={features.length}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={features}
            renderItem={(item) => (
              <List.Item
                key={item.key}
                accessKey={item.key}
                onClick={this.props.onSelectFeature}
                style={{background: this.props.currentFeature===item.key ? '#7b88b8' : 'white'}}
              >
                <List.Item.Meta title={item.feature} />
                <div ref={this.canvasRef}>
                  [Statistical Measures]
                  <svg style={{height: '100%', width: '100%'}}><g id='root'></g></svg>
                </div>

              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
    );
  }
}

export default Feature;