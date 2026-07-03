# Plasmit Auth HMS

Spring Boot authentication and RBAC service for Plasmit Hospital Management System.

## Project Setup

- Service name: `plasmit-auth-hms`
- Package: `com.plasmit.auth`
- Spring Boot: `3.4.4`
- Java: `17`
- Build: Maven
- Database: MySQL
- Data access: JDBC / `NamedParameterJdbcTemplate`
- Migration: Flyway
- API docs: Swagger/OpenAPI

## Run In Eclipse STS

1. Open Spring Tools Suite 4.
2. Go to `File > Import > Existing Maven Projects`.
3. Select this folder: `backend/plasmit-auth-hms`.
4. Wait for Maven dependencies to download.
5. Configure JDK 17 in STS.
6. Update `src/main/resources/application.properties` database password.
7. Run `PlasmitAuthHmsApplication.java` as Spring Boot App.

## URLs

- API base: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## Next Module

The first implementation module should be platform super admin authentication, followed by dynamic RBAC.
