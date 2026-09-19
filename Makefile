NAME = ft_transcendence
COMPOSE_FILE = docker-compose.yml
COMPOSE = docker compose -f $(COMPOSE_FILE)

all: up

up:
	@echo "Démarrage des conteneurs..."
	@$(COMPOSE) up -d --build

down:
	@echo "Arrêt des conteneurs..."
	@$(COMPOSE) down

clean: down
	@echo "Nettoyage des conteneurs, images et réseaux inutilisés..."
	@docker system prune -f

fclean: clean
	@echo "Suppression totale (y compris les volumes de données)..."
	@docker volume rm transcendence_db_data || true

re: fclean all

logs:
	@$(COMPOSE) logs -f

.PHONY: all up down clean fclean re logs
