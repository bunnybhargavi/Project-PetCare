# Dockerfile for Render Deployment
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port (Render will inject PORT env variable)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/PetCare-0.0.1-SNAPSHOT.jar", "--spring.profiles.active=prod"]
