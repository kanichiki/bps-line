CREATE TABLE vote(
    pl_id integer NOT NULL REFERENCES participant_list(id),
    day integer NOT NULL,
    count integer NOT NULL DEFAULT 1,
    indexes integer[],
    numbers integer[],
    status boolean[],
    voting boolean
);