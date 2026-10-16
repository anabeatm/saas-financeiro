package com.saasfinanceiro.finexp.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "{user.name.notblank}")
    @Size(min = 2, max = 100, message = "{user.name.size}")
    String name
) {}
