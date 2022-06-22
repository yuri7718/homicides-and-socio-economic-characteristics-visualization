import React from 'react';
import * as d3 from 'd3';

class Choropleth extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.data = [];
  }

  drawMap(data) {
    const {scrollWidth, scrollHeight} = this.canvasRef.current;
    
    const projection = d3.geoAlbersUsa()
      .scale(scrollWidth / 1.2)
      .translate([scrollWidth / 2, scrollHeight / 2]);
    
    const path = d3.geoPath()
      .projection(projection);

    const property = this.props.currentFeature + this.props.currentYear;
    const features = data.map(d => d.properties[property]);
    
    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(features))
      .range(d3.schemeBlues[9]);

    const svg = d3.select('svg');

    // draw the map
    svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('fill', d => colorScale(d.properties[property]))
      .attr('d', path)
      .style("stroke", "#000000");
  }

  zoomed(e) {
    const {transform} = e;
    
  }

  componentDidMount() {
    
    Promise.all([d3.json(this.props.geojson)]).then(data => {
      this.data = data[0].features;
  
      let features = this.data.map(x => x.properties.HR60);
      this.drawMap(this.data);
    })
    .catch((err) => console.log("err", err));
  
  }

  componentDidUpdate() {
    this.drawMap(this.data);
    
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