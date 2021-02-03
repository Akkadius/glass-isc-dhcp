FROM node:8
WORKDIR /home/node/app

# install isc-dhcp-server; for config checking
RUN apt update && apt install isc-dhcp-server -y && rm -rf /var/cache/apt

# cache node_modules
COPY package.json .
COPY package-lock.json .

RUN npm install

# copy the remainder of src
COPY . .

CMD node ./bin/www