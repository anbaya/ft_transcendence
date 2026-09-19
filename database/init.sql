
CREATE DATABASE IF NOT EXISTS transcendence_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE transcendence_db;

-- 01. Access control ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role_id CHAR(36) NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- 02. Organizations ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    owner_id CHAR(36) NOT NULL,
    CONSTRAINT fk_organizations_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS organization_members (
    id CHAR(36) NOT NULL PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_organization_member UNIQUE (organization_id, user_id),
    CONSTRAINT fk_org_members_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_org_members_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_org_members_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- 03. Projects --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) NOT NULL PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    start_date DATE NULL,
    deadline DATE NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36) NOT NULL,
    CONSTRAINT fk_projects_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT chk_project_dates CHECK (start_date IS NULL OR deadline IS NULL OR deadline >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_members (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_project_member UNIQUE (project_id, user_id),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 04. Tasks -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_by CHAR(36) NOT NULL,
    assignee_id CHAR(36) NULL,
    deadline DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 05. Conversations and messages --------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    project_id CHAR(36) NULL,
    CONSTRAINT fk_conversations_project FOREIGN KEY (project_id) REFERENCES projects(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversation_members (
    id CHAR(36) NOT NULL PRIMARY KEY,
    conversation_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    CONSTRAINT uq_conversation_member UNIQUE (conversation_id, user_id),
    CONSTRAINT fk_conversation_members_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_conversation_members_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) NOT NULL PRIMARY KEY,
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 06. Documents -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NOT NULL,
    uploader_id CHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_documents_uploader FOREIGN KEY (uploader_id) REFERENCES users(id),
    CONSTRAINT chk_document_file_size CHECK (file_size IS NULL OR file_size >= 0)
) ENGINE=InnoDB;

-- 07. Artificial intelligence -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_interactions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    project_id CHAR(36) NULL,
    user_id CHAR(36) NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_interactions_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_ai_interactions_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 08. User activity ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_activities (
    id CHAR(36) NOT NULL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id CHAR(36) NOT NULL,
    CONSTRAINT fk_user_activities_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
