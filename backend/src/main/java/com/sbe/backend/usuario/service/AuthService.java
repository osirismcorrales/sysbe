package com.sbe.backend.usuario.service;

import com.sbe.backend.usuario.dto.LoginRequestDto;
import com.sbe.backend.usuario.dto.LoginResponseDto;

public interface AuthService {

    LoginResponseDto login(LoginRequestDto request);

}
