import { Avatar, Divider, List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import React from 'react';
import './Feature.css';
import { reduce, schemeBlues, tickStep } from 'd3';
import { isContentEditable } from '@testing-library/user-event/dist/utils';


class Feature extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    const features = this.props.featureList;

    return (
      <div>
        <h3>Features</h3>
        <div
          id="scrollableDiv"
          style={{
            height: 400,
            overflow: 'auto',
            padding: '0 16px',
            border: '1px solid rgba(140, 140, 140, 0.35)',
          }}
        >
        <InfiniteScroll
          dataLength={features.length}
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={features}
            renderItem={(item) => (
              <List.Item
                key={item.key}
                accessKey={item.key}
                onClick={this.props.onSelectFeature}
                style={{background: this.props.currentFeature===item.key ? '#7b88b8' : 'white'}}
              >
                <List.Item.Meta title={item.feature} />
                <div>[Statistical Measures]</div>
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
    );
  }
}

export default Feature;