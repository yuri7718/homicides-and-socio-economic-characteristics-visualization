import React from 'react';
import * as d3 from 'd3';
//import { getColorScale, getExtrema, showMap, hideMap } from './helper';
import { getAverage, getTooltipText } from './helper';

class Heatmap extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef(); 

        // map data
        this.yearRange = [];
        this.stateGeojson = [];
        this.countyGeojson = [];

        // map id
        this.STATE_MAP_ID = 'h-state';
        this.COUNTY_MAP_ID = 'h-county';

        // number of colors for the color scale
        this.STATE_COLORS = 7;
        this.COUNTY_COLORS = 7;

        this.featureList = {};

        this.features = this.props.featureList;
        
        this.tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'black')
        .style('opacity', 0.7)
        .style('color', '#fff')
        .style('left', '0px')
        .style('top', '0px');
    }




    drawHeatMap(data) {
       
        const { scrollWidth, scrollHeight } = this.canvasRef.current;
        const margins = { top: 30, right: 30, bottom: 100, left: 200 };
        const width = scrollWidth - margins.left - margins.right;
        const height = scrollHeight - margins.top - margins.bottom;

        //console.log(this.props.countyCSV);
        //console.log(this.props.featureList)

        if (this.props.currentState !== '') {
            // a state is selected
            // filter counties that are in the state
            data = data.filter(d => d.STATE_NAME === this.props.currentState);
        }
        //console.log(data);
        var cleanedData = []
        this.props.featureList.forEach(feature => {
            this.props.years.forEach(year => {
                let avg = getAverage(data, feature.key, year);
                
                cleanedData.push({ feature: feature.feature, year: '19' + year, value: avg });
            })
        });

        const xScale = d3.scaleBand()
            .range([0, width])
            .domain(this.props.years.map(year => '19' + year));
        
        const yScale = d3.scaleBand()
            .range([0, height])
            .domain(this.props.featureList.map(feature => feature.feature))
            

        //Setting chart width and adjusting for margins
        const svg = d3.select(this.canvasRef.current).select('svg')
            .attr('width', scrollWidth)
            .attr('height', scrollHeight);

        const rootGroup = svg.select('g#root')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);
        

        
        //Append x axis
        rootGroup.append('g')
            .call(d3.axisBottom(xScale).ticks(4))
            .attr('transform', `translate(0, ${height})`) 

        //Append y axis
        const yAxis = rootGroup.append('g')
            .call(d3.axisLeft(yScale))
            //.attr('transform', `translate(${width}, 0)`)

        const dataPerFeature = {};
        cleanedData.forEach(d => {
            if (dataPerFeature.hasOwnProperty(d.feature)) {
                dataPerFeature[d.feature].push(d.value);
            } else {
                dataPerFeature[d.feature] = [d.value];
            }
        })
        
        const colorScales = {};
        for (let key in dataPerFeature) {
            colorScales[key] = d3.scaleLinear()
                .range(['#eff3ff', '#08519c'])
                .domain(d3.extent(dataPerFeature[key]));
        }
        /*
        const colorScale = d3.scaleLinear()
            .range(['#eff3ff', '#08519c'])
            .domain(d3.extent(cleanedData.map(d => d.value)));
        */
        const region = this.props.currentState;
        rootGroup.selectAll()
            .data(cleanedData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.feature))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .style('fill', d => colorScales[d.feature](d.value))
            .on('mouseover', (event, d) => {
                this.tooltip.style('visibility', 'visible');
                this.tooltip.html(getTooltipText(this.props.currentState, d))
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY + 10) + 'px');
              })
              .on('mouseout', () => {
                this.tooltip.style('visibility', 'hidden')
              });

        yAxis.selectAll('g').selectAll('text')
            .attr('font-weight', d => {
                return d === 'Homicide rate' ? 700 : 400
            }).attr('font-size', d => {
                return d === 'Homicide rate' ? '20px' : '10px'
            })
        
        
            
    }

    clearMap() {
        d3.select(this.canvasRef.current).select('#root').selectAll('*').remove();
    }
 
    /*
    drawCounties(svg, colorScale) {
        // console.log(" ----> colorScale = ", colorScale)
        
        svg.append('g')
            .attr('id', this.COUNTY_MAP_ID)
            .append('rect')
            .data(this.countyGeojson)
            .enter()
            .attr('fill', d => colorScale(d.properties[this.state.property]))
            .style('stroke', '#000')
    
    }*/

    componentDidMount() {
        
        this.props.featureList.forEach(element => {
            this.featureList[element.key] = element.feature;
        });
       
          
    }

    render() {
        if (this.props.countyCSV.length > 0) {
            this.clearMap();
            this.drawHeatMap(this.props.countyCSV);
        }
        const text = this.props.currentState === '' ? ('Socio-economic characteristics in the US') :
            'Socio-economic characteristics in ' + this.props.currentState;
        return (
            <div style={{ height: '100%' }} ref={this.canvasRef}>
                <div style={{textAlign: 'center'}}>{text}</div>
                <svg style={{ width: '100%', height: '100%' }}>
                    <g id='root'></g>
                </svg>
            </div>
        );
    }
}

export default Heatmap;