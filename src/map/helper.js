import * as d3 from 'd3';


/**
 * Return a list of extrema for the selected feature over the 4 decades
 * @param {string} currentFeature
 * @param {number[]} years [60, 70, 80, 90]
 * @param {Object[]} dataGeojson
 * @returns {number[]} Corresponding extrema
 */
 export function getExtrema(currentFeature, years, dataGeojson) {

  // propertyArray is ['HR60', 'HR70', 'HR80, 'HR90'] for input feature HR (homicide rate)
  const propertyArray = years.map(year => currentFeature + year);

  // iterate through the propertyArray to find the extrema
  let featureExtrema = [];
  propertyArray.forEach(property => {
    const features = dataGeojson.map(d => d.properties[property]);
    featureExtrema = d3.extent(featureExtrema.concat(features));
  });

  return featureExtrema;
}


/**
 * Return the color scale for the selected feature
 * @param {number[]} featureExtrema Extrema for the selected feature over the 4 decades
 * @param {number} nColors Number of colors
 * @returns {function} Color scale
 */
export function getColorScale(featureExtrema, nColors) {
  
  return d3.scaleQuantile()
    .domain(d3.extent(featureExtrema))
    .range(d3.schemeGnBu[nColors]);
}

export function showSVG(id) {
  d3.selectAll(id).style('visibility', 'visible');
}

export function hideSVG(id) {
  d3.selectAll(id).style('visibility', 'hidden');
}