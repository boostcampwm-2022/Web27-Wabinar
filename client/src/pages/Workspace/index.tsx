import WorkspaceList from 'components/WorkspaceList';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkspaceInfo } from 'src/apis/workspace';
import Workspace from 'src/components/Workspace';
import { WorkspaceInfo } from 'src/types/workspace';

function WorkspacePage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);

  const loadWorkspaceInfo = async () => {
    if (id) {
      const workspaceInfo = await getWorkspaceInfo({ id });
      setWorkspace(workspaceInfo);
    }
  };

  useEffect(() => {
    loadWorkspaceInfo();
  }, []);

  return (
    <div>
      <WorkspaceList />
      {workspace && ( // TODO: 임시로 만들었어요
        <Workspace
          name={workspace.name}
          members={workspace.members}
          moms={workspace.moms}
        />
      )}
    </div>
  );
}

export default WorkspacePage;
