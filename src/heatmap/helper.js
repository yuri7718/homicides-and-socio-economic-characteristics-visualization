
/**
 * Calculate the average value for filtered or non-filtered dataset based on input feature and year
 */
export function getAverage(data, feature, year) {
  const property = feature + year;
  let sum = 0;
  data.forEach(d => sum += d[property]);
  return sum / data.length;
}

/**
 * Create tooltip text for heat map
 */
export function getTooltipText(currentState, d) {
  var html = ''
  if (currentState === '') {
    html = 
      `<div>
        <p style="text-align: center"><b>${d.feature}</b></p>
        <p><b>Region</b>: The Whole Country</p>
        <p><b>Year</b>: ${d.year}</p>
        <p><b>Value</b>: ${d.value.toFixed(2)}</p>
      </div>`
  } else {
    html = 
      `<div>
        <p style="text-align: center"><b>${d.feature}</b></p>
        <p><b>Region</b>: ${currentState} State</p>
        <p><b>Year</b>: ${d.year}</p>
        <p><b>Value</b>: ${d.value.toFixed(2)}</p>
      </div>`
  }
  return html;
}