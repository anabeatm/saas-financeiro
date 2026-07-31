package com.saasfinanceiro.finexp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FinExpApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinExpApplication.class, args);
	}

}
