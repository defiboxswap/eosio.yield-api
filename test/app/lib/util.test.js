'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { convert_last_line_id } = require('../../../app/lib/util');
const moment = require('moment');


describe('test/app/lib/util.test.js', () => {
  it('should assert', () => {
    assert(convert_last_line_id('10m', moment('2022-06-02 00:06:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(10, 'm').unix());
    assert(convert_last_line_id('10m', moment('2022-06-02 00:15:00+00:00').unix()) === moment('2022-06-02 00:10:00+00:00').subtract(10, 'm').unix());
    assert(convert_last_line_id('10m', moment('2022-06-02 00:20:00+00:00').unix()) === moment('2022-06-02 00:20:00+00:00').subtract(10, 'm').unix());
    assert(convert_last_line_id('10m', moment('2022-06-02 00:25:00+00:00').unix()) === moment('2022-06-02 00:20:00+00:00').subtract(10, 'm').unix());
    assert(convert_last_line_id('10m', moment('2022-06-02 00:30:00+00:00').unix()) === moment('2022-06-02 00:30:00+00:00').subtract(10, 'm').unix());

    assert(convert_last_line_id('8h', moment('2022-06-02 01:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(8, 'h').unix());
    assert(convert_last_line_id('8h', moment('2022-06-02 02:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(8, 'h').unix());
    assert(convert_last_line_id('8h', moment('2022-06-02 08:00:00+00:00').unix()) === moment('2022-06-02 08:00:00+00:00').subtract(8, 'h').unix());
    assert(convert_last_line_id('8h', moment('2022-06-02 09:00:00+00:00').unix()) === moment('2022-06-02 08:00:00+00:00').subtract(8, 'h').unix());
    assert(convert_last_line_id('8h', moment('2022-06-02 16:00:00+00:00').unix()) === moment('2022-06-02 16:00:00+00:00').subtract(8, 'h').unix());
    assert(convert_last_line_id('8h', moment('2022-06-02 17:00:00+00:00').unix()) === moment('2022-06-02 16:00:00+00:00').subtract(8, 'h').unix());


    assert(convert_last_line_id('day', moment('2022-06-02 00:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());
    assert(convert_last_line_id('day', moment('2022-06-02 02:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());
    assert(convert_last_line_id('day', moment('2022-06-02 05:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());
    assert(convert_last_line_id('day', moment('2022-06-02 06:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());
    assert(convert_last_line_id('day', moment('2022-06-02 16:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());
    assert(convert_last_line_id('day', moment('2022-06-02 17:00:00+00:00').unix()) === moment('2022-06-02 00:00:00+00:00').subtract(1, 'd').unix());

    assert(convert_last_line_id('week', moment('2022-06-02 00:00:00+00:00').unix()) === moment('2022-05-29 00:00:00+00:00').subtract(1, 'week').unix());
    assert(convert_last_line_id('week', moment('2022-06-10 00:00:00+00:00').unix()) === moment('2022-06-05 00:00:00+00:00').subtract(1, 'week').unix());
    assert(convert_last_line_id('week', moment('2022-06-15 00:00:00+00:00').unix()) === moment('2022-06-12 00:00:00+00:00').subtract(1, 'week').unix());
    assert(convert_last_line_id('week', moment('2022-06-25 00:00:00+00:00').unix()) === moment('2022-06-19 00:00:00+00:00').subtract(1, 'week').unix());
    assert(convert_last_line_id('week', moment('2022-06-28 00:00:00+00:00').unix()) === moment('2022-06-26 00:00:00+00:00').subtract(1, 'week').unix());
    assert(convert_last_line_id('week', moment('2022-06-30 00:00:00+00:00').unix()) === moment('2022-06-26 00:00:00+00:00').subtract(1, 'week').unix());
  });
});
