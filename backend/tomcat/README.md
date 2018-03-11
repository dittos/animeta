# Tomcat Docker 이미지

Spring Boot 앱이지만 임베디드 Tomcat을 쓰지 않고 스탠드얼론 Tomcat WAS 위에서 돌리고 있습니다. (재배포 시 서버를 껐다 켜지 않고 WAR만 교체하기 위함 - 메모리가 충분하지 않은 서버 한 대만 가지고 롤링 업데이트를 할 방법이 없습니다.)

## 이미지 빌드

`context.xml`이 작성되어 있어야 합니다.

```
[sudo] docker build -t animeta-tomcat .
```

## 컨테이너 실행

`application.properties`와 `backend-1.0.0.war`를 준비합니다.

```
[sudo] docker run -dit \
    -v $PWD/backend-1.0.0.war:/app/backend-1.0.0.war:ro \
    -v $PWD/application.properties:/app/application.properties:ro \
    -v $PWD/google-credentials.json:/app/google-credentials.json:ro \
    -e CATALINA_OPTS="-Xms128m -Xmx128m -XX:+UseConcMarkSweepGC" \
    --restart unless-stopped \
    --name animeta-tomcat \
    animeta-tomcat
```

`backend-1.0.0.war`를 교체하면 애플리케이션이 다시 로드됩니다.

설정 파일을 수정한 다음에는 WAR 파일을 `touch`해야 다시 불러옵니다.

```
touch backend-1.0.0.war
```

## 참고 - DB 설정 방법

컨테이너 안에서 호스트의 DB 서버에 접근하려면 브릿지 네트워크의 게이트웨이 IP를 사용해야 합니다.

```
$ ip addr show docker0
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:f1:90:29:61 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:f1ff:fe90:2961/64 scope link 
       valid_lft forever preferred_lft forever
```

Postgres는

* `postgresql.conf`에서 `listen_addresses`에 브릿지 네트워크 IP 추가
* `pg_hba.conf`에서 브릿지 네트워크의 IP 대역을 허용
