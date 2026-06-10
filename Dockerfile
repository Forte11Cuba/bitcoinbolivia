FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/docker-compose.yml \
           /usr/share/nginx/html/README.md \
           /usr/share/nginx/html/design-canvas.jsx
EXPOSE 80
