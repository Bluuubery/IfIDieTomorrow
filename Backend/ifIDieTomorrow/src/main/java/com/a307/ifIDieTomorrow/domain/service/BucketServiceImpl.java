package com.a307.ifIDieTomorrow.domain.service;

import com.a307.ifIDieTomorrow.domain.dto.bucket.CreateBucketDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.CreateBucketResDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.GetBucketResDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.UpdateBucketDto;
import com.a307.ifIDieTomorrow.domain.entity.Bucket;
import com.a307.ifIDieTomorrow.domain.repository.BucketRepository;
import com.a307.ifIDieTomorrow.domain.repository.UserRepository;
import com.a307.ifIDieTomorrow.global.exception.NotFoundException;
import com.a307.ifIDieTomorrow.global.util.S3Upload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BucketServiceImpl implements BucketService {
	
	private final S3Upload s3Upload;
	
	private final UserRepository userRepository;
	
	private final BucketRepository bucketRepository;
	
	@Override
	public CreateBucketResDto createBucket (MultipartFile photo, CreateBucketDto createBucketDto) throws IOException {
		Bucket bucket = Bucket.builder().
				userId(createBucketDto.getUserId()).
				title(createBucketDto.getTitle()).
				content(createBucketDto.getContent()).
				complete(createBucketDto.getComplete()).
				imageUrl(createBucketDto.getHasPhoto() ? s3Upload.uploadFiles(photo, "bucket") : "").
				secret(createBucketDto.getSecret()).build();
		
		return CreateBucketResDto.toDto(bucketRepository.save(bucket));
	}
	
	@Override
	public List<GetBucketResDto> getBucketByUserId (Long userId) throws NotFoundException {
		if (!userRepository.existsByUserId(userId)) throw new NotFoundException("존재하지 않는 유저입니다.");
		
		return bucketRepository.findAllByUserId(userId);
	}
	
	@Override
	public CreateBucketResDto updateBucket (MultipartFile photo, UpdateBucketDto updateBucketDto) throws NotFoundException {
		Bucket bucket = bucketRepository.findByBucketId(updateBucketDto.getBucketId())
				.orElseThrow(() -> new NotFoundException("존재하지 않는 버킷 ID 입니다."));
		
		try {
			// 사진이 업데이트되었고 기존에 사진이 있었다면 S3에서 사진을 삭제함
			if (updateBucketDto.getUpdatePhoto() && !"".equals(bucket.getImageUrl())) s3Upload.fileDelete(bucket.getImageUrl());
			bucket.updateBucket(
					updateBucketDto.getTitle(),
					updateBucketDto.getContent(),
					updateBucketDto.getComplete(),
					updateBucketDto.getUpdatePhoto() && photo != null ? s3Upload.uploadFiles(photo, "bucket") : "",
					updateBucketDto.getSecret()
			);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return CreateBucketResDto.toDto(bucketRepository.save(bucket));
	}
	
	@Override
	public Long deleteBucket (Long bucketId) throws Exception {
		Bucket bucket = bucketRepository.findByBucketId(bucketId)
				.orElseThrow(() -> new NotFoundException("존재하지 않는 버킷 ID 입니다."));
		
		// 사진이 있었다면 S3에서 사진을 삭제함
		if (!"".equals(bucket.getImageUrl())) s3Upload.fileDelete(bucket.getImageUrl());
		bucketRepository.delete(bucket);
		
		return bucketId;
	}
	
	
}