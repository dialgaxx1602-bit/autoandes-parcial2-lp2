package pe.edu.upeu.autoandes.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.autoandes.dto.request.VehiculoRequestDTO;
import pe.edu.upeu.autoandes.dto.response.VehiculoResponseDTO;
import pe.edu.upeu.autoandes.entity.Cliente;
import pe.edu.upeu.autoandes.entity.Vehiculo;
import pe.edu.upeu.autoandes.exception.BusinessRuleException;
import pe.edu.upeu.autoandes.exception.ResourceNotFoundException;
import pe.edu.upeu.autoandes.mapper.VehiculoMapper;
import pe.edu.upeu.autoandes.repository.ClienteRepository;
import pe.edu.upeu.autoandes.repository.OrdenServicioRepository;
import pe.edu.upeu.autoandes.repository.VehiculoRepository;
import pe.edu.upeu.autoandes.service.VehiculoService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VehiculoServiceImpl implements VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final ClienteRepository clienteRepository;
    private final OrdenServicioRepository ordenServicioRepository;
    private final VehiculoMapper vehiculoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<VehiculoResponseDTO> listar(Long clienteId) {
        List<Vehiculo> lista = (clienteId != null)
                ? vehiculoRepository.findByClienteId(clienteId)
                : vehiculoRepository.findAll();

        return lista.stream()
                .map(vehiculoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehiculoResponseDTO buscarPorId(Long id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado con id: " + id));
        return vehiculoMapper.toResponseDTO(vehiculo);
    }

    @Override
    public VehiculoResponseDTO crear(VehiculoRequestDTO request) {
        
        if (vehiculoRepository.existsByPlaca(request.getPlaca())) {
            throw new BusinessRuleException("La placa ya está registrada: " + request.getPlaca());
        }

        
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + request.getClienteId()));

        Vehiculo vehiculo = vehiculoMapper.toEntity(request, cliente);
        Vehiculo guardado = vehiculoRepository.save(vehiculo);

        log.info("Vehículo registrado exitosamente con id: {}, placa: {}", guardado.getId(), guardado.getPlaca());
        return vehiculoMapper.toResponseDTO(guardado);
    }

    @Override
    public VehiculoResponseDTO actualizar(Long id, VehiculoRequestDTO request) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado con id: " + id));

        
        if (vehiculoRepository.existsByPlacaAndIdNot(request.getPlaca(), id)) {
            throw new BusinessRuleException("La placa ya pertenece a otro vehículo: " + request.getPlaca());
        }

        
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + request.getClienteId()));

        vehiculoMapper.updateEntityFromDTO(vehiculo, request, cliente);
        Vehiculo actualizado = vehiculoRepository.save(vehiculo);

        log.info("Vehículo actualizado exitosamente con id: {}, placa: {}", actualizado.getId(), actualizado.getPlaca());
        return vehiculoMapper.toResponseDTO(actualizado);
    }

    @Override
    public void eliminar(Long id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo no encontrado con id: " + id));

        
        if (ordenServicioRepository.existsByVehiculoId(id)) {
            throw new BusinessRuleException("El vehículo tiene órdenes registradas y no puede eliminarse");
        }

        vehiculoRepository.delete(vehiculo);
        log.info("Vehículo eliminado exitosamente con id: {}", id);
    }
}
