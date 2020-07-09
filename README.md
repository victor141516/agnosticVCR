# agnosticVCR

This is a HTTP proxy that records all your requests (including HTTPS) and replies to the same requests using the recorded responses. It'll save those responses to a file for future executions. (Pretty much the same than [Ruby's vcr](https://github.com/vcr/vcr))\
\
It's agnostic because it's language-independent: you can use it on software written in any language provided that it supports custom CA certs.

## Why

I work on a frontend project that does a lot of external requests. Tests on this project often fails due to those external requests failing. I looked for a solution to mock those requests automagically and I didn't found a thing that fitted my needs so I built it myself.\
\
It's built on top of [AnyProxy](https://anyproxy.io/) and you can run it easily using Docker.

## Usage

### Basic

```bash
touch vcr.jsonl # If the file doesn't exists, Docker will assume it's a directory and will create it

docker run --rm \
    -p 8000:8000 \
    -v $(pwd)/vcr.jsonl:/vcr.jsonl \
    -v $(pwd)/certs:/root/.anyproxy/certificates \
    victor141516/agnosticvcr
```

You will have the proxy running in the port `8000`.\
If you want to use Chrome you can your run it using the arg `--ignore-certificate-errors` (you don't even need to mount the certificates directory)

### Advanced

```bash
# Create the requests file
touch vcr.jsonl

# Run
docker run -it --rm \
    --name vcr \
    -e PROXY_PORT=8003 \
    -e CUSTOM_MATCHER=/customMatcher.js \
    -p 8003:8003 \
    -p 8002:8002 \
    -v $(pwd)/customMatcher.js:/customMatcher.js \
    -v $(pwd)/vcr.jsonl:/vcr.jsonl \
    -v $(pwd)/certs:/root/.anyproxy/certificates \
    victor141516/agnosticvcr
```

#### Change the proxy port

-   Use the `PROXY_PORT` env var

#### Customize the logic that matches a new request with the recorded ones

-   Mount the files you need inside the container
-   Use the `CUSTOM_MATCHER` env var with the full path to the file that default exports a function that does the job (Example in the file `customMatcher.js`).

#### Live see the requests

-   Bind the `8002` port (`-e 8002:8002`) and you will have the [AnyProxy WebUI](https://gw.alipayobjects.com/zos/rmsportal/JoxHUbVhXNedsPUUilnj.gif)

#### Edit the recorded requests

-   The file `vcr.jsonl` is a [JSON Lines](http://jsonlines.org/) file. It's mostly straight forward but the requests and responses bodies. Those are Node ArrayBuffer you can convert to string using `Buffer.from(BUFFER_DATA).toString()` then reencode it with `Buffer.from(EDITED_STRING).toJSON().data`.
