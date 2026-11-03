CREATE DATABASE IF NOT EXISTS `auth_db`;
CREATE DATABASE IF NOT EXISTS `project_db`;
CREATE DATABASE IF NOT EXISTS `task_db`;
CREATE DATABASE IF NOT EXISTS `chat_db`;
CREATE DATABASE IF NOT EXISTS `document_db`;
CREATE DATABASE IF NOT EXISTS `ai_db`;

CREATE USER IF NOT EXISTS 'transcendence_user'@'%' IDENTIFIED BY 'roma';

GRANT ALL PRIVILEGES ON `auth_db`.* TO 'transcendence_user'@'%';
GRANT ALL PRIVILEGES ON `project_db`.* TO 'transcendence_user'@'%';
GRANT ALL PRIVILEGES ON `task_db`.* TO 'transcendence_user'@'%';
GRANT ALL PRIVILEGES ON `chat_db`.* TO 'transcendence_user'@'%';
GRANT ALL PRIVILEGES ON `document_db`.* TO 'transcendence_user'@'%';
GRANT ALL PRIVILEGES ON `ai_db`.* TO 'transcendence_user'@'%';

FLUSH PRIVILEGES;