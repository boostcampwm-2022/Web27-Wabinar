import Workspace from 'components/Workspace';
import WorkspaceList from 'components/WorkspaceList';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Route, Routes } from 'react-router-dom';
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
  const workspaceSocket = useMemo(() => useSocket(`/workspace/${id}`), [id]);

  useEffect(() => {
    workspaceSocket.on(SOCKET_MESSAGE.WORKSPACE.START_MEETING, () => {
      setIsStart(true);
    });

    workspaceSocket.on(SOCKET_MESSAGE.WORKSPACE.END_MEETING, () => {
      setIsStart(false);
    });
  }, []);

  return (
    <Routes>
      <Route
        path="/:id"
        element={
          <SocketContext.Provider value={{ momSocket, workspaceSocket }}>
            <ConfContext.Provider value={{ isStart, setIsStart }}>
              <div className={style.container}>
                <WorkspaceList />
                <Workspace workspaceId={id} />
                {isStart && <ConfMediaBar />}
              </div>
            </ConfContext.Provider>
          </SocketContext.Provider>
        }
      />
      <Route path="/" element={<div>만들어질 예정인 예외 페이지</div>} />
    </Routes>
  );
}

export default WorkspacePage;
