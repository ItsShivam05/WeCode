# Minimal, secure container environment for C++ compilation and execution
FROM alpine:3.20

# Install modern C++ compiler and essential execution utilities
RUN apk add --no-cache \
    g++ \
    musl-dev \
    libstdc++ \
    coreutils \
    time

# Create unprivileged sandbox user
RUN addgroup -g 10001 sandbox && \
    adduser -u 10001 -G sandbox -D -s /bin/sh -h /sandbox sandbox

WORKDIR /sandbox

# Setup workspace permissions
RUN chown -R sandbox:sandbox /sandbox

# Drop to unprivileged user
USER sandbox

CMD ["/bin/sh"]
