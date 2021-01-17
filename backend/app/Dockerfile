FROM openjdk:8 AS builder

WORKDIR /app
COPY *.jar /app/app.jar
RUN java -Djarmode=layertools -jar app.jar extract


FROM openjdk:8

WORKDIR /app
COPY run-java.sh /app/run-java.sh
RUN chmod +x run-java.sh
ENTRYPOINT ["./run-java.sh"]

RUN apt-get update && apt-get install -y --no-install-recommends \
		imagemagick \
		jpegoptim \
	&& rm -rf /var/lib/apt/lists/*

ENV JAVA_MAIN_CLASS org.springframework.boot.loader.JarLauncher

COPY --from=builder /app/dependencies/ ./
RUN true
COPY --from=builder /app/spring-boot-loader/ ./
RUN true
COPY --from=builder /app/snapshot-dependencies/ ./
RUN true
COPY --from=builder /app/application/ ./
