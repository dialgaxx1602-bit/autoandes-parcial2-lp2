package pe.edu.upeu.autoandes.service;

import pe.edu.upeu.autoandes.dto.request.VehiculoRequestDTO;
import pe.edu.upeu.autoandes.dto.response.VehiculoResponseDTO;

import java.util.List;

public interface VehiculoService {
    List<VehiculoResponseDTO> listar(Long clienteId);
    VehiculoResponseDTO buscarPorId(Long id);
    VehiculoResponseDTO crear(VehiculoRequestDTO request);
    VehiculoResponseDTO actualizar(Long id, VehiculoRequestDTO request);
    void eliminar(Long id);
}
