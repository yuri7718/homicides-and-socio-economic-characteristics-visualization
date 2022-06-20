import { Slider } from 'antd';
import React from 'react';
import './Time.css'

class Time extends React.Component {
  constructor(props) {
    super(props)
    this.marks = this.props.timeline.reduce((marksDict, year) => {
      marksDict[year] = '19' + year;
      return marksDict;
  }, {});
  }
  
  render() {
    return (
      <div id="timeline">
        <Slider marks={this.marks} step={null}
          defaultValue={60} min={60} max={90}
          onChange={this.props.onSelectTime}
        />
      </div>
    )
  }
};

export default Time;