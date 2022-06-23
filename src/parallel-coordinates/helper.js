import * as d3 from 'd3';

export function getScales(data, year, height) {
  const scales = {};
  
  const featureNames = Object.keys(data[0]).filter(key => key.slice(-2) == year);
  
  featureNames.forEach(featureName => {
    let features = data.map(d => d[featureName]);
    scales[featureName] = d3.scaleLinear()
      .domain(d3.extent(features))
      .range([height, 0]);
  });
  return scales;
}

export function getStateData(data, year) {
  
}