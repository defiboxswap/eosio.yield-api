'use strict';

module.exports = {
  "10m":  {
    startUnitOfTime: "hour",
    diffUnitOfTime: "minute",
    unit: 10,
    duration: 600,
    max_line_search_day: 15,
  },
  "8h": {
    startUnitOfTime: "day",
    diffUnitOfTime: "hour",
    unit: 8,
    duration: 28800,
    max_line_search_day: 90,
  },
  "day": {
    startUnitOfTime: "day",
    duration: 86400,
    max_line_search_day: 180,
  },
  "week": {
    startUnitOfTime: "week",
    duration: 604800,
    max_line_search_day: 360,
  },
};

