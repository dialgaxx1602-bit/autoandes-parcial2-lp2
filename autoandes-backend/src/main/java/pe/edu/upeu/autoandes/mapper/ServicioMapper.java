package pe.edu.upeu.autoandes.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.autoandes.dto.request.ServicioRequestDTO;
import pe.edu.upeu.autoandes.dto.response.ServicioResponseDTO;
import pe.edu.upeu.autoandes.entity.Servicio;

@Component
public class ServicioMapper {

    public Servicio toEntity(ServicioRequestDTO request) {
        if (request == null) return null;
        return Servicio.builder()
                .codigo(request.getCodigo())
                .nombre(request.getNombre())
                .precio(request.getPrecio())
                .duracionMin(request.getDuracionMin())
                .activo(1)
                .build();
    }

    public void updateEntityFromDTO(Servicio entity, ServicioRequestDTO request) {
        if (entity == null || request == null) return;
        entity.setCodigo(request.getCodigo());
        entity.setNombre(request.getNombre());
        entity.setPrecio(request.getPrecio());
        entity.setDuracionMin(request.getDuracionMin());
    }

    public ServicioResponseDTO toResponseDTO(Servicio entity) {
        if (entity == null) return null;
        return ServicioResponseDTO.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .precio(entity.getPrecio())
                .duracionMin(entity.getDuracionMin())
                .activo(entity.getActivo())
                .build();
    }
}
