'use client';

import { usePracticeData } from '../../practice-data';
import Workspace from '../../workspace';
import Icon from '../../icons';

export default function ProblemPage({ problem }) {
  const { data, update, toggle } = usePracticeData();
  return <Workspace problem={problem} data={data} update={update} toggle={toggle} Icon={Icon} />;
}
