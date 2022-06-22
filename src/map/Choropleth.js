import React from 'react';
import * as d3 from 'd3';
import { color, svg } from 'd3';
import { toHaveDisplayValue } from '@testing-library/jest-dom/dist/matchers';
//import { event as currentEvent } from 'd3';

class Choropleth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      property: this.props.currentFeature + this.props.currentYear,
      showState: true,
      x: 0,
      y: 0,
      zoomScale: 1
    }

    this.canvasRef = React.createRef();
    this.ZOOM_SCALE_THRESHOLD = 4;

    this.stateGeojson = [];
    this.countyGeojson = [];
  }

  drawMap() {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const projection = d3.geoAlbersUsa()
      .scale(scrollWidth / 1.2)
      .translate([scrollWidth / 2 , scrollHeight / 2]);
    
    const path = d3.geoPath()
      .projection(projection);

    const colorScale = this.getColorScale();
    const property = this.props.currentFeature + this.props.currentYear;
    
    d3.selectAll('g').remove();

    // draw map
    if (this.state.showState) {
      d3.select('svg')
        .append('g')
        .selectAll('path')
        .data(this.stateGeojson)
        .enter()
        .append('path')
        .attr('fill', d => {
          const filteredFeature = this.props.stateDataset.filter(x => x.STATE_NAME === d.properties.STATE_NAME);
          if (filteredFeature.length > 0) {
            return colorScale(filteredFeature[0][property]);
          }
        })
        .attr('d', path)
        .style("stroke", "#000000")
        //.style('fill', 'none')
        .on('click', (e, d) => this.props.onSelectRegion(d.properties.STATE_NAME, ''));
    } else {
      d3.select('svg')
        .append('g')
        .selectAll('path')
        .data(this.countyGeojson)
        .enter()
        .append('path')
        .attr('fill', d => colorScale(d.properties[property]))
        .attr('d', path)
        .style("stroke", "#000000")
        .on('click', (e, d) => this.props.onSelectRegion(d.properties.STATE_NAME, ''));
    }

    // zoom function
    const zoomed = event => {
      const {transform} = event;
      d3.selectAll('g').attr("transform", transform);
      d3.selectAll('g').attr("stroke-width", 1 / transform.k);
      this.updateZoomedView(transform);
      this.setState({x: transform.x, y: transform.y, zoomScale: transform.k})
    };


    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);
    

    d3.select('svg')
      .call(zoom)
      .transition()
      .call(zoom.transform, d3.zoomIdentity.translate(this.state.x,this.state.y).scale(this.state.zoomScale));
    
  }

  /**
   * Return color scale based on state/county, selected feature, and selected year
   */
  getColorScale() {
    const property = this.props.currentFeature + this.props.currentYear;
    const features = this.state.showState ?
      this.props.stateDataset.map(d => d[property]) : this.countyGeojson.map(d => d.properties[property]);

    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(features))
      .range(d3.schemeBlues[9]);
    
    return colorScale;
  }

  updateZoomedView(transform) {
    
    if (transform.k > this.ZOOM_SCALE_THRESHOLD && this.state.showState === true) {
      // change to county view
      this.setState({showState: false}, () => this.drawMap());
    } else if (transform.k <= this.ZOOM_SCALE_THRESHOLD && this.state.showState === false ) {
      this.setState({showState: true}, () => this.drawMap());
    }
  }

  componentDidMount() {
    
    Promise.all([d3.json(this.props.stateGeojson), d3.json(this.props.countyGeojson)]).then(data => {
      this.stateGeojson = data[0].features;
      this.countyGeojson = data[1].features;

      this.drawMap();
    })
    .catch((err) => console.log("err", err));
  
  }

  componentDidUpdate(prevProps, prevState) {
    
    const property = this.props.currentFeature + this.props.currentYear
    if (prevState.property !== property) {
      this.setState({property: property});
      this.drawMap()
    }
  }

  render() {
    return (
      <div style={{height: '100%'}} ref={this.canvasRef}>
        <svg style={{width: '100%', height: '100%'}}></svg>
      </div>
    );
  }
}

export default Choropleth;