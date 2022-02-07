FROM node:17.4.0-alpine3.14 as base
WORKDIR /usr/src/app

# Install the deps in temp to cache them
FROM base AS install
# Install for testing use
RUN mkdir -p /temp/dev
COPY package.json yarn.lock /temp/dev/
RUN cd /temp/dev && yarn install --frozen-lockfile

# Install for production use
RUN mkdir -p /temp/prod
COPY package.json yarn.lock /temp/prod/
RUN cd /temp/prod && yarn install --frozen-lockfile --prod

# Build the application
FROM install AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV DATABASE_URL=postgresql://postgres:@localhost:5432/postgres?schema=public

RUN yarn lint
RUN yarn prisma generate
RUN yarn test:ci
RUN yarn audit --groups dependencies
ENV NODE_ENV=production
RUN yarn build

# Release
FROM base AS release
# Copy only the packages requried for production
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/package.json .

USER node
ENV NODE_ENV=production

ENTRYPOINT [ "node", "main.js" ]