package pe.edu.upeu.autoandes.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.dto.request.ServicioRequestDTO;
import pe.edu.upeu.autoandes.dto.response.ServicioResponseDTO;
import pe.edu.upeu.autoandes.entity.Servicio;
import pe.edu.upeu.autoandes.exception.BusinessRuleException;
import pe.edu.upeu.autoandes.exception.ResourceNotFoundException;
import pe.edu.upeu.autoandes.mapper.ServicioMapper;
import pe.edu.upeu.autoandes.repository.OrdenServicioRepository;
import pe.edu.upeu.autoandes.repository.ServicioRepository;
import pe.edu.upeu.autoandes.service.ServicioService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServicioServiceImpl implements ServicioService {

    private final ServicioRepository servicioRepository;
    private final OrdenServicioRepository ordenServicioRepository;
    private final ServicioMapper servicioMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ServicioResponseDTO> listarTodos() {
        return servicioRepository.findAll().stream()
                .map(servicioMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServicioResponseDTO buscarPorId(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con id: " + id));
        return servicioMapper.toResponseDTO(servicio);
    }

    @Override
    public ServicioResponseDTO crear(ServicioRequestDTO request) {
        
        if (servicioRepository.existsByCodigo(request.getCodigo())) {
            throw new BusinessRuleException("El código de servicio ya existe: " + request.getCodigo());
        }

        Servicio servicio = servicioMapper.toEntity(request);
        servicio.setActivo(1);
        Servicio guardado = servicioRepository.save(servicio);

        log.info("Servicio registrado exitosamente con id: {}, codigo: {}", guardado.getId(), guardado.getCodigo());
        return servicioMapper.toResponseDTO(guardado);
    }

    @Override
    public ServicioResponseDTO actualizar(Long id, ServicioRequestDTO request) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con id: " + id));

        
        if (servicioRepository.existsByCodigoAndIdNot(request.getCodigo(), id)) {
            throw new BusinessRuleException("El código de servicio ya pertenece a otro registro: " + request.getCodigo());
        }

        servicioMapper.updateEntityFromDTO(servicio, request);
        Servicio actualizado = servicioRepository.save(servicio);

        log.info("Servicio actualizado exitosamente con id: {}, codigo: {}", actualizado.getId(), actualizado.getCodigo());
        return servicioMapper.toResponseDTO(actualizado);
    }

    @Override
    public void eliminar(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con id: " + id));

        
        if (ordenServicioRepository.existeEnDetallePorServicioId(id)) {
            throw new BusinessRuleException("El servicio está asociado a órdenes registradas y no puede eliminarse físicamente. Utilice PATCH /servicios/" + id + "/estado para darlo de baja.");
        }

        servicioRepository.delete(servicio);
        log.info("Servicio eliminado físicamente con id: {}", id);
    }

    @Override
    public ServicioResponseDTO cambiarEstado(Long id) {
        Servicio servicio = servicioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Servicio no encontrado con id: " + id));

        int nuevoEstado = (servicio.getActivo() == 1) ? 0 : 1;
        servicio.setActivo(nuevoEstado);
        Servicio guardado = servicioRepository.save(servicio);

        log.info("Servicio id: {} cambio su estado activo a: {}", id, nuevoEstado);
        return servicioMapper.toResponseDTO(guardado);
    }
}
