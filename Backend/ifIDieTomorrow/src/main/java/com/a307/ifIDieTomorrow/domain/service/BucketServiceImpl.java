package com.a307.ifIDieTomorrow.domain.service;

import com.a307.ifIDieTomorrow.domain.dto.bucket.CreateBucketDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.CreateBucketResDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.GetBucketByUserResDto;
import com.a307.ifIDieTomorrow.domain.dto.bucket.UpdateBucketDto;
import com.a307.ifIDieTomorrow.domain.entity.Bucket;
import com.a307.ifIDieTomorrow.domain.repository.BucketRepository;
import com.a307.ifIDieTomorrow.domain.repository.CommentRepository;
import com.a307.ifIDieTomorrow.domain.repository.UserRepository;
import com.a307.ifIDieTomorrow.global.exception.IllegalArgumentException;
import com.a307.ifIDieTomorrow.global.exception.NoPhotoException;
import com.a307.ifIDieTomorrow.global.exception.NotFoundException;
import com.a307.ifIDieTomorrow.global.util.S3Upload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BucketServiceImpl implements BucketService {
	
	private final String BUCKET = "bucket";
	
	private final S3Upload s3Upload;
	
	private final UserRepository userRepository;
	
	private final BucketRepository bucketRepository;
	
	private final CommentRepository commentRepository;
	
	@Override
	public CreateBucketResDto createBucket (CreateBucketDto data, MultipartFile photo) throws IOException, NoPhotoException, IllegalArgumentException {
//		사진 검증
		if (data.getHasPhoto() && photo.isEmpty()) throw new NoPhotoException("사진이 업로드 되지 않았습니다.");
		
		Bucket bucket = Bucket.builder().
				userId(data.getUserId()).
				title(data.getTitle()).
				content(data.getContent()).
				complete(data.getComplete()).
				imageUrl(data.getHasPhoto() ? s3Upload.uploadFiles(photo, BUCKET) : "").
				secret(data.getSecret()).
				build();
		
		return CreateBucketResDto.toDto(bucketRepository.save(bucket));
	}
	
	@Override
	public List<GetBucketByUserResDto> getBucketByUserId (Long userId) throws NotFoundException {
		if (!userRepository.existsByUserId(userId)) throw new NotFoundException("존재하지 않는 유저입니다.");
		
		return bucketRepository.findAllByUserId(userId);
	}
	
	@Override
	public HashMap<String, Object> getBucketByBucketId (Long bucketId) throws NotFoundException {
		return bucketRepository.findByBucketIdWithUserNickName(bucketId)
				.map(dto -> {
//					버킷 리스트의 내용과 댓글을 해쉬맵 형태로 반환합니다.
					HashMap<String, Object> result  = new HashMap<>();
					result.put(BUCKET, dto);
					result.put("comments", commentRepository.findCommentsByTypeId(bucketId, true));
					
					return result;
				})
				.orElseThrow(() -> new NotFoundException("잘못된 버킷 리스트 ID 입니다!"));
	}
	
	@Override
	public CreateBucketResDto updateBucket (UpdateBucketDto data, MultipartFile photo) throws NotFoundException {
		Bucket bucket = bucketRepository.findByBucketId(data.getBucketId())
				.orElseThrow(() -> new NotFoundException("존재하지 않는 버킷 ID 입니다."));
		
		try {
			// 사진이 업데이트되었고 기존에 사진이 있었다면 S3에서 사진을 삭제함
			if (data.getUpdatePhoto() && !"".equals(bucket.getImageUrl())) s3Upload.fileDelete(bucket.getImageUrl());
			bucket.updateBucket(
					data.getTitle(),
					data.getContent(),
					data.getComplete(),
					data.getUpdatePhoto() && photo != null ? s3Upload.uploadFiles(photo, BUCKET) : "",
					data.getSecret()
			);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return CreateBucketResDto.toDto(bucketRepository.save(bucket));
	}
	
	@Override
	public Long deleteBucket (Long bucketId) throws NotFoundException {
		Bucket bucket = bucketRepository.findByBucketId(bucketId)
				.orElseThrow(() -> new NotFoundException("존재하지 않는 버킷 ID 입니다."));
		
		// 사진이 있었다면 S3에서 사진을 삭제함
		if (!"".equals(bucket.getImageUrl())) s3Upload.fileDelete(bucket.getImageUrl());

		// 댓글 삭제
		commentRepository.deleteAllInBatch(commentRepository.findAllByTypeIdAndType(bucketId, false));
		
		// 버킷 삭제
		bucketRepository.delete(bucket);
		
		return bucketId;
	}
	
}