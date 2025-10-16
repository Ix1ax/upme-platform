package ru.ixlax.profileservice.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import ru.ixlax.profileservice.domain.Profile;
import ru.ixlax.profileservice.exception.custom.ProfileNotFoundException;
import ru.ixlax.profileservice.repository.ProfileRepository;
import ru.ixlax.profileservice.s3.ImageStorageService;
import ru.ixlax.profileservice.service.ProfileService;
import ru.ixlax.profileservice.web.dto.ProfileResponse;
import ru.ixlax.profileservice.web.dto.ProfileUpdateAvatarRequest;
import ru.ixlax.profileservice.web.dto.ProfileUpdateWithoutAvatarRequest;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ImageStorageService imageStorageService;

    @Override
    public ProfileResponse getProfile(UUID userId, String role) {
        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setId(userId);
            profileRepository.save(newProfile);
            return newProfile;
        });
        return ProfileResponse.from(profile, role);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(UUID userId, String role, ProfileUpdateWithoutAvatarRequest request) {

        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setId(userId);
            profileRepository.save(newProfile);
            return newProfile;
        });

        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setCity(request.city());
        profile.setPhone(request.phone());
        profileRepository.saveAndFlush(profile);

        return ProfileResponse.from(profile,role);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfileAvatar(UUID userId, String role, MultipartFile avatar) {
        Profile profile = profileRepository.findById(userId).orElseGet(() -> {
            Profile newProfile = new Profile();
            newProfile.setId(userId);
            profileRepository.save(newProfile);
            return newProfile;
        });

        profile.setAvatarUrl(imageStorageService.upload(avatar));

        profileRepository.saveAndFlush(profile);

        return ProfileResponse.from(profile,role);

    }
}
