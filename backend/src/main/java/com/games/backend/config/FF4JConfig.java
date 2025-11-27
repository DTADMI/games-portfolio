// src/main/java/com/games/backend/config/FF4JConfig.java
package com.games.backend.config;

import org.ff4j.FF4j;
import org.ff4j.spring.boot.web.api.config.EnableFF4jSwagger;
import org.ff4j.web.FF4jDispatcherServlet;
import org.ff4j.web.embedded.ConsoleServlet;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFF4jSwagger
public class FF4JConfig extends SpringBootServletInitializer {

    @Bean
    public FF4j getFF4j() {
        FF4j ff4j = new FF4j();

        // Enable audit
        ff4j.audit(true);

        // Enable monitoring
        ff4j.autoCreate(true);

        // Add features
        ff4j.createFeature("leaderboard.enabled", true);
        ff4j.createFeature("multiplayer.enabled", false);
        ff4j.createFeature("achievements.enabled", true);

        return ff4j;
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnClass({ConsoleServlet.class, FF4jDispatcherServlet.class})
    public ServletRegistrationBean<FF4jDispatcherServlet> ff4jDispatcherServletRegistrationBean(FF4jDispatcherServlet ff4jDispatcherServlet) {
        return new ServletRegistrationBean<>(ff4jDispatcherServlet, "/ff4j-web-console/*");
    }

    @Bean
    @ConditionalOnMissingBean
    public FF4jDispatcherServlet getFF4jServlet(FF4j ff4j) {
        FF4jDispatcherServlet ff4jDispatcherServlet = new FF4jDispatcherServlet();
        ff4jDispatcherServlet.setFf4j(ff4j);
        return ff4jDispatcherServlet;
    }
}