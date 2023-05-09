import React, { useState, ChangeEvent, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import requests from '../../api/config';
import { defaultApi } from '../../api/axios';
import { useRecoilValue } from 'recoil';
import { useRecoilState } from 'recoil';
import { userState } from '../../states/UserState';
import BottomModal from '../../components/profile/MyPageModal';
import UserInfo from '../../components/profile/UserInfo';
import ServiceAgreeModal from '../../components/profile/ServiceAgreeModal';
import {
  Background,
  Container,
  SettingBox,
  RadioContainer,
  RadioButtonLabel,
  RadioButton,
  InputRow,
  Receiver,
  StyledButton,
  IconWithText,
  IconContainer,
} from './MyPageEmotion';

function MyPage() {
  const [serviceEnabled, setServiceEnabled] = useState(true);
  const [receiverDisabled, setReceiverDisabled] = useState(false);
  const [isBottomModalOpen, setIsBottomModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [serviceConsent, setServiceConsent] = useState(false);
  const user = useRecoilValue(userState);
  const [userId, setUserId] = useState<number | null>(null);
  const sendAgree = user?.sendAgree;
  const [consent, setConsent] = useState<string | null>(
    sendAgree ? 'agree' : 'disagree',
  );

  // 서비스 동의 모달에서 제출된 데이터 처리하는 함수
  const handleSubmitFromModal = async (submittedData: {
    phone: string;
    serviceConsent: boolean;
  }) => {
    setPhone(submittedData.phone);
    setServiceConsent(submittedData.serviceConsent);
    setConsent(submittedData.serviceConsent ? 'agree' : 'disagree');
    setSubmitted(true);
    // PATCH_AGREEMENT API 호출
    if (submittedData.serviceConsent && userId) {
      const patchData = {
        agree: true,
        phone: submittedData.phone,
      };

      try {
        await defaultApi.patch(
          `${requests.PATCH_AGREEMENT()}?userId=${userId}`,
          patchData,
          {
            withCredentials: true,
          },
        );
        if (user) {
          user.sendAgree = true;
        }
      } catch (error) {
        console.error('Failed to update agreement:', error);
      }
    }
  };

  // 모달 열고 닫기
  const openBottomModal = () => {
    setIsBottomModalOpen(true);
  };
  const onLogoutClose = () => {
    setIsBottomModalOpen(false);
  };

  // 동의 여부 변경에 대한 처리
  const handleConsentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setConsent(event.target.value);
    if (event.target.value === 'disagree') {
      setReceiverDisabled(true);
    } else {
      setReceiverDisabled(false);
    }

    // 조건문으로 동의와 비동의 상황을 나누어 처리
    if (event.target.value === 'agree' && submitted) {
      // 동의 상태이고 모달에서 확인을 눌렀을 때 호출되는 경우
      const patchData = {
        agree: true,
        phone,
      };

      try {
        await defaultApi.patch(
          `${requests.PATCH_AGREEMENT()}?userId=${userId}`,
          patchData,
          {
            withCredentials: true,
          },
        );
      } catch (error) {
        console.error('Failed to update agreement:', error);
      }
    } else if (event.target.value === 'disagree') {
      // 비동의 상태일 때 호출되는 경우
      const patchData = {
        agree: false,
        phone,
      };

      try {
        await defaultApi.patch(
          `${requests.PATCH_AGREEMENT()}?userId=${userId}`,
          patchData,
          {
            withCredentials: true,
          },
        );
      } catch (error) {
        console.error('Failed to update agreement:', error);
      }
    }
  };

  // userId, sendAgree값이 변경되면 실행되는 useEffect
  useEffect(() => {
    if (user) {
      setUserId(user.userId);
      setConsent(user.sendAgree ? 'agree' : 'disagree');
    }
    console.log('sendAgree:', sendAgree);
  }, [user, sendAgree]);

  // 리시버 관련 state 정의
  const [receivers, setReceivers] = useState([{ name: '', phone: '' }]);
  const handleReceiverChange = (
    index: number,
    field: keyof { name: string; phone: string },
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newReceivers = [...receivers];
    newReceivers[index][field] = event.target.value;
    setReceivers(newReceivers);
  };

  const [receiverTexts, setReceiverTexts] = useState<
    Array<{
      receiverId: number;
      name: string;
      phone: string;
    }>
  >([]);

  // 리시버 추가 및 조회 관련 API 호출 함수 정의
  // 리시버 추가 API
  const addReceiverToAPI = async (receiver: {
    name: string;
    phone: string;
  }) => {
    try {
      const response = await defaultApi.post(
        requests.POST_RECEIVER(),
        {
          name: receiver.name,
          phoneNumber: receiver.phone,
        },
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add receiver:', error);
      return null;
    }
  };

  // 새 리시버를 추가하고 API에 저장
  const addReceiver = async () => {
    const lastIndex = receivers.length - 1;
    const lastReceiver = receivers[lastIndex];

    if (lastReceiver.name.trim() !== '' && lastReceiver.phone.trim() !== '') {
      const addedReceiver = await addReceiverToAPI(lastReceiver);
      if (addedReceiver) {
        setReceiverTexts([
          ...receiverTexts,
          {
            receiverId: addedReceiver.receiverId,
            name: `이름: ${addedReceiver.name}`,
            phone: `전화번호: ${addedReceiver.phoneNumber}`,
          },
        ]);
        setReceivers([
          ...receivers.slice(0, lastIndex),
          { name: '', phone: '' },
        ]);
      }
    } else {
      alert('이름, 이메일, 전화번호를 모두 입력해주세요.');
    }
  };

  // 추가된 리시버 조회
  const getReceiversFromAPI = async (): Promise<Array<{
    receiverId: number;
    name: string;
    phoneNumber: string;
  }> | null> => {
    try {
      const response = await defaultApi.get(requests.GET_RECEIVER(), {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get receivers:', error);
      return null;
    }
  };

  // 컴포넌트가 마운트될 때 리시버 목록을 가져오기
  useEffect(() => {
    const fetchReceivers = async () => {
      const fetchedReceivers = await getReceiversFromAPI();
      if (fetchedReceivers) {
        setReceiverTexts(
          fetchedReceivers.map((receiver) => ({
            receiverId: receiver.receiverId,
            name: `이름: ${receiver.name}`,
            phone: `전화번호: ${receiver.phoneNumber}`,
          })),
        );
      }
    };

    fetchReceivers();
  }, []);

  // 리시버 삭제하기
  const deleteReceiverFromAPI = async (receiverId: number) => {
    try {
      const response = await defaultApi.delete(
        requests.DELETE_RECEIVER(receiverId),
        {
          withCredentials: true,
        },
      );
      const deletedReceiver = response.data;

      // 삭제된 리시버를 제외한 새로운 리시버 목록 가져오기
      const newReceivers = await getReceiversFromAPI();
      if (newReceivers) {
        setReceiverTexts(
          newReceivers.map((receiver) => ({
            receiverId: receiver.receiverId,
            name: `이름: ${receiver.name}`,
            phone: `전화번호: ${receiver.phoneNumber}`,
          })),
        );
      }
      return deletedReceiver;
    } catch (error) {
      console.error('Failed to delete receiver:', error);
      throw error;
    }
  };

  // 각 리시버 입력 필드에 대한 참조를 생성
  const inputRefs = receivers.map(() => ({
    name: React.createRef<HTMLInputElement>(),
    phone: React.createRef<HTMLInputElement>(),
  }));

  // 입력된 리시버를 저장하고 유효하지 않은 리시버가 있는 경우 입력에 초점
  const validateReceivers = () => {
    let invalidIndex = -1;
    const validReceivers = [];

    for (let index = 0; index < receivers.length; index++) {
      const receiver = receivers[index];
      const isValid = Object.values(receiver)
        .filter((value) => typeof value === 'string')
        .every((value) => (value as string).trim() !== '');

      if (isValid) {
        validReceivers.push({
          receiverId: receiverTexts[index].receiverId,
          name: receiver.name,
          phone: receiver.phone,
        });
      } else if (invalidIndex === -1) {
        invalidIndex = index;
      }
    }
    return { validReceivers, invalidIndex };
  };

  const createNewReceiverTexts = (validReceivers: any) =>
    validReceivers.map((receiver: any) => ({
      receiverId: receiver.receiverId,
      name: `이름: ${receiver.name}`,
      phone: `전화번호: ${receiver.phone}`,
    }));

  const focusOnInvalidReceiver = (invalidIndex: any) => {
    if (invalidIndex !== -1) {
      const invalidReceiver = receivers[invalidIndex];
      const emptyField = Object.keys(invalidReceiver).find(
        (field) =>
          invalidReceiver[field as keyof typeof invalidReceiver].trim() === '',
      );
      if (emptyField) {
        inputRefs[invalidIndex][
          emptyField as keyof (typeof inputRefs)[0]
        ].current?.focus();
      }
    }
  };

  const updateReceivers = (validReceivers: any) => {
    const newReceivers = receivers
      .map((receiver, index) => ({
        receiverId: receiverTexts[index].receiverId,
        ...receiver,
      }))
      .filter((receiver, index) => !validReceivers.includes(receiver));

    if (newReceivers.length === 0) {
      newReceivers.push({
        receiverId: receiverTexts.length,
        name: '',
        phone: '',
      });
    }
    setReceivers(newReceivers);
  };

  const updateUserAgreement = async () => {
    if (consent === 'agree') {
      const patchData = {
        agree: true,
        phone,
      };

      try {
        await defaultApi.patch(
          `${requests.PATCH_AGREEMENT()}?userId=${userId}`,
          patchData,
          {
            withCredentials: true,
          },
        );
      } catch (error) {
        console.error('Failed to update agreement:', error);
      }
    }
  };

  // 입력된 리시버를 저장하고 유효하지 않은 리시버가 있는 경우 입력에 초점
  const handleSave = async () => {
    const { validReceivers, invalidIndex } = validateReceivers();
    const newReceiverTexts = createNewReceiverTexts(validReceivers);
    setReceiverTexts([
      ...receiverTexts,
      ...newReceiverTexts.slice(0, 3 - receiverTexts.length),
    ]);
    window.location.reload();
    focusOnInvalidReceiver(invalidIndex);
    updateReceivers(validReceivers);
    await updateUserAgreement();
  };

  // 인덱스에 해당하는 리시버를 삭제하고 API 요청을 실행하는 함수
  const handleDelete = async (index: number) => {
    const receiverToDelete = receiverTexts[index];
    try {
      const deletedReceiver = await deleteReceiverFromAPI(
        receiverToDelete.receiverId,
      );
      if (deletedReceiver) {
        const fetchedReceivers = await getReceiversFromAPI();
        if (fetchedReceivers) {
          setReceiverTexts(
            fetchedReceivers.map((receiver) => ({
              receiverId: receiver.receiverId,
              name: `이름: ${receiver.name}`,
              phone: `전화번호: ${receiver.phoneNumber}`,
            })),
          );
        }
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete receiver');
    }
  };

  return (
    <div>
      {showModal && (
        <ServiceAgreeModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitFromModal}
        />
      )}
      {isBottomModalOpen ? (
        <BottomModal onClose={onLogoutClose} children="생존 여부 알림" />
      ) : null}
      <Background>
        <Container>
          <UserInfo />

          <SettingBox>
            <h3 className="text-h4">사후 전송 서비스 설정</h3>

            <IconWithText>
              <h4>생존 여부 알림</h4>
              <Icon
                icon="line-md:question-circle-twotone"
                onClick={openBottomModal}
              />
            </IconWithText>
            <RadioContainer>
              <RadioButtonLabel>
                동의
                <RadioButton
                  name="consent"
                  value="agree"
                  checked={consent === 'agree'}
                  onChange={handleConsentChange}
                  onClick={() => setShowModal(true)}
                  disabled={!serviceEnabled}
                />
              </RadioButtonLabel>
              <RadioButtonLabel>
                비동의
                <RadioButton
                  name="consent"
                  value="disagree"
                  checked={consent === 'disagree'}
                  onChange={handleConsentChange}
                  disabled={!serviceEnabled}
                />
              </RadioButtonLabel>
            </RadioContainer>
            {submitted && (
              <div
                style={{
                  color: receiverDisabled ? '#A9A9A9' : 'inherit',
                }}
              >
                <p className="text-p1">전화번호: {phone}</p>
                <p className="text-p1" style={{ fontSize: '0.8rem' }}>
                  개인정보 이용 및 수집에 동의하셨습니다.
                </p>
                <br />
              </div>
            )}
            <IconWithText>
              <h4>내 기록 받아볼 사람</h4>
              <Icon
                icon="line-md:question-circle-twotone"
                onClick={openBottomModal}
              />
            </IconWithText>
            {receivers &&
              receivers.map(
                (receiver, index) =>
                  receiverTexts.length < 3 && (
                    <InputRow key={index}>
                      <input
                        type="text"
                        placeholder="이름"
                        ref={inputRefs[index].name}
                        value={receiver.name}
                        onChange={(e) => handleReceiverChange(index, 'name', e)}
                        disabled={!serviceEnabled || receiverDisabled}
                      />

                      <input
                        type="tel"
                        placeholder="전화번호"
                        ref={inputRefs[index].phone}
                        value={receiver.phone}
                        onChange={(e) =>
                          handleReceiverChange(index, 'phone', e)
                        }
                        disabled={!serviceEnabled || receiverDisabled}
                      />
                    </InputRow>
                  ),
              )}
            {receiverTexts &&
              receiverTexts.map((text, index) => (
                <Receiver
                  key={index}
                  style={{
                    color: receiverDisabled ? '#A9A9A9' : 'inherit',
                  }}
                >
                  <div>
                    <p>{text.name}</p>

                    <p>{text.phone}</p>
                  </div>
                  <Icon
                    icon="line-md:remove"
                    onClick={() => handleDelete(index)}
                    style={{ cursor: 'pointer' }}
                  />
                </Receiver>
              ))}
            {receivers.length < 3 && receiverTexts.length < 3 && (
              <IconContainer>
                <Icon icon="line-md:plus-circle" onClick={addReceiver} />
              </IconContainer>
            )}
            <StyledButton color="#FFA9A9" size="sm" onClick={handleSave}>
              저장
            </StyledButton>
          </SettingBox>
        </Container>
      </Background>
    </div>
  );
}

export default MyPage;
