import React from 'react';
import * as d3 from 'd3';
import { getColorScale, getExtrema, showMap, hideMap } from './helper';
import natCountiesB from '../assets/NAT_bis.csv';

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
        this.marks = this.props.timeline.reduce((marksDict, year) => {
            marksDict[year] = '19' + year;
            return marksDict;
        }, {});
    }




    drawHeatMap() {
        console.log('test de Nat_bis = \n ', this.countyGeojson)
        
        const { scrollWidth, scrollHeight } = this.canvasRef.current;
        const margins = { top: 30, right: 30, bottom: 30, left: 30 };
        const width = scrollWidth - margins.left - margins.right;
        const height = scrollHeight - margins.top - margins.bottom;


        const featureNames = this.features.map(d => {
            return d.feature + ' (' + d.key + ')';
        });

        // console.log(" ----> featureNames = \n", featureNames)
        const yScale = d3.scalePoint()
            .domain(featureNames.sort())
            .range([height, 0])
        
        const xScale = d3.scaleLinear()
            .domain([this.marks[60], this.marks[90]])
            .range([0, width])
            


        //Setting chart width and adjusting for margins
        const svg = d3.select('#heat-map')
            .attr('width', scrollWidth)
            .attr('height', scrollHeight)
            .append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top})`)
        
        

        ////////////////////////////////////////////////

        //Append x axis
        svg.append('g')
            .call(d3.axisBottom(xScale).ticks(4))
            .attr('transform', `translate(0, ${height})`) 

        //Append y axis
        svg.append('g')
            .call(d3.axisRight(yScale))
            .attr('transform', `translate(${width}, 0)`)
            
    }


 

    drawCounties(svg, colorScale) {
        // console.log(" ----> colorScale = ", colorScale)
        
        svg.append('g')
            .attr('id', this.COUNTY_MAP_ID)
            .append('rect')
            .data(this.countyGeojson)
            .enter()
            .attr('fill', d => colorScale(d.properties[this.state.property]))
            .style('stroke', '#000')
    
    }

    componentDidMount() {
/*
        Promise.all([d3.csv(natCountiesB)]).then(data => {
            this.countyGeojson = data;           
            // this.setState({ countyDataset: data[0], stateDataset: data[1] });
        });
        */
        
        this.props.featureList.forEach(element => {
            this.featureList[element.key] = element.feature;
            console.log(" ----> this.featureList[element.key] = \n", this.featureList[element.key])
        });

        Promise.all([d3.json(this.props.stateGeojson), d3.json(this.props.countyGeojson)]).then(data => {
            this.stateGeojson = data[0].features;
            this.countyGeojson = data[1].features;
            // console.log(" ----> this.countyGeojson = \n", this.countyGeojson)
            this.drawHeatMap();
        }).catch(err => console.log("error", err));                      
    }

    render() {
        return (
            <div style={{ height: '100%' }} ref={this.canvasRef}>
                <svg id='heat-map' style={{ width: '100%', height: '100%' }}></svg>
            </div>
        );
    }
}

export default Heatmap;
