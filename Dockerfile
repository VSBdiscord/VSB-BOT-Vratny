FROM node:10.19

#COPY . /app
# or
RUN git clone https://github.com/KasheK420/VSB-BOT-Vratny.git /app

WORKDIR /app

RUN npm install

COPY auth.json .

CMD nodejs main.js
