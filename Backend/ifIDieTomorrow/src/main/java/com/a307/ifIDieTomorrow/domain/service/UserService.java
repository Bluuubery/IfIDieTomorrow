package com.a307.ifIDieTomorrow.domain.service;

import com.a307.ifIDieTomorrow.domain.dto.UserDto;
import com.a307.ifIDieTomorrow.domain.entity.User;
import com.a307.ifIDieTomorrow.global.auth.OAuth2UserInfo;
import com.a307.ifIDieTomorrow.global.auth.ProviderType;
import com.a307.ifIDieTomorrow.global.exception.NotFoundException;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface UserService extends OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    OAuth2User process(OAuth2UserRequest userRequest, OAuth2User user);
    User createUser(OAuth2UserInfo userInfo, ProviderType providerType);
    User updateUser(User user, OAuth2UserInfo userInfo);

    String generateNickname();

    UserDto getUser(Long userId) throws NotFoundException;
}
