import React from 'react';
import * as d3 from 'd3';
import { getColorScale, getExtrema, showMap, hideMap, getTooltipText, showStateLegend, hideStateLegend, showSVG, hideSVG} from './helper';
import { Segmented, Row, Col, Button } from 'antd';
import d3legend from 'd3-svg-legend';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      property: this.props.currentFeature + this.props.currentYear,
      showState: true,
      x: 0,
      y: 0,
      zoomScale: 1,
      map: 'CHOROPLETH',
      region: ''
    }

    // geojson data
    this.stateGeojson = [];
    this.countyGeojson = [];

    this.canvasRef = React.createRef();
    this.ZOOM_SCALE_THRESHOLD = 2;

    // map id
    this.STATE_ID = 'g-state';
    this.COUNTY_ID = 'g-county';

    // number of colors for the color scale
    this.STATE_COLORS = 7;
    this.COUNTY_COLORS = 7;

    this.zoom = Object;

    this.featureList = {};


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


  /**
   * Switch between CHOROPLETH and HEXBIN
   * @param {string} type 
   */
  toggleMapType = (type) => {
    this.setState({map: type}, () => this.drawMap());
  }


  /**
   * Increase zoom scale when the button + is clicked
   */
  increaseZoomScale = () => {
    this.zoomTransition(d3.select('#map'), 1.2);  
  }

  /**
   * Decrease zoom scale when the button - is clicked
   */
  decreaseZoomScale = () => {
    this.zoomTransition(d3.select('#map'), 0.8);
  }

  zoomTransition(svg, zoomLevel) {
    svg.transition()
      .delay(100)
      .duration(500)
      .call(this.zoom.scaleBy, zoomLevel);
  }


  /**
   * Reset region to empty string when the button "Reset selected region" is clicked
   */
  resetSelectedRegion = () => {
    this.setState({region: ''}, () => this.props.onSelectRegion('', ''));
  }


  drawMap() {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;

    const countyExtrema = getExtrema(this.props.currentFeature, this.props.years, this.countyGeojson);
    const stateExtrema = getExtrema(this.props.currentFeature, this.props.years, this.stateGeojson);
    
    const stateColorScale = getColorScale(stateExtrema, this.STATE_COLORS);
    const countyColorScale = getColorScale(countyExtrema, this.COUNTY_COLORS);

    this.clearSVG();

    const svg = d3.select(this.canvasRef.current).select('svg#map');

    var projection = null;

    // draw map
    switch(this.state.map) {
      case 'CHOROPLETH':
        projection = d3.geoAlbersUsa()
          .scale(scrollWidth / 1.2)
          .translate([scrollWidth / 2, scrollHeight / 2]);
        this.drawChoroplethStates(svg, projection, stateColorScale);
        this.drawChoroplethCounties(svg, projection, countyColorScale);
        break;

      case 'HEXBIN':
        projection = d3.geoMercator()
          .scale(scrollWidth / 1.9)
          .translate([scrollWidth * 1.4, scrollHeight * 1.2]);
        this.drawHexbinStates(svg, projection, stateColorScale);
        break;
      
      default:
        break;
    }

    this.drawLegend(stateColorScale, countyColorScale);

    if (this.state.showState) {
      // hide map and legend for counties
      hideSVG(`#${this.COUNTY_ID}`);
    } else {
      // hide map and legend for states
      hideSVG(`#${this.STATE_ID}`);

      if (this.state.map === 'HEXBIN') {
        d3.selectAll('.hexbin').style('visibility', 'visible');
      }
    }

    // zoom function
    const zoomed = event => {
      const {transform} = event;
      d3.select(this.canvasRef.current).select('svg#map').selectAll('g').attr('transform', transform);
      d3.select(this.canvasRef.current).select('svg#map').selectAll('g').attr('stroke-width', 1 / transform.k);
      this.setState({x: transform.x, y: transform.y, zoomScale: transform.k}, this.updateZoomedView(this.state.zoomScale));
    };

    this.zoom = d3.zoom()
      .scaleExtent([1, 4])
      .on("zoom", zoomed);
    
    svg.call(this.zoom)
      .transition()
      .call(this.zoom.transform, d3.zoomIdentity.translate(this.state.x,this.state.y).scale(this.state.zoomScale));
  }

  /**
   * Draw legend for both states and counties
   * @param {function} stateColorScale 
   * @param {function} countyColorScale 
   */
  drawLegend(stateColorScale, countyColorScale) {
    
    var legend = null;

    // draw legend for states
    legend = d3legend.legendColor()
      .shapeWidth(30)
      .orient('vertical')
      .scale(stateColorScale);
    d3.select('#map-legend').append('g').attr('id', this.STATE_ID).call(legend);

    // draw legend for counties
    legend = d3legend.legendColor()
    .shapeWidth(30)
    .orient('vertical')
    .scale(countyColorScale);
    d3.select('#map-legend').append('g').attr('id', this.COUNTY_ID).call(legend);
  }


  /**
   * Draw choropleth map for states
   * @param {*} svg 
   * @param {*} projection 
   * @param {*} colorScale 
   */
  drawChoroplethStates(svg, projection, colorScale) {
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('id', this.STATE_ID)
      .selectAll('path')
      .data(this.stateGeojson)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties[this.state.property]))
      .style('stroke', '#000')
      .on('click', (event, d) => {
        this.props.onSelectRegion(d.properties.STATE_NAME, '');
        this.setState({region: d.properties.STATE_NAME});
      })
      .on('mouseover', (event, d) => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(this.getTooltipText(
            d.properties.STATE_NAME,
            this.props.currentFeature,
            d.properties[this.state.property],
            this.props.currentYear))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden')
      });
  }

  /**
   * Draw choropleth map for counties
   * @param {*} svg 
   * @param {*} projection 
   * @param {*} colorScale 
   */
  drawChoroplethCounties(svg, projection, colorScale) {
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('id', this.COUNTY_ID)
      .selectAll('path')
      .data(this.countyGeojson)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties[this.state.property]))
      .style('stroke', '#000')
      .on('click', (event, d) => {
        this.props.onSelectRegion(d.properties.STATE_NAME, d.properties.NAME);
        this.setState({region: d.properties.NAME + ', ' + d.properties.STATE_NAME});
      })
      .on('mouseover', (event, d) => {
        this.tooltip.style('visibility', 'visible');
        this.tooltip.html(this.getTooltipText(d.properties.NAME + ', ' + d.properties.STATE_NAME,
            this.props.currentFeature,
            d.properties[this.state.property],
            this.props.currentYear))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        this.tooltip.style('visibility', 'hidden')
      });
  }

  /**
   * Draw hexbin map for states
   * @param {*} svg 
   * @param {*} projection 
   * @param {*} colorScale 
   */
  drawHexbinStates(svg, projection, colorScale) {
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('id', this.STATE_ID)
      .attr('class', 'hexbin')
      .selectAll('path')
      .data(this.props.stateHexbin)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties[this.state.property]))
      .style('stroke', '#000')
      .on('click', (event, d) => {
        this.props.onSelectRegion(d.properties.STATE_NAME, '');
        this.setState({region: d.properties.STATE_NAME});
      })
      .on('mouseover', (event, d) => {
        this.tooltip
          .style('visibility', 'visible');
        this.tooltip.html(this.getTooltipText(d.properties.STATE_NAME,
            this.props.currentFeature, d.properties[this.state.property],
            this.props.currentYear))
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden')
      });

      svg.append('g')
        .selectAll('labels')
        .data(this.props.stateHexbin)
        .join('text')
        .attr('x', d => path.centroid(d)[0])
        .attr('y', d => path.centroid(d)[1])
        .text(d => d.properties.iso3166_2)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
      
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
        hideSVG(`#${this.STATE_ID}`)
        showSVG(`#${this.COUNTY_ID}`)
        if (this.state.map === 'HEXBIN') {
          d3.selectAll('.hexbin').style('visibility', 'visible');
        }
      });
    } else if (zoomScale <= this.ZOOM_SCALE_THRESHOLD && this.state.showState === false) {
      // change to state view
      this.setState({showState: true}, () => {
        hideSVG(`#${this.COUNTY_ID}`)
        showSVG(`#${this.STATE_ID}`)
      });
    }
  }

  getTooltipText(region, feature, value, year) {
    const roundedValue = value.toFixed(2);
    const html =
    `<div>
      <p><b>${region}<b></p>
      <p><b>${this.featureList[feature]}: </b>${roundedValue}<p>
      <p><b>Year: </b>19${year}</p>
    </div>`
    return html;
  }


  /**
   * Remove map and legend
   */
  clearSVG() {
    d3.select(this.canvasRef.current).select('svg#map').selectAll('*').remove();
    d3.select('#map-legend').selectAll('*').remove();
  }


  componentDidMount() {
    this.props.featureList.forEach(element => {
      this.featureList[element.key] = element.feature;
    });

    Promise.all([d3.json(this.props.stateGeojson), d3.json(this.props.countyGeojson)]).then(data => {
      this.stateGeojson = data[0].features;
      this.countyGeojson = data[1].features;
      this.us = data[0];
      this.drawMap();
    }).catch(err => console.log("error", err));
  
  }

  componentDidUpdate(prevProps, prevState) {
    const property = this.props.currentFeature + this.props.currentYear;
    if (prevState.property !== property) {
      this.setState({property: property});
      //d3.select('svg#legend').selectAll('*').remove();
      this.drawMap();
    }
  }

  render() {
    const selectedRegion = (this.state.region === '') ? 'None' : this.state.region;
    return (
      <div style={{height: '100%'}}>
        <Row gutter={20} style={{height: '100%'}}>
          <Col span={5}>
            <Segmented options={['CHOROPLETH', 'HEXBIN']} value={this.state.map} onChange={this.toggleMapType} style={{margin: '30px 0'}} />
            <div><svg id='map-legend'></svg></div>
            <div style={{margin: '50px 0'}}>
              <Button onClick={this.increaseZoomScale} style={{display: 'block', width: '40px'}}>+</Button>
              <Button onClick={this.decreaseZoomScale} style={{display: 'block', width: '40px'}}>-</Button>
            </div>
            <div>
              Selected region: {selectedRegion}
            </div>
            <Button onClick={this.resetSelectedRegion}>Reset selected region</Button>
          </Col>
          <Col span={19}>
            <div style={{height: '100%', width: '100%'}} ref={this.canvasRef}>
              <svg id='map' style={{width: '100%', height: '95%'}}></svg>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Map;