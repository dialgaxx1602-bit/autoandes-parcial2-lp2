package pe.edu.upeu.autoandes.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.autoandes.dto.request.VehiculoRequestDTO;
import pe.edu.upeu.autoandes.dto.response.VehiculoResponseDTO;
import pe.edu.upeu.autoandes.entity.Cliente;
import pe.edu.upeu.autoandes.entity.Vehiculo;

@Component
public class VehiculoMapper {

    public Vehiculo toEntity(VehiculoRequestDTO request, Cliente cliente) {
        if (request == null) return null;
        return Vehiculo.builder()
                .placa(request.getPlaca())
                .marca(request.getMarca())
                .modelo(request.getModelo())
                .anio(request.getAnio())
                .cliente(cliente)
                .build();
    }

    public void updateEntityFromDTO(Vehiculo entity, VehiculoRequestDTO request, Cliente cliente) {
        if (entity == null || request == null) return;
        entity.setPlaca(request.getPlaca());
        entity.setMarca(request.getMarca());
        entity.setModelo(request.getModelo());
        entity.setAnio(request.getAnio());
        if (cliente != null) {
            entity.setCliente(cliente);
        }
    }

    public VehiculoResponseDTO toResponseDTO(Vehiculo entity) {
        if (entity == null) return null;
        return VehiculoResponseDTO.builder()
                .id(entity.getId())
                .placa(entity.getPlaca())
                .marca(entity.getMarca())
                .modelo(entity.getModelo())
                .anio(entity.getAnio())
                .clienteId(entity.getCliente() != null ? entity.getCliente().getId() : null)
                .clienteNombre(entity.getCliente() != null ? entity.getCliente().getNombres() : null)
                .build();
    }
}
