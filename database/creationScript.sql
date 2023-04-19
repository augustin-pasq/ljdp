DROP TABLE IF EXISTS User;

CREATE TABLE User
(
    id             INTEGER PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(32) NOT NULL UNIQUE,
    displayedName  VARCHAR(32),
    profilePicture TEXT,
    password       TEXT        NOT NULL
);