FROM openjdk:8

WORKDIR /app
COPY run-java.sh /app/run-java.sh
RUN chmod +x run-java.sh
ENTRYPOINT ["./run-java.sh"]

RUN apt-get update && apt-get install -y --no-install-recommends \
		imagemagick \
		jpegoptim \
	&& rm -rf /var/lib/apt/lists/*

ENV JAVA_MAIN_CLASS net.animeta.backend.ApplicationKt

ADD lib /app
#ADD project-lib/*.jar /app/
ADD *.jar /app/
