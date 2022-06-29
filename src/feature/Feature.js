import { Avatar, Divider, List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';
import * as d3 from 'd3';
import './Feature.css';
import { reduce, schemeBlues, tickStep } from 'd3';
import { isContentEditable } from '@testing-library/user-event/dist/utils';
import { getAverage } from './Helper';
import { getStd } from './Helper';


class Feature extends React.Component {
  constructor(props) {
    super(props);
  }

drawHisto(data){
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 40},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#histo")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  // get the data
  d3.csv("NAT_states.csv", function(data) {

  // X axis: scale and draw:
  var x = d3.scaleLinear()
    .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.bin()
    .value(function(d) { return d.price; })   // I need to give the vector of value
    .domain(x.domain())  // then the domain of the graphic
    .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
    .range([height, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
    .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
      .attr("height", function(d) { return height - y(d.length); })
      .style("fill", "#69b3a2")

  });
}

  /*getStats(data) {
    var cleanedData = []
      this.props.featureList.forEach(feature => {
          this.props.years.forEach(year => {
              let avg = getAverage(data, feature.key, year);
              
              cleanedData.push({value: avg });
          })
      });
  }
  */


  render() {
    const features = this.props.featureList;

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
                <div id="histo">[Statistical Measures]</div>

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