NAME = ft_transcendence
COMPOSE_FILE = docker-compose.yml
COMPOSE = docker compose -f $(COMPOSE_FILE)
DATA_DIR = $(PWD)/data

all: prepare up

prepare:
	@mkdir -p $(DATA_DIR)/mariadb $(DATA_DIR)/elasticsearch $(DATA_DIR)/prometheus $(DATA_DIR)/grafana/dashboards

up:
	@echo "Starting containers..."
	@$(COMPOSE) up -d --build

down:
	@echo "Stopping containers..."
	@$(COMPOSE) down

clean: down
	@echo "Cleaning up containers, unused images, and networks..."
	@docker system prune -f

fclean: clean
	@echo "Full reset (including data volumes)..."
	@$(COMPOSE) down -v --remove-orphans
	@docker run --rm --user 0 -v $(DATA_DIR):/data alpine:3.20 sh -c 'find /data -mindepth 1 -maxdepth 1 -exec rm -rf {} +'
	@mkdir -p $(DATA_DIR)/mariadb $(DATA_DIR)/elasticsearch $(DATA_DIR)/prometheus $(DATA_DIR)/grafana/dashboards

re: fclean all

logs:
	@$(COMPOSE) logs -f

.PHONY: all prepare up down clean fclean re logs
