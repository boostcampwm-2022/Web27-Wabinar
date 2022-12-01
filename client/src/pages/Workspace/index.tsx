import Workspace from 'components/Workspace';
import WorkspaceList from 'components/WorkspaceList';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConfMediaBar from 'src/components/ConfMediaBar';
import SOCKET_MESSAGE from 'src/constants/socket-message';
import ConfContext from 'src/contexts/conf';
import { SocketContext } from 'src/contexts/socket';
import useSocket from 'src/hooks/useSocket';

import style from './style.module.scss';

function WorkspacePage() {
  const { id } = useParams();
  const [isStart, setIsStart] = useState(false);

  const momSocket = useMemo(() => useSocket(`/sc-workspace/${id}`), [id]);
  const signalingSocket = useMemo(() => useSocket(`/signaling/${id}`), [id]);

  useEffect(() => {
    momSocket.on(SOCKET_MESSAGE.MOM.START, () => {
      setIsStart(true);
    });

    momSocket.on(SOCKET_MESSAGE.MOM.END, () => {
      setIsStart(false);
    });
  }, []);

  return (
    <SocketContext.Provider value={{ momSocket, signalingSocket }}>
      <ConfContext.Provider value={{ isStart, setIsStart }}>
        <div className={style.container}>
          <WorkspaceList />
          <Workspace workspaceId={id} />
          {isStart && <ConfMediaBar />}
        </div>
      </ConfContext.Provider>
    </SocketContext.Provider>
  );
}

export default WorkspacePage;
