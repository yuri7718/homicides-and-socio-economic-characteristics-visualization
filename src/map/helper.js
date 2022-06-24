import * as d3 from 'd3';

/**
 * Return the color scale for the selected feature
 * 
 * @param {number[]} featureExtrema The extrema for the selected feature over the 4 decades
 * @param {number} nColors The number of colors for the color scale
 * @returns {function} The color scale
 */
export function getColorScale(featureExtrema, nColors) {
  
  return d3.scaleQuantile()
    .domain(d3.extent(featureExtrema))
    .range(d3.schemeGnBu[nColors]);
}

/**
 * Return a list of extrema for the selected feature over the 4 decades
 * 
 * @param {string} feature The selected feature
 * @param {number[]} years The array of years [60, 70, 80, 90]
 * @param {Object[]} dataGeojson The geojson data for all counties
 * @returns {number[]} The extrema for the selected feature
 */
export function getExtrema(feature, years, dataGeojson) {

  // propertyArray is ['HR60', 'HR70', 'HR80, 'HR90'] for input feature HR (homicide rate)
  const propertyArray = years.map(year => feature + year);

  // iterate through the propertyArray to find the extrema
  let featureExtrema = [];
  propertyArray.forEach(property => {
    const features = dataGeojson.map(d => d.properties[property]);
    featureExtrema = d3.extent(featureExtrema.concat(features));
  });

  return featureExtrema;
}


export function showMap(mapID) {
  d3.selectAll(mapID)
    .style('visibility', 'visible');
}

export function hideMap(mapID) {
  d3.selectAll(mapID)
    .style('visibility', 'hidden');
}

export function hideStateLegend(stateLegend) {
  stateLegend.style('visibility', 'hidden');
}

export function showStateLegend(stateLegend) {
  stateLegend.style('visibility', 'visible');
}

export function getTooltipText(region, feature, value, year) {
  const html =
  `<div>
    <p>${region}</p>
    <p><b>${feature}: </b>${value}<p>
    <p><b>Year: </b>${year}</p>
  </div>`
  return html;
}