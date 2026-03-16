FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o sync .

FROM alpine:3.21 AS runner
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/sync /usr/local/bin/sync

CMD ["sync"]
