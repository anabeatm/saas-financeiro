package com.saasfinanceiro.finexp.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Profile picture sent as a base64 data URL (PNG, JPEG or WebP, up to ~1 MB). */
public record UpdateAvatarRequest(
    @NotBlank(message = "{user.avatar.notblank}")
    @Size(max = 1_400_000, message = "{user.avatar.size}")
    @Pattern(regexp = "^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$", message = "{user.avatar.invalid}")
    String avatar
) {}
