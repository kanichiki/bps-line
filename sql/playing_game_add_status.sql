ALTER TABLE playing_game ADD COLUMN status varchar(33);
ALTER TABLE playing_game ADD COLUMN day integer default 0;
ALTER TABLE playing_game ADD COLUMN setting_status boolean[];
ALTER TABLE game ADD COLUMN setting_names varchar(33)[];
UPDATE game SET setting_names = ARRAY['depth','wolf_number','lunatic_number','timer'] WHERE id = 1;
UPDATE game SET setting_names = ARRAY['mode','type','timer'] WHERE id = 2;