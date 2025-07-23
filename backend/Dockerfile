# Use the official Golang image as a base image
FROM golang:1.23-alpine

# Set the working directory inside the container
# WORKDIR /app

# Copy necessary files into the container
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the Go application
RUN go build -o server ./cmd/main.go

# Expose the port for the server
EXPOSE 8080

# Start the Go application
CMD ["./server"]