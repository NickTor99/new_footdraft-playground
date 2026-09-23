CREATE TABLE IF NOT EXISTS user_table (
    userId VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    passwordHash VARCHAR(256) NOT NULL,
    imageUrl VARCHAR(100) DEFAULT '',

    UNIQUE(username),
    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS blacklist (
    token VARCHAR(512) PRIMARY KEY,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);