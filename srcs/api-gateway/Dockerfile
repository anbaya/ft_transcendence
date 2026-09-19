FROM debian:bookworm

RUN apt-get update && \
	apt-get install -y nginx openssl && \
	rm -rf /var/lib/apt/lists/*

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# for HTTPS
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/nginx/ssl/transcendence.key \
	-out /etc/nginx/ssl/transcendence.crt \
	-subj "/C=MA/ST=Marrakesh-Safi/L=Marrakesh/O=1337/CN=localhost"

# Copy configuration
COPY conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 443

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
