import React, { useState, useEffect } from 'react';
import './App.css';
import { Layout, Row, Col, Card } from 'antd';
import * as d3 from 'd3';
import natCounties from './assets/NAT_counties.csv';
import natStates from './assets/NAT_states.csv';
import Feature from './feature/Feature';
import Time from './time/Time';
import Choropleth from './map/Choropleth';
import natGeojson from './assets/NAT.geojson';
import statesGeojson from './assets/US_states.geojson';
import ParallelCoordinates from './parallel-coordinates/ParallelCoordinates';
import { createTooltip } from './tooltip';
import Heatmap from './map/Heatmap';

class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      countyDataset: [],
      stateDataset: [],
      feature: 'HR',
      year: 60,
      state: '',
      county: ''
    };

    this.features = [
      {key: 'HR', feature: 'Homicide rate'},
      {key: 'UE', feature: 'Unemployment rate'},
      {key: 'DV', feature: 'Divorce rate'},
      {key: 'MA', feature: 'Median age'},
      {key: 'DNL', feature: 'Population density'},
      {key: 'MFIL', feature: 'Median family income'},
      {key: 'FP', feature: 'Percentage of families below poverty'},
      {key: 'BLK', feature: 'Percentage of black population'},
      {key: 'GI', feature: 'Gini index'},
      {key: 'FH', feature: 'Percentage of female headed households'}
    ];
    this.years = [60, 70, 80, 90];

    this.selectFeature = this.selectFeature.bind(this);
    //this.selectTime = this.selectTime.bind(this);
    this.selectRegion = this.selectRegion.bind(this);

    this.tooltip = createTooltip();
  }

  selectFeature(e) {
    e.preventDefault();
    this.setState({feature: e.currentTarget.accessKey});
  }

  selectTime = (year) => {
    this.setState({year: year});
  };

  selectRegion(state, county) {
    this.setState({state: state, county: county})
  }

  componentDidMount() {
  }

  fetchData() {
    Promise.all([d3.csv(natCounties), d3.csv(natStates)]).then(data => {
      this.setState({countyDataset: data[0], stateDataset: data[1]});
    });
  }

  componentDidUpdate() {
    //console.log(this.state)
  }

  render() {
    if (this.state.countyDataset.length === 0 || this.state.stateDataset.length === 0) {
      this.fetchData();
    }
    const firstRowHeight = 700;
    const secondRowHeight = 500;
    //console.log(this.state)
    return (
      /*<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>*/
      
      <div className="App">
        <Layout className="layout">
          <Row gutter={[16, 16]}>
            <Col span={4} >
              <Card style={{height: firstRowHeight}}>
                <Feature
                  featureList={this.features}
                  currentFeature={this.state.feature}
                  onSelectFeature={this.selectFeature}
                />
              </Card>
            </Col>
            <Col span={10} >
              <Card style={{height: firstRowHeight}}>
                <Time
                  timeline={this.years}
                  onSelectTime={this.selectTime}
                />
                <Choropleth
                  stateGeojson={statesGeojson}
                  stateDataset={this.state.stateDataset}
                  countyGeojson={natGeojson}
                  currentFeature={this.state.feature}
                  currentYear={this.state.year}
                  years={this.years}
                  onSelectRegion={this.selectRegion}
                  tooltip={this.tooltip}
                  featureList={this.features}
                />
              </Card>
            </Col>
            <Col span={10} >
              <Card style={{ height: firstRowHeight }}>
                <Heatmap
                  timeline={this.years}
                  featureList={this.features}
                  stateGeojson={statesGeojson}
                  stateDataset={this.state.stateDataset}
                  countyGeojson={natGeojson}
                  currentFeature={this.state.feature}
                  currentYear={this.state.year}
                  years={this.years}
                  onSelectRegion={this.selectRegion}
                />
              </Card>
            </Col>
            <Col span={16} >
              <Card style={{height: secondRowHeight}}>
                <ParallelCoordinates
                  featureList={this.features}
                  stateCSV={this.state.stateDataset}
                  currentYear={this.state.year}
                  countyCSV={this.state.countyDataset}
                  currentState={this.state.state}
                />
              </Card>
            </Col>
            <Col span={8} >
              <Card style={{height: secondRowHeight}}>adfdf</Card>
            </Col>
          </Row>
        </Layout>
      </div>
    );
  }
}

export default App;
