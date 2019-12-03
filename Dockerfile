FROM openfaas/of-watchdog:0.7.2 as watchdog

FROM node:10.12.0-alpine as ship

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

WORKDIR /root/

ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /root/app

WORKDIR /root/app
COPY package.json ./
COPY .babelrc ./
COPY .eslintrc.js ./

RUN npm i

ARG FN_HANDLER="function"
COPY ${FN_HANDLER}/ ./

ARG NODE_ENV="test"
ENV NODE_ENV=${NODE_ENV}

ENV cgi_headers="true"
ENV fprocess="node index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="100s"
ENV write_timeout="150s"
ENV read_timeout="150s"

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]