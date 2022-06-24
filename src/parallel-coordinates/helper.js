import * as d3 from 'd3';

/**
 * 
 * @param {*} data 
 * @param {*} features 
 * @param {*} bottom 
 * @param {*} top 
 * @returns 
 */
export function getYScales(data, features, bottom, top) {
  
  let a = data.map(d => Number(d['HR60']));
  console.log(a)
  const scales = {};

  features.forEach(feature => {
    //console.log(data.map(d => d[feature]));
    scales[feature] = d3.scaleLinear()
      .domain(d3.extent(data, item => Number(item[feature])))
      .range([bottom, top]);
  });

  return scales;
}

export function getStateData(data, year) {
  
}