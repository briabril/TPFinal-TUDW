CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED');

CREATE TYPE notification_type AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'MESSAGE');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    displayname VARCHAR(30) NOT NULL,
    bio VARCHAR(160),
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    role user_role DEFAULT 'USER',
    status user_status DEFAULT 'ACTIVE'
);

CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES post(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('IMAGE','VIDEO','AUDIO','GIF')),
    width INT,
    height INT
);



CREATE TABLE post (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
text VARCHAR(2000) NOT NULL,
link_url TEXT,
created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()

);
CREATE TABLE user_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES post(id) ON DELETE CASCADE,
    text VARCHAR(280) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    parent_id UUID REFERENCES user_comments(id) ON DELETE CASCADE
);
CREATE TABLE reaction (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES post(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES user_comments(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'LIKE',
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id, comment_id, type),
    CONSTRAINT one_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);


CREATE TABLE follow (
 follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id)
);
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    seen_at TIMESTAMP
);

CREATE TABLE conversation (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE conversation_participants(
conversation_id UUID NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE notification (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    ref_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    is_seen BOOLEAN DEFAULT FALSE
);
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);

CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);
