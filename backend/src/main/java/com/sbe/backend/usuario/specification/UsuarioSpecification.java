package com.sbe.backend.usuario.specification;

import com.sbe.backend.usuario.entity.Usuario;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UsuarioSpecification {

    public static Specification<Usuario> conFiltros(
            String busqueda,
            Long idRol,
            Usuario.EstadoUsuario estado) {
        return conFiltros(busqueda, idRol, estado, null);
    }

    public static Specification<Usuario> conFiltros(
            String busqueda,
            Long idRol,
            Usuario.EstadoUsuario estado,
            String rolNombre) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (busqueda != null && !busqueda.isBlank()) {
                String pattern = "%" + busqueda.toLowerCase().trim() + "%";
                Predicate porNombre = criteriaBuilder.like(criteriaBuilder.lower(root.get("nombreCompleto")), pattern);
                Predicate porEmail = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern);
                Predicate porDni = criteriaBuilder.like(criteriaBuilder.lower(root.get("dni")), pattern);
                predicates.add(criteriaBuilder.or(porNombre, porEmail, porDni));
            }

            if (idRol != null) {
                predicates.add(criteriaBuilder.equal(root.get("rol").get("idRol"), idRol));
            }

            if (rolNombre != null && !rolNombre.isBlank() && !"all".equalsIgnoreCase(rolNombre)) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("rol").get("nombreRol")), rolNombre.toUpperCase().trim()));
            }

            if (estado != null) {
                predicates.add(criteriaBuilder.equal(root.get("estado"), estado));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}