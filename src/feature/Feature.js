import { Avatar, Divider, List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';
import './Feature.css';
import { reduce, scaleBand, schemeBlues, tickStep } from 'd3';
import { isContentEditable } from '@testing-library/user-event/dist/utils';
import Statistics from 'statistics.js';
import * as d3 from 'd3';

class Feature extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.columns = {};
  }
  
  drawHistogram() {
    //const { scrollWidth, scrollHeight } = this.canvasRef.current;

    this.props.featureList.forEach(feature => {
      let property = feature.key + this.props.currentYear;
      
      const margin = {top: 10, right: 10, bottom: 10, left: 10};
      const width = 70 - margin.left - margin.right;
      const height = 70 - margin.top - margin.bottom;
      
      const svg = d3.select(`#${feature.key}-histogram`)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      
      const xScale = d3.scaleLinear()
        .domain(d3.extent(this.props.countyDataset.map(d => Number(d[property]))))
        .range([0, width]);

      svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(xScale).tickValues([]))
      
      const histogram = d3.bin()
        .value(d => d[property])
        .domain(xScale.domain())
        .thresholds(xScale.ticks(30));

      const bins = histogram(this.props.countyDataset);

      const yScale = d3.scaleLinear()
        .range([height, 0]);

      yScale.domain([0, d3.max(bins, d => d.length)])
      svg.append('g').call(d3.axisLeft(yScale).tickValues([]));
      
      bins.forEach(d => {
        console.log(d)
      })
      svg.selectAll('rect')
        .data(bins)
        .join('rect')
        .attr('x', 1)
        .attr('transform', d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
        .attr('width', d => xScale(d.x1) - xScale(d.x0))
        .attr('height', d => height - yScale(d.length))
        .style('fill', '#69b3a2')
    })

  }

  render() {
    
    this.props.featureList.forEach(feature => {
      this.props.years.forEach(year => {
        this.columns[feature.key + year] = 'interval';
      });
    });
    
    if (this.props.countyDataset.length > 0) {
      var stats = new Statistics(this.props.countyDataset, this.columns);
      const features = this.props.featureList;

      features.forEach(feature => {
        let property = feature.key + this.props.currentYear;
        feature['mean'] = stats.arithmeticMean(property).toFixed(2);
        feature['std'] = stats.standardDeviation(property).toFixed(2);


        this.drawHistogram();
      });
      //let test = stats.arithmeticMean('HR60');
      console.log(features)
      return (
        <div>
          <h3>Features</h3>
          <div
            id="scrollableDiv"
            style={{
              height: 500,
              overflow: 'auto',
              border: '1px solid rgba(140, 140, 140, 0.35)'
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
                  style={{background: this.props.currentFeature===item.key ? '#7b88b8' : 'white', padding: '15px'}}
                >
                  <List.Item.Meta
                    title={item.feature}
                    description={'mean:' + item.mean + ' std:' + item.std}
                  />
                  <div><svg ref={this.canvasRef} id={`${item.key}-histogram`} style={{width: 100, height: 100}}></svg></div>
                </List.Item>
              )}
            />
          </InfiniteScroll>
        </div>
      </div>
      );
    } else {
      return (
        <div>
          <h3>Features</h3>
          <div
            id="scrollableDiv"
            style={{
              height: 500,
              overflow: 'auto',
              border: '1px solid rgba(140, 140, 140, 0.35)'
            }}
          >
          <InfiniteScroll
            dataLength={this.props.featureList.length}
            scrollableTarget="scrollableDiv"
          >
            <List
              dataSource={this.props.featureList}
              renderItem={(item) => (
                <List.Item
                  key={item.key}
                  accessKey={item.key}
                  onClick={this.props.onSelectFeature}
                  style={{background: this.props.currentFeature===item.key ? '#7b88b8' : 'white', padding: '15px'}}
                >
                  <List.Item.Meta
                    title={item.feature}
                    description={'mean:' + item.mean + ' std:' + item.std}
                  />
                  <div><svg ref={this.canvasRef} id={`${item.key}-histogram`} style={{width: 100, height: 100}}></svg></div>
                </List.Item>
              )}
            />
          </InfiniteScroll>
        </div>
      </div>
      );
    }

    /*
    return (
      <div>
        <h3>Features</h3>
        <div
          id="scrollableDiv"
          style={{
            height: 500,
            overflow: 'auto',
            border: '1px solid rgba(140, 140, 140, 0.35)'
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
                style={{background: this.props.currentFeature===item.key ? '#7b88b8' : 'white', padding: '15px'}}
              >
                <List.Item.Meta
                  title={item.feature}
                  description="mean, variance"
                />
                <div>[Distribution]</div>
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
    );*/
  }
}

export default Feature;