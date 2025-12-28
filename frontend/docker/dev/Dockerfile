FROM node:22.17-bookworm

USER "node"
WORKDIR /usr/local/app/frontend

COPY --chown=node:node ./frontend/package*.json ./
COPY --chown=node:node ./frontend/public ./public
COPY --chown=node:node ./frontend/index.html ./
COPY --chown=node:node ./frontend/tsconfig* ./
COPY --chown=node:node ./frontend/vite.config.ts ./

RUN npm install

CMD ["npm", "run", "dev"]