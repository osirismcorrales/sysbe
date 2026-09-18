package com.sbe.backend.usuario.mapper;

import com.sbe.backend.usuario.dto.UsuarioRequestDto;
import com.sbe.backend.usuario.dto.UsuarioResponseDto;
import com.sbe.backend.usuario.entity.Usuario;
import org.springframework.stereotype.Component;

/**
 * Mapper para convertir entre la entidad Usuario y sus DTOs.
 *
 * CONVENCIONES:
 *  - Un mapper por entidad, en el paquete 'mapper' del feature
 *  - @Component para poder inyectarlo con @Autowired / constructor injection
 *  - El mapper NO tiene logica de negocio → solo convierte campos
 *  - El hasheo de passwords NO va aqui → va en el Service
 *
 * Por que no usar MapStruct?
 *  Podemos agregarlo despues. Por ahora lo hacemos manual para que sea
 *  facil de entender y debuggear sin anotaciones magicas.
 */
@Component
public class UsuarioMapper {

    /**
     * Convierte un UsuarioRequestDto a entidad Usuario.
     * NOTA: la password NO se hashea aqui, el Service lo hace antes de guardar.
     */
    public Usuario toEntity(UsuarioRequestDto dto) {
        return Usuario.builder()
                .nombre(dto.nombre())
                .apellido(dto.apellido())
                .email(dto.email())
                .password(dto.password()) // llega sin hashear, el Service lo hashea
                .rol(dto.rol())
                .build();
    }

    /**
     * Convierte una entidad Usuario a UsuarioResponseDto.
     * La password nunca se incluye en el response.
     */
    public UsuarioResponseDto toResponseDto(Usuario usuario) {
        return new UsuarioResponseDto(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.isActivo()
        );
    }
}
