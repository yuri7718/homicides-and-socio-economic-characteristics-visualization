import React from 'react';
import * as d3 from 'd3';
import { getColorScale, getExtrema, showMap, hideMap } from './helper';

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

    // geojson data
    this.stateGeojson = [];
    this.countyGeojson = [];

    this.canvasRef = React.createRef();
    this.ZOOM_SCALE_THRESHOLD = 2;

    // map id
    this.STATE_MAP_ID = 'g-state';
    this.COUNTY_MAP_ID = 'g-county';

    // number of colors for the color scale
    this.STATE_COLORS = 11;
    this.COUNTY_COLORS = 11;
  }

  drawMap() {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const projection = d3.geoAlbersUsa()
      .scale(scrollWidth / 1.2)
      .translate([scrollWidth / 2 , scrollHeight / 2]);
    
    const path = d3.geoPath()
      .projection(projection);

    const featureExtrema = getExtrema(this.props.currentFeature, this.props.years, this.countyGeojson);
    const stateColorScale = getColorScale(featureExtrema, this.STATE_COLORS);
    const countyColorScale = getColorScale(featureExtrema, this.COUNTY_COLORS);

    d3.selectAll('g').remove();
    const svg = d3.select('svg');

    this.drawStates(svg, stateColorScale, path);
    this.drawCounties(svg, countyColorScale, path);
    
    if (this.state.showState) {
      hideMap('#' + this.COUNTY_MAP_ID);
    }

    // zoom function
    const zoomed = event => {
      const {transform} = event;
      d3.selectAll('g').attr('transform', transform);
      d3.selectAll('g').attr('stroke-width', 1 / transform.k);
      this.setState({x: transform.x, y: transform.y, zoomScale: transform.k}, this.updateZoomedView(this.state.zoomScale));
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 4])
      .on("zoom", zoomed);
    
    svg.call(zoom)
      .transition()
      .call(zoom.transform, d3.zoomIdentity.translate(this.state.x,this.state.y).scale(this.state.zoomScale));
  }

  drawStates(svg, colorScale, path) {
    svg.append('g')
      .attr('id', this.STATE_MAP_ID)
      .selectAll('path')
      .data(this.stateGeojson)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        // stateGeojson is not from the original datasets and only contains the polygons
        // we need to match it with the original dataset that contains the features
        const feature = this.props.stateDataset.find(state => state.STATE_NAME === d.properties.STATE_NAME);
        if (typeof feature !== 'undefined') {
          return colorScale(feature[this.state.property]);
        }
      })
      .style('stroke', '#000')
      .on('click', (event, d) => this.props.onSelectRegion(d.properties.STATE_NAME, ''));
  }

  drawCounties(svg, colorScale, path) {
    svg.append('g')
      .attr('id', this.COUNTY_MAP_ID)
      .selectAll('path')
      .data(this.countyGeojson)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties[this.state.property]))
      .style('stroke', '#000')
      .on('click', (event, d) => this.props.onSelectRegion(d.properties.STATE_NAME, d.properties.NAME));
  }

  /**
   * Toogle the visibility of #map-county based on zoom scale
   * 
   * @param {number} zoomScale The scale factor
   */
  updateZoomedView(zoomScale) {
    if (zoomScale > this.ZOOM_SCALE_THRESHOLD && this.state.showState === true) {
      // change to county view
      this.setState({showState: false}, () => showMap('#' + this.COUNTY_MAP_ID));
    } else if (zoomScale <= this.ZOOM_SCALE_THRESHOLD && this.state.showState === false) {
      this.setState({showState: true}, () => hideMap('#' + this.COUNTY_MAP_ID));
    }
  }

  componentDidMount() {
    
    Promise.all([d3.json(this.props.stateGeojson), d3.json(this.props.countyGeojson)]).then(data => {
      this.stateGeojson = data[0].features;
      this.countyGeojson = data[1].features;
      this.drawMap();
    }).catch(err => console.log("error", err));
  
  }

  componentDidUpdate(prevProps, prevState) {
    const property = this.props.currentFeature + this.props.currentYear;
    if (prevState.property !== property) {
      this.setState({property: property});
      this.drawMap();
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