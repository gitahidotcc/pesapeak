################# Base Builder ##############
FROM node:22-alpine AS base

WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"

# Enable pnpm via corepack
RUN npm install -g corepack@latest && corepack enable

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat make g++ py3-pip linux-headers

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/trpc/package.json ./packages/trpc/
COPY tooling/oxlint/package.json ./tooling/oxlint/
COPY tooling/prettier/package.json ./tooling/prettier/
COPY tooling/tailwind/package.json ./tooling/tailwind/
COPY tooling/typescript/package.json ./tooling/typescript/

ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

COPY . .

# Build the db migration script
RUN cd packages/db && \
    pnpm exec ncc build migrate.ts -o /db_migrations && \
    cp -R drizzle /db_migrations/drizzle

# Create empty .env file (Next.js checks for it)
RUN touch apps/web/.env

# Build the web app with standalone output
# Use --experimental-build-mode compile to skip page data collection (avoids DB access during build)
RUN (cd apps/web && pnpm exec next build --experimental-build-mode compile)


################# The All-in-one builder ##############

FROM node:22-alpine AS aio_builder
LABEL org.opencontainers.image.source="https://github.com/gitahidotcc/pesapeak"
WORKDIR /app

ARG SERVER_VERSION=nightly
ENV SERVER_VERSION=${SERVER_VERSION}

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

######################
# Prepare s6-overlay
######################
ARG S6_OVERLAY_VERSION=3.2.1.0
ARG TARGETARCH

ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz \
    && case ${TARGETARCH} in \
            "amd64")  S6_ARCH=x86_64   ;; \
            "arm64")  S6_ARCH=aarch64  ;; \
        esac \
    && echo https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${S6_ARCH}.tar.xz -O /tmp/s6-overlay-${S6_ARCH}.tar.xz \
    && wget https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${S6_ARCH}.tar.xz -O /tmp/s6-overlay-${S6_ARCH}.tar.xz \
    && tar -C / -Jxpf /tmp/s6-overlay-${S6_ARCH}.tar.xz \
    && rm -f /tmp/s6-overlay-${S6_ARCH}.tar.xz

# Copy the s6-overlay config
COPY --chmod=755 ./docker/root/etc/s6-overlay /etc/s6-overlay

######################
# Install runtime deps
######################
RUN apk add --no-cache wget

######################
# Prepare the web app
######################

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone Next.js build output
COPY --from=base --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=base --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=base --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=base /db_migrations /db_migrations

# Set the correct permission for prerender cache
RUN mkdir -p ./apps/web/.next && chown node:node ./apps/web/.next

ENTRYPOINT ["/init"]

################# The AIO (All-in-one) ##############

FROM aio_builder AS aio

# Enable only web service (no workers for now)
RUN touch /etc/s6-overlay/s6-rc.d/user/contents.d/init-db-migration \
    /etc/s6-overlay/s6-rc.d/user/contents.d/svc-web

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

################# The web container (for future use) ##############

FROM aio_builder AS web

RUN touch /etc/s6-overlay/s6-rc.d/user/contents.d/init-db-migration \
    /etc/s6-overlay/s6-rc.d/user/contents.d/svc-web
ENV USING_LEGACY_SEPARATE_CONTAINERS=true

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1
