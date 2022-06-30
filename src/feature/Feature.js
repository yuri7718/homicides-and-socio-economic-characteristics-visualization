import React from 'react';
import { List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import Statistics from 'statistics.js';
import * as d3 from 'd3';
import './Feature.css';

/**
 * Component for selecting feature
 */
class Feature extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }
  
  /**
   * Iterate through each feature and draw the histogram
   */
  drawHistogram() {

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
        .domain(d3.extent(this.props.countyDataset.map(d => d[property])))
        .range([0, width]);

      const histogram = d3.bin()
        .value(d => d[property])
        .domain(xScale.domain())
        .thresholds(xScale.ticks(30));

      const bins = histogram(this.props.countyDataset);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);
        
      // draw axes without ticks
      svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(xScale).tickValues([]))
      svg.append('g').call(d3.axisLeft(yScale).tickValues([]));
      
      // draw histogram
      svg.selectAll('rect')
        .data(bins)
        .join('rect')
        .attr('x', 1)
        .attr('transform', d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`)
        .attr('width', d => xScale(d.x1) - xScale(d.x0))
        .attr('height', d => height - yScale(d.length))
        .style('fill', '#69b3a2');
    });
  }

  /**
   * Remove all histograms
   */
  cleanHistogram() {
    this.props.featureList.forEach(feature => {
      d3.select(`#${feature.key}-histogram`).selectAll('*').remove();
    })
  }

  render() {
    if (this.props.countyDataset.length > 0) {
      
      // compute mean and std with Statistics
      const columns = {};
      this.props.featureList.forEach(feature => {
        this.props.years.forEach(year => {
          columns[feature.key + year] = 'interval';
        });
      });

      const stats = new Statistics(this.props.countyDataset, columns);

      this.props.featureList.forEach(feature => {
        let property = feature.key + this.props.currentYear;
        feature['mean'] = stats.arithmeticMean(property).toFixed(2);
        feature['std'] = stats.standardDeviation(property).toFixed(2);
      });

      this.cleanHistogram();
      this.drawHistogram();
    }

    return (
      <div>
        <h4 style={{textAlign: 'center'}}>Features and Distributions in 19{this.props.currentYear}</h4>
        <div
          id="scrollableDiv"
          style={{
            height: 550,
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
              renderItem={item => (
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
                  <div ref={this.canvasRef}><svg id={`${item.key}-histogram`} style={{width: 100, height: 100}}></svg></div>
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