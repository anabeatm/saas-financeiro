# Image used to deploy the API (Render runs Java apps through Docker).
# Build: docker build -t finexp-api .   Run: docker run -p 8080:8080 --env-file .env finexp-api

# 1) Build the executable .war with Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Dependencies first, so this layer is cached while only the code changes
RUN mvn -q -B dependency:go-offline
COPY src ./src
# The test suite needs a MySQL database; it runs in development, not in the image build
RUN mvn -q -B package -DskipTests

# 2) Small runtime image with only the JRE and the application
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --uid 10001 finexp
COPY --from=build /app/target/*.war app.war
USER finexp

# Fit the heap to the container (Render's free instance has 512 MB of memory)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
# Render sets PORT; application.properties reads it (8080 by default)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.war"]
