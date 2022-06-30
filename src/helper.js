/**
 * Convert values to numbers to prevent having strings in the dataset
 */
export function cleanDataset(dataset, years) {
  const defaultYears = years.map(year => year.toString());
  dataset.forEach(d => {
    for (let key in d) {
      if (defaultYears.includes(key.slice(-2))) {
        d[key] = Number(d[key]);
      }
    }
    return d;
  });
  return dataset;
}