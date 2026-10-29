package pe.edu.upeu.autoandes.service;

import pe.edu.upeu.autoandes.dto.request.ServicioRequestDTO;
import pe.edu.upeu.autoandes.dto.response.ServicioResponseDTO;

import java.util.List;

public interface ServicioService {
    List<ServicioResponseDTO> listarTodos();
    ServicioResponseDTO buscarPorId(Long id);
    ServicioResponseDTO crear(ServicioRequestDTO request);
    ServicioResponseDTO actualizar(Long id, ServicioRequestDTO request);
    void eliminar(Long id);
    ServicioResponseDTO cambiarEstado(Long id);
}
