

export function getAverage(data, feature, year) {

  const property = feature + year;
  let sum = 0;
  data.forEach(d => sum += Number(d[property]));
  return sum / data.length;
}

export function getTooltipText(currentState, d) {
  var html = ''
  if (currentState === '') {
    html = 
      `<div>
        <p>${d.feature}</p>
        <p>Region: The whole country</p>
        <p>Year ${d.year}</p>
        <p>Value: ${d.value.toFixed(2)}</p>
      </div>`
  } else {
    html = 
      `<div>
        <p>${d.feature}</p>
        <p>Region: State ${currentState}</p>
        <p>Year ${d.year}</p>
        <p>Value: ${d.value.toFixed(2)}</p>
      </div>`
  }
  console.log(html);
  return html;
}