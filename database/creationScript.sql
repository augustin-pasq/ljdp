DROP TABLE IF EXISTS Participant;
DROP TABLE IF EXISTS Photo;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Game;
DROP TABLE IF EXISTS User;

CREATE TABLE User
(
    id             INTEGER PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(32) NOT NULL UNIQUE,
    displayedName  VARCHAR(32),
    profilePicture TEXT,
    password       TEXT        NOT NULL
);

CREATE TABLE Game
(
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    accessCode VARCHAR(4) NOT NULL UNIQUE,
    status     TEXT       NOT NULL,
    owner      INTEGER    NOT NULL,

    CONSTRAINT ck_hasStarted CHECK (status IN ('Créée', 'Commencée', 'Terminée')),
    FOREIGN KEY (owner) REFERENCES User (id)
);

CREATE TABLE Category
(
    id    INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT    NOT NULL,
    type  TEXT    NOT NULL,
    game  INTEGER NOT NULL,

    FOREIGN KEY (game) REFERENCES Game (id),
    CONSTRAINT ck_type CHECK (type IN ('Photo', 'Vidéo', 'Audio', 'Document', 'Web'))
);

CREATE TABLE Photo
(
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    link     TEXT NOT NULL,
    category INTEGER,
    user     INTEGER,

    FOREIGN KEY (category) REFERENCES Category (id),
    FOREIGN KEY (user) REFERENCES User (id)
);

CREATE TABLE Participant
(
    game  INTEGER,
    user  INTEGER,
    score INTEGER,

    PRIMARY KEY (game, user),
    FOREIGN KEY (game) REFERENCES Game (id),
    FOREIGN KEY (user) REFERENCES User (id)
);