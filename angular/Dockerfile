FROM node:20-alpine

WORKDIR /app

COPY dist/angular/browser /app/

RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", ".", "-l", "8080"]
