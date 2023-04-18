package com.a307.ifIDieTomorrow.domain.service;

import com.a307.ifIDieTomorrow.domain.dto.diary.DiaryCreateReqDto;
import com.a307.ifIDieTomorrow.domain.dto.diary.DiaryCreateResDto;
import com.a307.ifIDieTomorrow.domain.entity.Diary;
import com.a307.ifIDieTomorrow.domain.repository.UserRepository;
import com.a307.ifIDieTomorrow.global.exception.NotFoundException;
import com.a307.ifIDieTomorrow.global.util.S3Upload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiaryServiceImpl implements DiaryService{

	private final S3Upload s3Upload;
	private final UserRepository userRepository;

	@Override
	public DiaryCreateResDto createDiary(DiaryCreateReqDto req, MultipartFile photo) throws IOException, NotFoundException {

//		이후 jwt 적용 시 해당 부분은 생략합니다. (유저아이디는 토큰에서 받아옴)
		if (userRepository.existsByUserId(req.getUserId())) throw new NotFoundException("존재하지 않는 유저입니다.");

		return DiaryCreateResDto.toDto(Diary.builder()
						.title(req.getTitle())
						.content(req.getContent())
						.secret(req.getSecret())
						.imageUrl(req.getHasPhoto() ? s3Upload.uploadFiles(photo, "diary") : "")
						.build()
		);
	}
}
