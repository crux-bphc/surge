FROM node:22.17-bookworm

WORKDIR /usr/local/app/frontend

COPY ./frontend/package*.json ./
COPY ./frontend/public ./public
COPY ./frontend/index.html ./
COPY ./frontend/tsconfig* ./
COPY ./frontend/vite.config.ts ./

RUN npm install

CMD ["npm", "run", "dev"]