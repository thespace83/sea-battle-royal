FROM eclipse-temurin:17-jre
LABEL authors="pavel"

COPY ./app.jar .

CMD ["java", "-jar", "app.jar"]
