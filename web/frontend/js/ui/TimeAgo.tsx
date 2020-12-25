import React, { useEffect, useState } from 'react';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import koLocale from 'date-fns/locale/ko';

type Props = {
  time: Date;
};

export function TimeAgo(props: Props) {
  const [relativeTime, setRelativeTime] = useState<string>(() => distanceInWordsToNow(props.time, {
    addSuffix: true,
    locale: koLocale,
  }));
  useEffect(() => {
    const handle = setInterval(() => setRelativeTime(distanceInWordsToNow(props.time, {
      addSuffix: true,
      locale: koLocale,
    })), 60 * 1000);
    return () => clearInterval(handle);
  }, []);

  // Store title in state to workaround difference between server and client
  const [title, setTitle] = useState<string>();
  useEffect(() => {
    setTitle(new Date(props.time).toLocaleString());
  }, [props.time]);

  return <span title={title}>{relativeTime}</span>;
}
