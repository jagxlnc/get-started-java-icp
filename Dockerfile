#IMAGE: Get the base image for Liberty
FROM websphere-liberty:webProfile7

#BINARIES: Add in all necessary application binaries
COPY src/main/wlp/server.xml /config
ADD target/GetStartedJava.war /opt/ibm/wlp/usr/servers/defaultServer/apps

# Added Derby Type 4 JDBC driver
RUN mkdir /opt/ibm/wlp/usr/shared/resources/derby
COPY docker/liberty/derbyclient.jar /opt/ibm/wlp/usr/shared/resources/derby/


#FEATURES: Install any features that are required
RUN /opt/ibm/wlp/bin/installUtility install  --acceptLicense \
	jsp-2.3 \
	servlet-3.1 \
	jndi-1.0 \
	jdbc-4.2 \
	jaxrs-2.0 \
	jpa-2.1; exit 0
