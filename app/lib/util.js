'use strict';
const Decimal = require('decimal.js');
const moment = require('moment');
const DurationType = require('./enums/duration_type');
const Constants = require('../lib/constants');
const sparkline = require('node-sparkline');

// [
//   ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
//   ['Milk Tea', 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
//   ['Matcha Latte', 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
//   ['Cheese Cocoa', 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
//   ['Walnut Brownie', 25.2, 37.1, 41.2, 18, 33.9, 49.1]
// ]
exports.group_data = function (list, data_key, type_key, value_key) {
  if (!list || list.length === 0) return [];

  const result = [['category']];
  const datas = new Map([['', 0]]);
  const types = new Map([['', 0]]);
  for (const item of list) {
    const data = item[data_key];
    const type = item[type_key];
    // data index
    if (!datas.has(data)) {
      datas.set(data, datas.size);
      result[0].push(data + '');
    }
    // type index
    if (!types.has(type)) {
      result[types.size] = [];
      result[types.size].push(type);
      types.set(type, types.size);
    }
    result[types.get(type)][datas.get(data)] = item[value_key] || 0;
  }
  return result;
};

exports.add = (x, y, precision = 4) => Decimal(x).add(y).toFixed(precision);
exports.sub = (x, y, precision = 4) => Decimal(x).sub(y).toFixed(precision);
exports.subAdd = (x, y, z, precision = 4) => Decimal(x).sub(y).add(z).toFixed(precision);

// like egg-core/file-loader
exports.camelProp = (property, caseStyle) => {
  if (typeof caseStyle === 'function') {
    return caseStyle(property);
  }
  // camel transfer
  property = property.replace(/[._-][a-z]/gi, s => s.substring(1).toUpperCase());
  let first = property[0];
  // istanbul ignore next
  switch (caseStyle) {
    case 'lower':
      first = first.toLowerCase();
      break;
    case 'upper':
      first = first.toUpperCase();
      break;
    case 'camel':
      break;
    default:
      break;
  }
  return first + property.substring(1);
};

exports.sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtain the last line ID corresponding to the time
 * if date = undefined Take the current time
 * if date = 0 Take the current time
 * @param {*} type
 * @param {*} date
 * @returns
 */
exports.convert_last_line_id = (type, date = undefined) => {
  if (date === 0) {
    date = undefined;
  }
  if (date) {
    date *= 1000;
  }
  const { startUnitOfTime, diffUnitOfTime, unit, duration } = DurationType[type];

  if (!diffUnitOfTime) return moment(date).utc().startOf(startUnitOfTime).unix() - duration;

  const now = moment(date);
  const startOf = moment(date).startOf(startUnitOfTime);
  const diff = Math.floor(now.diff(startOf, diffUnitOfTime, true) / unit) * unit;
  return startOf[diffUnitOfTime](diff).unix() - duration;
};

/**
 * Obtain the line ID corresponding to the time
 * if date = undefined Take the current time
 * if date = 0 Take the current time
 * @param {*} type
 * @param {*} date
 * @returns
 */
exports.convert_now_line_id = (type, date = undefined) => {
  if (date === 0) {
    date = undefined;
  }
  if (date) {
    date *= 1000;
  }
  const { startUnitOfTime, diffUnitOfTime, unit } = DurationType[type];

  if (!diffUnitOfTime) return moment(date).utc().startOf(startUnitOfTime).unix();

  const now = moment(date);
  const startOf = moment(date).startOf(startUnitOfTime);
  const diff = Math.floor(now.diff(startOf, diffUnitOfTime, true) / unit) * unit;
  return startOf[diffUnitOfTime](diff).unix();
};

/**
 * eg: [{
          "key": "name",
          "value": "Pizza Finance"
        }, {
            "key": "website",
            "value": "https://pizza.finance"
        }]
 * 
 * @param {*} metadata 
 * @param {*} key 
 * @returns 
 */
exports.get_metadata_value = (metadata, key) => {
  for (const item of metadata) {
    if (item.key === key) {
      return item.value;
    }
  }
  return '';
};

/**
 * convert array to map
 * @param {array} arr
 */
exports.array_to_object = arr => {
  const result = {};
  if (arr) {
    for (const item of arr) {
      result[item.key] = item.value;
    }
  }
  return result;
};

/**
 * sparkline generator
 * Green/Red (positive/negative) TVL from first data entry
 * @param {object} options
 * @returns
 */
exports.sparkline = ({ values, width = 135, height = 50, strokeWidth = 1, strokeOpacity = 1 }) => {
  const stroke =
    values.length > 1 && values[values.length - 1] > values[0]
      ? Constants.stroke_green
      : Constants.stroke_red;
  return Constants.svg_header + sparkline({ values, width, height, strokeWidth, strokeOpacity, stroke });
};
