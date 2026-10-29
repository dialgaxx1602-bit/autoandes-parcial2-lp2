package pe.edu.upeu.autoandes.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.autoandes.dto.response.ClienteResponseDTO;
import pe.edu.upeu.autoandes.entity.Cliente;

@Component
public class ClienteMapper {

    public ClienteResponseDTO toResponseDTO(Cliente cliente) {
        if (cliente == null) return null;
        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .documento(cliente.getDocumento())
                .nombres(cliente.getNombres())
                .telefono(cliente.getTelefono())
                .build();
    }
}
