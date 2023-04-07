FROM node:18-alpine as build

WORKDIR /workspace

COPY package.json package-lock.json /workspace/
RUN npm install

ADD . /workspace

RUN npm run build

FROM node:18-alpine

WORKDIR /workspace

RUN mkdir -p /watch && mkdir -p /download

COPY --from=build /workspace/node_modules /workspace/node_modules
COPY --from=build /workspace/dist /workspace

CMD node index.js
