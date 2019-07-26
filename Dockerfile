FROM node:10.12.0-alpine

RUN addgroup -S app && adduser -S -g app app

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Alternatively use ADD https:// (which will not be cached by Docker builder)
RUN apk --no-cache add curl ca-certificates \
    && echo "Pulling watchdog binary from Github." \
    && curl -sSLf https://github.com/openfaas-incubator/of-watchdog/releases/download/0.5.0/of-watchdog > /usr/bin/fwatchdog \
    && chmod +x /usr/bin/fwatchdog \
    && apk del curl

WORKDIR /root/

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /home/app

ARG FN_HANDLER="function"

# Wrapper/boot-strapper
WORKDIR /home/app
COPY babel.config.js ./
COPY .eslintrc.js ./
COPY package.json ./

RUN npm i
RUN chown app:app -R /home/app \
    && chmod 777 /tmp

# chmod for tmp is for a buildkit issue (@alexellis)
COPY ${FN_HANDLER}/ ./

RUN find ! -regex ^\./node_modules.*$ | xargs -I {} chown app {}

USER app

ARG NODE_ENV="test"

ENV NODE_ENV=${NODE_ENV}
ENV cgi_headers="true"
ENV fprocess="node index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="100s"
ENV write_timeout="150s"
ENV read_timeout="150s"

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]

