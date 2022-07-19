truncate TABLE history_yield.dex_abis;
truncate TABLE history_yield.dex_actions;
truncate TABLE history_yield.dex_blocks;
truncate TABLE history_yield.dex_events;

truncate TABLE yield.line_protocol_category_stat_day;
truncate TABLE yield.line_protocol_day;
truncate TABLE yield.line_protocol_stat_day;
truncate TABLE yield.line_protocol_category_stat_8h;
truncate TABLE yield.line_protocol_8h;
truncate TABLE yield.line_protocol_stat_8h;
truncate TABLE yield.line_protocol_category_stat_10m;
truncate TABLE yield.line_protocol_10m;
truncate TABLE yield.line_protocol_stat_10m;
truncate TABLE yield.protocol;
truncate TABLE yield.protocol_category_stat;
truncate TABLE yield.protocol_stat;
update `yield`.params set `value`='start' where `key` = 'history_sync_status';
update history_yield.dex_events set `status` = 0;