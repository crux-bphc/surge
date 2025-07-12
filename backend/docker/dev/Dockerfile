FROM node:22.17-bookworm


WORKDIR /usr/local/app/backend

COPY ./backend/package*.json ./
COPY ./backend/tsconfig.json ./

RUN npm install

CMD ["sh", "-c", "npm run dev"]