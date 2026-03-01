FROM eclipse-temurin:17-jdk
LABEL authors="pavel"

COPY . .

RUN java --version
RUN ./gradlew :app:build
CMD ["java", "-jar", "./app/build/libs/app.jar"]

EXPOSE 80
