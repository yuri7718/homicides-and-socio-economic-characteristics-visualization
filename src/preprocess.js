/**
 * Gets the feature names. 
 * 
 * The available features include :
 *      - HR: homicide rate
 *      - UE: unemployment rate 
 *      - DV: divorce rate
 *      - MA: median age
 *      - MFIL: family income
 *      - FP: percentage of families below poverty, 
 *      - BLK: percentage of black population, 
 *      - GI: gini index, 
 *      - FH: percentage of female headed households
 *      - DNL: population density
 *
 * @param {object[]} data The data to analyze
 * @returns {string[]} The names of the features in the data set
 */
export function getFeatureNames (data) {
  const featureNames = new Set()

  // Store unique names of the features.
  data.forEach((region) => {
    featureNames.add(region)
  })

  return featureNames
}

/**
 * Filters the data by the given years.
 *
 * @param {object[]} data The data to filter
 * @param {number} start The start year (inclusive)
 * @param {number} end The end year (inclusive)
 * @returns {object[]} The filtered data
 */
export function filterYears (data, start, end) {
  // TODO : Filter the data by years

  return data.filter(element => {
    const year = element.Date_Plantation.getFullYear()
    return start <= year && year <= end
  })
}

/**
 * Summarizes how many trees were planted each year in each neighborhood.
 *
 * @param {object[]} data The data set to use
 * @returns {object[]} A table of objects with keys 'Arrond_Nom', 'Plantation_Year' and 'Counts', containing
 * the name of the neighborhood, the year and the number of trees that were planted
 */
export function summarizeYearlyCounts (data) {
  // TODO : Construct the required data table

  // create a map object where key is Arrond_Nom + Plantation_Year
  const treesTable = new Map()

  data.forEach(element => {
    const arrondName = element.Arrond_Nom
    const plantationYear = element.Date_Plantation.getFullYear()

    const tableKey = arrondName + plantationYear

    // increase Counts is tableKey already exists, otherwise set Counts to 1
    const summaryCounts = (treesTable.has(tableKey)) ? treesTable.get(tableKey).Counts + 1 : 1

    // update treesTable
    treesTable.set(tableKey, {
      Arrond_Nom: arrondName,
      Plantation_Year: plantationYear,
      Counts: summaryCounts
    })
  })

  return Array.from(treesTable.values())
}

/**
 * For the heat map, fills empty values with zeros where a year is missing for a neighborhood because
 * no trees were planted or the data was not entered that year.
 *
 * @param {object[]} data The datas set to process
 * @param {string[]} neighborhoods The names of the neighborhoods
 * @param {number} start The start year (inclusive)
 * @param {number} end The end year (inclusive)
 * @param {Function} range A utilitary function that could be useful to get the range of years
 * @returns {object[]} The data set with a new object for missing year and neighborhood combinations,
 * where the values for 'Counts' is 0
 */
export function fillMissingData (data, neighborhoods, start, end, range) {
  // TODO : Find missing data and fill with 0
  const missingData = []
  const emptyValue = 0

  neighborhoods.forEach(neighborhood => {
    range(start, end).forEach(year => {
      if (!data.find(tree => tree.Arrond_Nom === neighborhood && tree.Plantation_Year === year)) {
        // fill empty value
        missingData.push({
          Arrond_Nom: neighborhood,
          Plantation_Year: year,
          Counts: emptyValue
        })
      }
    })
  })

  return data.concat(missingData)
}
