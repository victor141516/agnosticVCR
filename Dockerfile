FROM node:lts-alpine

ENV PROXY_PORT=8000
ENV VCR_FILE=/vcr.jsonl
ENV CUSTOM_MATCHER=/customMatcher.js

VOLUME [ "/root/.anyproxy/certificates" ]

RUN npm i -g anyproxy
COPY vcr.js /vcr.js
COPY start.sh /start.sh

CMD [ "./start.sh" ]
