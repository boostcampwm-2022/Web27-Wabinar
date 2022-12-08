import { BLOCK_EVENT } from '@wabinar/constants/socket-message';
import { useState, useEffect } from 'react';
import VoteBlockTemplate from 'src/components/common/Templates/VoteBlock';
import { VOTE_MODE } from 'src/constants/block';
import useSocketContext from 'src/hooks/useSocketContext';
import { Option, VoteMode } from 'src/types/block';

interface VoteBlockProps {
  id: string;
}

function VoteBlock({ id }: VoteBlockProps) {
  const { momSocket: socket } = useSocketContext();

  const [voteMode, setVoteMode] = useState<VoteMode>();
  const initialOption: Option[] = [{ id: 1, text: '', count: 0 }];
  const [options, setOptions] = useState<Option[]>(initialOption);

  useEffect(() => {
    socket.on(BLOCK_EVENT.CREATE_VOTE, (options) => {
      setVoteMode(VOTE_MODE.REGISTERED as VoteMode);
      setOptions(options);
    });

    setVoteMode(VOTE_MODE.CREATE);
  }, []);

  return voteMode ? (
    <VoteBlockTemplate
      id={id}
      mode={voteMode}
      setVoteMode={setVoteMode}
      options={options}
      setOptions={setOptions}
    />
  ) : (
    <></>
  );
}

export default VoteBlock;
