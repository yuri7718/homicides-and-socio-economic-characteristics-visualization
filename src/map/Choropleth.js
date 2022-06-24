import React from 'react';
import * as d3 from 'd3';
import { getColorScale, getExtrema, showMap, hideMap, getTooltipText, showStateLegend, hideStateLegend } from './helper';
import { Segmented, Row, Col, Button } from 'antd';
import d3legend from 'd3-svg-legend';
import { toHaveDescription } from '@testing-library/jest-dom/dist/matchers';
import { color } from 'd3';

class Choropleth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      property: this.props.currentFeature + this.props.currentYear,
      showState: true,
      x: 0,
      y: 0,
      zoomScale: 1,
      map: 'CHOROPLETH'
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
    this.STATE_COLORS = 7;
    this.COUNTY_COLORS = 3;

    this.zoom = Object;
  }

  toggleMapType = (value) => {
    //event.preventDefault();
    //console.log(value)
    this.setState({map: value});
  }

  increaseZoomScale = () => {
    this.zoomTransition(d3.select('#map'), 1.2);  
  }

  decreaseZoomScale = () => {
    this.zoomTransition(d3.select('#map'), 0.8);
  }

  zoomTransition(svg, zoomLevel) {
    svg.transition()
      .delay(100)
      .duration(700)
      .call(this.zoom.scaleBy, zoomLevel);
  }



  drawMap() {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const projection = d3.geoAlbersUsa()
      .scale(scrollWidth / 1.2)
      .translate([scrollWidth / 2, scrollHeight / 2]);
    
    const path = d3.geoPath()
      .projection(projection);

    const featureExtrema = getExtrema(this.props.currentFeature, this.props.years, this.countyGeojson);
    const stateColorScale = getColorScale(featureExtrema, this.STATE_COLORS);
    const countyColorScale = getColorScale(featureExtrema, this.COUNTY_COLORS);

    d3.selectAll('#' + this.STATE_MAP_ID).remove();
    d3.selectAll('#' + this.COUNTY_MAP_ID).remove();
    const svg = d3.select(this.canvasRef.current).select('#map');

    this.drawStates(svg, stateColorScale, path);
    this.drawCounties(svg, countyColorScale, path);
    this.drawStateLegend(stateColorScale);
    this.drawCountyLegend(countyColorScale);
    console.log('show states', this.state.showState);
    if (this.state.showState) {
      hideMap('#' + this.COUNTY_MAP_ID);
    }

    // zoom function
    const zoomed = event => {
      const {transform} = event;
      d3.select('#map').selectAll('g').attr('transform', transform);
      d3.select('#map').selectAll('g').attr('stroke-width', 1 / transform.k);
      this.setState({x: transform.x, y: transform.y, zoomScale: transform.k}, this.updateZoomedView(this.state.zoomScale));
    };

    this.zoom = d3.zoom()
      .scaleExtent([1, 4])
      .on("zoom", zoomed);
    
    svg.call(this.zoom)
      .transition()
      .call(this.zoom.transform, d3.zoomIdentity.translate(this.state.x,this.state.y).scale(this.state.zoomScale));


  }

  drawStateLegend(colorScale) {
    const legend = d3legend.legendColor()
      .shapeWidth(30)
      .orient('vertical')
      .scale(colorScale);
    d3.select('#legend').append('g').attr('id', this.STATE_MAP_ID).call(legend);
  }

  drawCountyLegend(colorScale) {
    const legend = d3legend.legendColor()
      .shapeWidth(30)
      .orient('vertical')
      .scale(colorScale);
    d3.select('#legend').append('g').attr('id', this.COUNTY_MAP_ID).call(legend);
  }

  drawStates(svg, colorScale, path) {
    
    svg.append('g')
      .attr('id', this.STATE_MAP_ID)
      .selectAll('path')
      .data(this.stateGeojson)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties[this.state.property]))
      .style('stroke', '#000')
      .on('click', (event, d) => this.props.onSelectRegion(d.properties.STATE_NAME, ''))
      .on('mouseover', (event, d) => {
        this.props.tooltip
          .style('visibility', 'visible');
        this.props.tooltip.html(getTooltipText(d.properties.STATE_NAME,
            this.props.currentFeature, d.properties[this.state.property],
            this.props.currentYear))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        this.props.tooltip.style('visibility', 'hidden')
      });
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
      .on('click', (event, d) => this.props.onSelectRegion(d.properties.STATE_NAME, d.properties.NAME))
      .on('mouseover', (event, d) => {
        this.props.tooltip
          .style('visibility', 'visible');
        this.props.tooltip.html(getTooltipText(d.properties.NAME + ' ' + d.properties.STATE_NAME,
            this.props.currentFeature,
            d.properties[this.state.property],
            this.props.currentYear))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        this.props.tooltip.style('visibility', 'hidden')
      });

   
  }

  /**
   * Toogle the visibility of #map-county based on zoom scale
   * 
   * @param {number} zoomScale The scale factor
   */
  updateZoomedView(zoomScale) {
    if (zoomScale > this.ZOOM_SCALE_THRESHOLD && this.state.showState === true) {
      // change to county view
      this.setState({showState: false}, () => {
        showMap('#' + this.COUNTY_MAP_ID);
        hideStateLegend(d3.select('#legend').select('#' + this.STATE_MAP_ID));
      });
    } else if (zoomScale <= this.ZOOM_SCALE_THRESHOLD && this.state.showState === false) {
      // change to state view
      this.setState({showState: true}, () => {
        hideMap('#' + this.COUNTY_MAP_ID);
        showStateLegend(d3.select('#legend').select('#' + this.STATE_MAP_ID))
      });
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
    console.log(this.state.map)
    const property = this.props.currentFeature + this.props.currentYear;
    if (prevState.property !== property) {
      this.setState({property: property});
      this.drawMap();
    }
  }

  render() {
    return (
      <div style={{height: '100%'}}>
        <Row gutter={[16, 16]} style={{height: '100%'}}>
          <Col span={4}>
            <Segmented options={['CHOROPLETH', 'HEXBIN']} value={this.state.map} onChange={this.toggleMapType} />
            <div>
              <svg id='legend'><g></g></svg>
            </div>
            <div>
              <Button onClick={this.increaseZoomScale}>+</Button>
              <Button onClick={this.decreaseZoomScale}>-</Button>
            </div>
          </Col>
          <Col span={20}>
          <div style={{height: '100%', width: '100%'}} ref={this.canvasRef}>
            <svg id='map' style={{width: '100%', height: '100%'}}><g id='root'></g></svg>
          </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Choropleth;