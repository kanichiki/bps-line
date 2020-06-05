CREATE TABLE discuss(
    pl_id integer NOT NULL REFERENCES participant_list(id),
    day integer NOT NULL,
    start_time timestamp,
    end_time timestamp
);