import { memo, useEffect, useRef } from 'react';
import { TREE_FINAL_SIZE, TREE_STARTING_SIZE } from './Tree.tsx';

const ListItem = memo(function ListItem({ children, id, highestIdShown, timePeriod, lastTimePeriodId }: ListItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const isFocused = id === highestIdShown;
  const isLatestOfLastTimePeriod = id === lastTimePeriodId;
  const reduceOpacity = !isFocused;

  useEffect(() => {
    const el = itemRef.current;
    if (el) {
      if (reduceOpacity) {
        el.classList.add('opacity-50');
      } else {
        el.classList.remove('opacity-50');
      }
    }
  }, [reduceOpacity]);

  return (
    <li ref={itemRef} className={`transition-opacity duration-500 ease-out`}>
      {isFocused && <h4>{timePeriodStrings[timePeriod]}</h4>}
      {isLatestOfLastTimePeriod && <h4>Previous</h4>}
      {children}
    </li>
  );
});

export function Copy({ treeSize }: CopyProps) {
  const messagesRecentFirst = getMessages();
  const progress = treeSizeToScrollProgress(treeSize);
  const shown = messagesRecentFirst.filter((v) => progress > v.progressTrigger);
  const highestIdShown = shown[0]?.orderId || 0;
  const latestIdOfPenultimateTimePeriod = shown.find((m) => m.timePeriod === shown[0].timePeriod - 1)?.orderId || -1;

  return (
    <div className={`fixed w-full max-w-[700px] top-[500px]`} style={{ top: 'min(500px, 60vh)' }}>
      <ol>
        {messagesRecentFirst.map(({ Msg, progressTrigger, orderId, timePeriod }, i) => {
          const show = progress > progressTrigger;
          return (
            show && (
              <ListItem
                key={i}
                id={orderId}
                highestIdShown={highestIdShown}
                timePeriod={timePeriod}
                show={show}
                lastTimePeriodId={latestIdOfPenultimateTimePeriod}
              >
                <Msg />
              </ListItem>
            )
          );
        })}
      </ol>
    </div>
  );
}

interface ListItemProps {
  children: React.ReactNode;
  id: number;
  highestIdShown: number;
  timePeriod: TimePeriod;
  show: boolean;
  lastTimePeriodId: number;
}

interface CopyProps {
  treeSize: number;
}

const treeSizeToScrollProgress = (size: number): number => {
  /*
   * Infer our progress from the current tree size
   */
  const treeSizeRange = TREE_FINAL_SIZE - TREE_STARTING_SIZE;
  const currentSizeDelta = size - TREE_STARTING_SIZE;
  return currentSizeDelta / treeSizeRange;
};

enum TimePeriod {
  MTL = 0,
  EARLY_CW = 1,
  PRESENT = 2,
}

const timePeriodStrings: Record<TimePeriod, string> = {
  [TimePeriod.MTL]: '~2021—2022',
  [TimePeriod.EARLY_CW]: '~2022—2023',
  [TimePeriod.PRESENT]: '~2023—Present',
};

interface Message {
  orderId: number;
  timePeriod: TimePeriod;
  Msg: React.ComponentType;
  progressTrigger: number;
}

const getMessages = (): Array<Message> => {
  return messagesBase
    .map((v, i) => {
      return { ...v, orderId: i };
    })
    .reverse();
};

const messagesBase: Array<Omit<Message, 'orderId'>> = [
  {
    timePeriod: TimePeriod.MTL,
    Msg: () => (
      <p>
        After completing <a href="https://www.theodinproject.com/">The Odin Project</a>, I started my first software
        position at <a href="https://mtlcorp.com/">Measurement Technology Laboratories</a>. Our software controlled
        robotics and processed data using LabVIEW and SQL.
      </p>
    ),
    progressTrigger: 0.15,
  },
  {
    timePeriod: TimePeriod.MTL,
    Msg: () => (
      <p>
        This position gave me my first experiences <strong>working with clients</strong> and{' '}
        <strong>delivering value in new technologies</strong>.
      </p>
    ),
    progressTrigger: 0.3,
  },
  {
    timePeriod: TimePeriod.EARLY_CW,
    Msg() {
      return (
        <p>
          My next position came at <a href="https://www.clockwork.com/">Clockwork</a>. Early on, the role was about
          getting experience with <strong>agile</strong> and <strong>cross-discipline collaboration</strong>.
        </p>
      );
    },
    progressTrigger: 0.45,
  },
  {
    timePeriod: TimePeriod.EARLY_CW,
    Msg() {
      return (
        <p>
          I built a lot with <strong>React</strong>, gained experience with new frameworks like <strong>Vue</strong> and{' '}
          <strong>Craft CMS (PHP)</strong>, and got comfortable with{' '}
          <strong>pipelines, deployments, and infrastructure</strong>.
        </p>
      );
    },
    progressTrigger: 0.6,
  },
  {
    timePeriod: TimePeriod.PRESENT,
    Msg: () => (
      <p>
        From 2023 until now, my role at Clockwork has shifted toward{' '}
        <strong>designing maintainable and scalable solutions</strong> for <strong>larger proects</strong>. I have loved
        solving hard problems on big teams building complex apps by implementing well-designed patterns.
      </p>
    ),
    progressTrigger: 0.8,
  },
  {
    timePeriod: TimePeriod.PRESENT,
    Msg: () => (
      <p>
        On the tech side, I use mainly <strong>Angular</strong> and <strong>React</strong> alongside{' '}
        <strong>Strapi CMS (Node)</strong>, <strong>Java Spring Boot</strong>, and <strong>Postgres</strong>.
      </p>
    ),
    progressTrigger: 0.95,
  },
];
