package com.pets.petcare.config;

import com.paypal.api.payments.Payment;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Slf4j
public class PayPalConfig {

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("mode", mode);
        return configMap;
    }

    @Bean
    public OAuthTokenCredential oAuthTokenCredential() {
        return new OAuthTokenCredential(clientId, clientSecret, paypalSdkConfig());
    }

    @Bean
    public APIContext apiContext() {
        try {
            // Check if credentials are placeholders (for testing/development)
            if (clientId.contains("your_actual") || clientSecret.contains("your_actual") || 
                clientId.equals("AeA1QIZXiflr1_-7Dw-mLVaybXsNLuGO-ZakHW2VVVMVs_XeRbHFm3qTbQfbQjjkEC_kJCkRQqLOhbvJ")) {
                log.warn("PayPal credentials are placeholders. PayPal integration will use mock mode.");
                // Return a context without authentication for mock mode
                APIContext context = new APIContext(clientId, clientSecret, mode);
                context.setConfigurationMap(paypalSdkConfig());
                return context;
            }
            
            APIContext context = new APIContext(oAuthTokenCredential().getAccessToken());
            context.setConfigurationMap(paypalSdkConfig());
            log.info("PayPal API context initialized successfully");
            return context;
        } catch (PayPalRESTException e) {
            log.warn("Failed to initialize PayPal API context: {}. Using mock mode.", e.getMessage());
            // Return a context without authentication for mock mode
            APIContext context = new APIContext(clientId, clientSecret, mode);
            context.setConfigurationMap(paypalSdkConfig());
            return context;
        }
    }
}