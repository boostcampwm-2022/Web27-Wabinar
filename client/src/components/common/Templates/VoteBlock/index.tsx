import { BiX } from '@react-icons/all-files/bi/BiX';
import classNames from 'classnames/bind';
import Button from 'common/Button';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { VOTE_MODE } from 'src/constants/block';
import SOCKET_MESSAGE from 'src/constants/socket-message';
import useDebounceInput from 'src/hooks/useDebounceInput';
import useSelectedMom from 'src/hooks/useSelectedMom';
import useSocketContext from 'src/hooks/useSocketContext';
import { useUserContext } from 'src/hooks/useUserContext';
import { Option, VoteMode } from 'src/types/block';

import style from './style.module.scss';

const cx = classNames.bind(style);

interface VoteBlockProps {
  mode: VoteMode;
  setVoteMode: React.Dispatch<React.SetStateAction<VoteMode | null>>;
  options: Option[];
  setOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}

function VoteBlockTemplate({
  mode,
  setVoteMode,
  options,
  setOptions,
}: VoteBlockProps) {
  const [isCreateMode, isRegisteredMode, isEndMode] = [
    mode === VOTE_MODE.CREATE,
    mode === VOTE_MODE.REGISTERED,
    mode === VOTE_MODE.END,
  ];

  const { user } = useUserContext();
  const { momSocket: socket } = useSocketContext();
  const { selectedMom } = useSelectedMom();

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  const debouncedSetOptions = useDebounceInput(setOptions);

  const getNextId = () => {
    const lastId = options.at(-1)?.id;
    return lastId !== undefined ? lastId + 1 : 0;
  };

  const getIsDuplicate = (arr: string[]) => {
    return new Set(arr).size !== arr.length;
  };

  const onRegister = () => {
    const validOptions = options.filter(({ text }) => text);
    if (!validOptions.length) {
      return toast('투표 항목은 최소 1개에요 ^^', { type: 'info' });
    }

    const isDuplicate = getIsDuplicate(validOptions.map(({ text }) => text));
    if (isDuplicate) {
      return toast('중복된 항목이 있어요 ^^', { type: 'info' });
    }

    setOptions(validOptions);
    setVoteMode('registered');

    socket.emit(SOCKET_MESSAGE.MOM.CREATE_VOTE, selectedMom?._id, validOptions);

    toast('투표 등록 완료 ^^', { type: 'info' });
  };

  const onAdd = () => {
    const nextId = getNextId();
    const newOption: Option = { id: nextId, text: '', count: 0 };
    setOptions([...options, newOption]);
  };

  const onDelete = (targetId: number) => {
    const filteredOptions = options.filter(
      (option) => option.id !== Number(targetId),
    );

    setOptions(filteredOptions);
  };

  const onEnd = () => {
    socket.emit(SOCKET_MESSAGE.MOM.END_VOTE, selectedMom?._id);
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { id } = target.dataset;
    const value = target.value;

    const newOption = options.map((option) => {
      if (option.id === Number(id)) {
        return { ...option, text: value };
      }
      return option;
    });

    debouncedSetOptions(newOption);
  };

  const onSelect = (targetId: number) => {
    if (!isRegisteredMode) return;

    setSelectedOptionId(targetId);

    socket.emit(
      SOCKET_MESSAGE.MOM.UPDATE_VOTE,
      selectedMom?._id,
      targetId,
      user?.id,
    );
  };

  useEffect(() => {
    socket.on(SOCKET_MESSAGE.MOM.UPDATE_VOTE, (participantCount) => {
      setParticipantCount(participantCount);
    });

    socket.on(SOCKET_MESSAGE.MOM.END_VOTE, ({ options, participantCount }) => {
      setVoteMode('end');
      setOptions(options);
      setParticipantCount(participantCount);
      toast('투표가 종료되었어요 ^^');
    });

    return () => {
      socket.off(SOCKET_MESSAGE.MOM.UPDATE_VOTE);
      socket.off(SOCKET_MESSAGE.MOM.END_VOTE);
    };
  }, [setParticipantCount]);

  return (
    <div className={style['vote-container']}>
      <h3 className={style.title}>투표</h3>
      {(isRegisteredMode || isEndMode) && (
        <span className={style['participant-cnt']}>
          {participantCount}명 참여
        </span>
      )}

      <ul>
        {options.map(({ id, text }, index) => (
          <li
            className={cx('option-item', {
              'selected-item':
                (isRegisteredMode || isEndMode) && id === selectedOptionId,
            })}
            key={id}
            onClick={() => onSelect(id)}
          >
            <div className={style['box-fill']}>{index + 1}</div>
            <input
              type="text"
              className={cx('option-input', {
                selected: isRegisteredMode,
              })}
              placeholder="항목을 입력해주세요"
              onChange={onChange}
              data-id={id}
              readOnly={isRegisteredMode || isEndMode}
              defaultValue={text}
            />
            {isCreateMode && (
              <Button
                icon={<BiX size="20" color="white" />}
                ariaLabel="항목 삭제"
                onClick={() => onDelete(id)}
              />
            )}
          </li>
        ))}
      </ul>

      <div className={style['vote-buttons']}>
        {isCreateMode && (
          <>
            <Button onClick={onAdd} text="항목 추가" />
            <Button onClick={onRegister} text="투표 등록" />
          </>
        )}
        {isRegisteredMode && <Button onClick={onEnd} text="투표 종료" />}
        {isEndMode && <Button text="투표 초기화" />}
      </div>
    </div>
  );
}

export default VoteBlockTemplate;
