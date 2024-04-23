DROP TABLE IF EXISTS Response;
DROP TABLE IF EXISTS Participant;
DROP TABLE IF EXISTS Photo;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS User;

CREATE TABLE User
(
    id             INTEGER PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(32) NOT NULL UNIQUE,
    profilePicture TEXT        NOT NULL,
    password       TEXT        NOT NULL
);

CREATE TABLE Game
(
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    accessCode VARCHAR(4) NOT NULL UNIQUE,
    owner      INTEGER    NOT NULL,
    status     VARCHAR(8) NOT NULL,

    FOREIGN KEY (owner) REFERENCES User (id)
);

CREATE TABLE Category
(
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    title       TEXT        NOT NULL,
    shuffleSeed VARCHAR(64) NOT NULL,
    game        INTEGER     NOT NULL,

    FOREIGN KEY (game) REFERENCES Game (id)
);

CREATE TABLE Photo
(
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    link     TEXT    NOT NULL,
    category INTEGER NOT NULL,
    user     INTEGER NOT NULL,

    FOREIGN KEY (category) REFERENCES Category (id),
    FOREIGN KEY (user) REFERENCES User (id)
);

CREATE TABLE Participant
(
    game      INTEGER,
    user      INTEGER,
    score     INTEGER,
    hasJoined BOOLEAN NOT NULL,
    hasPhotos BOOLEAN NOT NULL,

    PRIMARY KEY (game, user),
    FOREIGN KEY (game) REFERENCES Game (id),
    FOREIGN KEY (user) REFERENCES User (id)
);

CREATE TABLE Response
(
    id    INTEGER PRIMARY KEY AUTO_INCREMENT,
    user  INTEGER NOT NULL,
    photo INTEGER NOT NULL,
    value INTEGER NOT NULL,

    FOREIGN KEY (user) REFERENCES User (id),
    FOREIGN KEY (photo) REFERENCES Photo (id),
    FOREIGN KEY (value) REFERENCES User (id)
);