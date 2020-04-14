DROP TABLE IF EXISTS gobooks;
CREATE TABLE gobooks(
    id SERIAL PRIMARY KEY,
    img_url VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    description TEXT,
    isbn VARCHAR,
    bookshelf VARCHAR(255)
)