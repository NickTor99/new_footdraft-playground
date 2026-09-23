drop table if exists group_table cascade;
drop table if exists membership cascade;
drop table if exists access_action cascade;
drop table if exists draft cascade;

CREATE TABLE IF NOT EXISTS group_table (
    groupId VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    creatorId VARCHAR(50) NOT NULL,
    groupName VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(20),
    maxMember INT NOT NULL,
    memberCount INT DEFAULT 0,
    isPrivate BOOLEAN  NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,

    UNIQUE(groupName)
);

CREATE TABLE IF NOT EXISTS membership (
    groupId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    userRole VARCHAR(20) NOT NULL,

    FOREIGN KEY (groupId) REFERENCES group_table(groupId) ON DELETE CASCADE,
    CONSTRAINT PK_Group PRIMARY KEY(groupId, userId)
);

CREATE TABLE IF NOT EXISTS access_action (
    actionId VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    groupId VARCHAR(50) NOT NULL,
    targetUserId VARCHAR(50) NOT NULL,
    creatorUserId VARCHAR(50) NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    actionType VARCHAR(20) NOT NULL,

    FOREIGN KEY (groupId) REFERENCES group_table(groupId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS player_profile (
    playerId VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(30) NOT NULL,
    groupId VARCHAR(50) NOT NULL,
    linckedUserId VARCHAR(50),
    velocita INT NOT NULL,
    attacco INT NOT NULL,
    difesa INT NOT NULL,
    tecnica INT NOT NULL,
    avatar VARCHAR(100),
    FOREIGN KEY (groupId) REFERENCES group_table(groupId) ON DELETE CASCADE,
    UNIQUE (groupId, nickname)
);

CREATE OR REPLACE FUNCTION trg_membership_insert_stmt()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE group_table g
    SET memberCount = g.memberCount + sub.cnt
    FROM (
             SELECT groupId, COUNT(*) AS cnt
             FROM new_table
             GROUP BY groupId
         ) sub
    WHERE g.groupId = sub.groupId;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_membership_delete_stmt()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE group_table g
    SET memberCount = g.memberCount - sub.cnt
    FROM (
             SELECT groupId, COUNT(*) AS cnt
             FROM old_table
             GROUP BY groupId
         ) sub
    WHERE g.groupId = sub.groupId;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER insert_membership_count
    AFTER INSERT ON membership
    REFERENCING NEW TABLE AS new_table
    FOR EACH STATEMENT
EXECUTE FUNCTION trg_membership_insert_stmt();

CREATE OR REPLACE TRIGGER delete_membership_count
    AFTER DELETE ON membership
    REFERENCING OLD TABLE AS old_table
    FOR EACH STATEMENT
EXECUTE FUNCTION trg_membership_delete_stmt();

CREATE TABLE IF NOT EXISTS team(
    team_id VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS team_association(
    team_id VARCHAR(50) NOT NULL,
    player_id VARCHAR(50) NOT NULL,

    FOREIGN KEY (team_id) REFERENCES team(team_id),

    PRIMARY KEY (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS captain(
    captain_id VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    captain_username VARCHAR(30) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NOT NULL,

    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE IF NOT EXISTS draft(
    session_id VARCHAR(50) DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    captain1_id VARCHAR(50) NOT NULL,
    captain2_id VARCHAR(50) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE NOT NULL,

    FOREIGN KEY (captain1_id) REFERENCES captain(captain_id),
    FOREIGN KEY (captain2_id) REFERENCES captain(captain_id)
);




