ALTER TABLE word_wolf_setting ALTER COLUMN timer DROP DEFAULT;
ALTER TABLE word_wolf_setting ALTER COLUMN timer TYPE interval USING timer * interval '1 minutes';
ALTER TABLE word_wolf_setting ALTER COLUMN timer SET DEFAULT '5 minutes';