import React, { useState, useEffect } from 'react';
import './App.css';
import { Layout, Row, Col, Card } from 'antd';
import * as d3 from 'd3';
import natCounties from './assets/NAT_counties.csv';
import natStates from './assets/NAT_states.csv';
import Feature from './feature/Feature';
import Time from './time/Time';
import Map from './map/Map';
import ParallelCoordinates from './parallel-coordinates/ParallelCoordinates';
import ScatterPlot from './scatter-plot/ScatterPlot';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import TutorialModalComponent from './modals/TutorialModalComponent'
import Heatmap from './heatmap/Heatmap';
import { cleanDataset  } from './helper';

/**
 * Geojson data
 */
import natGeojson from './assets/NAT.geojson';
import statesGeojson from './assets/states_choropleth.geojson';
import statesHexbinGeojson from './assets/states_hexbin.geojson';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      countyDataset: [],
      stateDataset: [],
      feature: 'HR',
      year: 60,
      state: '',
      openModal: true
    };

    this.features = [
      { key: 'HR', feature: 'Homicide rate' },
      { key: 'UE', feature: 'Unemployment rate' },
      { key: 'DV', feature: 'Divorce rate' },
      { key: 'MA', feature: 'Median age' },
      { key: 'DNL', feature: 'Population density' },
      { key: 'MFIL', feature: 'Median family income' },
      { key: 'FP', feature: 'Percentage of families below poverty' },
      { key: 'BLK', feature: 'Percentage of black population' },
      { key: 'GI', feature: 'Gini index' },
      { key: 'FH', feature: 'Percentage of female headed households' }
    ];
    this.years = [60, 70, 80, 90];

    this.selectFeature = this.selectFeature.bind(this);
    this.selectRegion = this.selectRegion.bind(this);

    this.statesHexbinDataset = [];
  }

  ////////////////////////////////////////////////////
  onClickButton = e => {
    e.preventDefault()
    this.setState({ openModal: true })
  }

  onCloseModal = () => {
    this.setState({ openModal: false })
  }

  selectFeature(e) {
    e.preventDefault();
    this.setState({ feature: e.currentTarget.accessKey });
  }

  selectTime = (year) => {
    this.setState({ year: year });
  };

  selectRegion(state, county) {
    this.setState({ state: state, county: county })
  }

  componentDidMount() {
  }

  fetchData() {

    Promise.all([d3.csv(natCounties), d3.csv(natStates), d3.json(statesHexbinGeojson)]).then(data => {
      this.setState({countyDataset: cleanDataset(data[0], this.years), stateDataset: cleanDataset(data[1], this.years)});
      this.statesHexbinDataset = data[2].features;
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
    const secondRowHeight = 1080 - firstRowHeight - 30 - 12;
    //console.log(this.state)
    return (

      <div className="App">

        <Layout className="layout">
          <Row gutter={[6, 6]}>
            <Col span={24}>
              <Row gutter={6}>
                <Col span={4} >
                  <Card style={{ height: firstRowHeight }}>

                    <div className="tuto-modal">
                      <button onClick={this.onClickButton}>Need Help?</button>
                      <Modal open={this.state.openModal} onClose={this.onCloseModal}>
                        <TutorialModalComponent />
                      </Modal>
                    </div>

                    <Feature
                      countyDataset={this.state.countyDataset}
                      featureList={this.features}
                      years={this.years}
                      currentFeature={this.state.feature}
                      currentYear={this.state.year}
                      onSelectFeature={this.selectFeature}
                    />
                  </Card>
                </Col>
                <Col span={14} >
                  <Card style={{ height: firstRowHeight }}>
                    <Time
                      timeline={this.years}
                      onSelectTime={this.selectTime}
                    />
                    <Map
                      stateGeojson={statesGeojson}
                      stateDataset={this.state.stateDataset}
                      countyGeojson={natGeojson}
                      currentFeature={this.state.feature}
                      currentYear={this.state.year}
                      years={this.years}
                      onSelectRegion={this.selectRegion}
                      //tooltip={this.tooltip}
                      featureList={this.features}
                      stateHexbin={this.statesHexbinDataset}
                    />
                  </Card>
                </Col>
                <Col span={6} >
                  <Card style={{ height: firstRowHeight }}>
                    <Heatmap
                      featureList={this.features}
                      years={this.years}
                      countyCSV={this.state.countyDataset}
                      currentState={this.state.state}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row gutter={6}>
                <Col span={14} >
                  <Card style={{ height: secondRowHeight }}>
                    <ParallelCoordinates
                      featureList={this.features}
                      stateCSV={this.state.stateDataset}
                      countyCSV={this.state.countyDataset}
                      currentYear={this.state.year}
                      currentState={this.state.state}
                    />
                  </Card>
                </Col>
                <Col span={10} >
                  <Card style={{ height: secondRowHeight }}>
                    <ScatterPlot
                      featureList={this.features}
                      stateCSV={this.state.stateDataset}
                      countyCSV={this.state.countyDataset}
                      currentState={this.state.state}
                      currentFeature={this.state.feature}
                      currentYear={this.state.year}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Layout>
      </div>
    );
  }
}

export default App;
