UPDATE game SET setting_names = ARRAY['mode','type','timer','zero_detective','zero_guru'] WHERE id = 2;
ALTER TABLE crazy_noisy_setting ADD COLUMN zero_detective boolean DEFAULT true ;
ALTER TABLE crazy_noisy_setting ADD COLUMN zero_guru boolean DEFAULT false ;