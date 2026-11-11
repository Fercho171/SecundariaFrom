package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.LoginRequest;
import mx.edu.secundaria.asistencia.dto.LoginResponse;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.User;
import mx.edu.secundaria.asistencia.repository.UserRepository;
import mx.edu.secundaria.asistencia.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String username = request.username().trim().toLowerCase();
        User user = userRepository.findByUsernameIgnoreCase(username)
            .or(() -> userRepository.findByEmailIgnoreCase(username))
            .orElseThrow(() -> ApiException.unauthorized("Usuario o contraseña incorrectos."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Usuario o contraseña incorrectos.");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, Mappers.user(user));
    }
}
