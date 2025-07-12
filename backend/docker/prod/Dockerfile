FROM node:22.17-bookworm

WORKDIR /app

COPY ./backend .

RUN npm install
RUN npm run build

CMD ["sh", "-c", "npm run start"]
