package com.portfolio.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import io.swagger.v3.oas.models.media.Schema;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI usersMicroserviceOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(
                new Components()
                    .addSecuritySchemes(securitySchemeName,
                        new SecurityScheme()
                            .name(HttpHeaders.AUTHORIZATION)
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("Enter the JWT token in the format: Bearer <your_token>")
                    )
                    .addSchemas("string", new Schema<String>().type("string").example(""))
                    .addSchemas("integer", new Schema<Integer>().type("integer").example(0))
                    .addSchemas("number", new Schema<Number>().type("number").example(0))
            )
            .info(new Info()
                .title("Investment Portfolio API")
                .description("API for managing investment portfolios. Authenticate using JWT token.")
                .version("1.0"));
    }
} 