# This is the Dockerfile used to build and deploy the package.
# The Docker env is used in order to mimic the AWS Lambda execution environment
# as closely as possible

FROM lambci/lambda:build-nodejs10.x
ENV PATH "${PATH}:./node_modules/.bin"

RUN npm install -g yarn

# We copy package.json and yarn.lock before any other files in order to leverage
# Dockers caching before running `yarn install`
COPY package.json yarn.lock ./
RUN yarn install

# All files are blindly copied over (except those defined inside .dockerignore)
COPY . .
