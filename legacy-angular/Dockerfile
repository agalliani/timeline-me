# STEP 1 : build the app
# Use official node image as the base image
FROM node:latest as build
# Set the working directory
WORKDIR /usr/local/app
# Add the source code to app
COPY ./ /usr/local/app/
# Install all the dependencies
RUN npm install -g @angular/cli@14.0.4
RUN npm install
# Generate the build of the application
RUN npm run build:prod


# STEP 2: serve app with nginx server
# Use official nginx image as the base image
FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
# Copy the build output to replace the default nginx contents.
# be sure to replace app-name with name of your app
COPY --from=build /usr/local/app/dist /usr/share/nginx/html
# Expose port 80
EXPOSE 4200
