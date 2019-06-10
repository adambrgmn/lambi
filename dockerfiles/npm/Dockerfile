# This is the Dockerfile used to build and deploy the package.
# The Docker env is used in order to mimic the AWS Lambda execution environment
# as closely as possible

FROM lambci/lambda:build-nodejs8.10
ENV PATH "${PATH}:./node_modules/.bin"

# We copy package.json and yarn.lock before any other files in order to leverage
# Dockers caching before running `yarn install`
COPY package.json package-lock.json ./
RUN npm install

# All files are blindly copied over (except those defined inside .dockerignore)
COPY . .
