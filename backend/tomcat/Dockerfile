FROM tomcat:9-jre8

# Install JDBC drivers
RUN curl https://jdbc.postgresql.org/download/postgresql-42.2.1.jar -o lib/postgresql.jar
RUN curl http://central.maven.org/maven2/com/zaxxer/HikariCP/2.7.8/HikariCP-2.7.8.jar -o lib/hikaricp.jar
# HikariCP depends on slf4j-api
RUN curl http://central.maven.org/maven2/org/slf4j/slf4j-api/1.7.25/slf4j-api-1.7.25.jar -o lib/slf4j-api.jar

RUN apt-get update && apt-get install -y --no-install-recommends \
		imagemagick \
		jpegoptim \
	&& rm -rf /var/lib/apt/lists/*

COPY context.xml conf/Catalina/localhost/newapi.xml
