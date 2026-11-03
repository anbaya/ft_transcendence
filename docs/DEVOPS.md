# DevOps Handoff

## Responsibilities

Jaafar owns the platform infrastructure:

- Docker Compose orchestration
- Nginx HTTPS reverse proxy
- Frontend and service networking
- Environment configuration
- Centralized logging with Logstash and Elasticsearch
- Kibana observability
- Prometheus metrics collection and Grafana dashboards
- Startup, healthchecks, and deployment validation

## Start the stack

Create the ignored local `.env` file with the required database and API values, then run:

```bash
make up
```

The main entrypoint is `https://localhost:8443/`. The certificate is self-signed, so browsers may show a certificate warning during local development.

## Service endpoints

- Frontend: `http://localhost:3000`
- HTTPS gateway: `https://localhost:8443`
- Elasticsearch: `http://localhost:9200`
- Logstash TCP input: `localhost:5000`
- Kibana: `http://localhost:5601`u
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## Stop the stack

```bash
make down
```

`make fclean` also removes the database volume. The current Elasticsearch data volume is versioned as `transcendence_es_data_v8`; the previous volume is left untouched during the Elastic Stack upgrade.

## Verification

```bash
docker compose config --quiet
docker compose ps
docker compose logs --tail=100
curl -k https://localhost:8443/
curl http://localhost:9200/_cluster/health
curl http://localhost:9090/-/ready
curl http://localhost:3001/api/health
```

A healthy deployment should show all services running, Elasticsearch with `status: green`, Logstash with a healthy status, and both monitoring endpoints ready.
