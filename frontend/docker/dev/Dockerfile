FROM node:22.17-bookworm

WORKDIR /usr/local/app/frontend

RUN chown -R node:node /usr/local/app/frontend
USER "node"

COPY --chown=node:node ./frontend/package*.json ./
COPY --chown=node:node ./frontend/public ./public
COPY --chown=node:node ./frontend/index.html ./
COPY --chown=node:node ./frontend/tsconfig* ./
COPY --chown=node:node ./frontend/vite.config.ts ./

RUN npm install

CMD ["npm", "run", "dev"]
