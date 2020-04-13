DROP TABLE IF EXISTS goBooks;
CREATE TABLE goBooks(
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn NUMERIC,
    img_url VARCHAR(255),
    description VARCHAR(255),
    bookshlef VARCHAR(255)
)