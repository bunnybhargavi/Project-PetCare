# Dockerfile for Render Deployment
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port (Render will inject PORT env variable)
EXPOSE ${PORT:-8080}

# Set environment variable for PORT
ENV PORT=8080

# Run the application with PORT binding
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar target/PetCare-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod"]

